"""Integration tests against actual HTTP endpoints and SQLite restores."""
import http.cookiejar
import json
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import HTTPCookieProcessor, Request, build_opener

from server import Server, SUBJECT, connection, key_hash


class BlackoutIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.server = Server(("127.0.0.1", 0), cls.temp.name)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.temp.cleanup()

    def setUp(self):
        self.client = build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.call("/api/state")

    def call(self, path, body=None, expected_status=200):
        req = Request(self.base + path, data=None if body is None else json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        try:
            response = self.client.open(req, timeout=8)
        except HTTPError as exc:
            response = exc
        self.assertEqual(response.code, expected_status)
        with response:
            return json.load(response)

    def test_real_restore_regression_and_correction(self):
        before = self.call("/api/verify", {})
        self.assertEqual(before["runs"][-1]["verdict"], "PASS")
        old_hash = before["ledger_sha256"]
        restored = self.call("/api/restore", {})
        self.assertEqual(restored["ledger_sha256"], old_hash)
        self.assertEqual(restored["last_restore"]["contract_before"], restored["last_restore"]["contract_after"])
        failed = self.call("/api/verify", {})
        self.assertEqual(failed["runs"][-1]["verdict"], "FAIL")
        self.assertEqual(failed["runs"][-1]["traces"][0]["status"], 200)
        self.call("/api/correct", {"approved": True})
        fixed = self.call("/api/verify", {})
        self.assertEqual(fixed["runs"][-1]["verdict"], "PASS")
        self.assertEqual(fixed["runs"][-1]["traces"][0]["status"], 403)
        self.assertEqual(fixed["runs"][-1]["traces"][-1]["status"], 201)

    def test_rotated_credential_cannot_prove_account_disabled(self):
        self.call("/api/restore", {})
        # The fixture modifies the isolated application's database; verification
        # and both credential attempts still use actual HTTP endpoints.
        session_id = next(cookie.value for handler in self.client.handlers
                          if isinstance(handler, HTTPCookieProcessor)
                          for cookie in handler.cookiejar)
        lab = self.server.sessions[session_id]
        replacement_key = "synthetic-rotated-credential"
        with connection(lab.db) as db:
            db.execute("UPDATE users SET key_hash=? WHERE id=?", (key_hash(replacement_key), SUBJECT))
        self.call("/lab/login", {"user": SUBJECT, "key": "synthetic-compromised-key-7"}, 403)
        self.call("/lab/login", {"user": SUBJECT, "key": replacement_key})
        run = self.call("/api/verify", {})["runs"][-1]
        self.assertEqual(run["verdict"], "FAIL")
        self.assertEqual(run["traces"][0]["status"], 403)
        self.assertTrue(run["account_state_evidence"]["enabled"])
        self.assertEqual(run["checks"][-1]["verdict"], "PASS")
        # Unknown account state cannot establish disablement either.
        with connection(lab.db) as db:
            db.execute("DELETE FROM users WHERE id=?", (SUBJECT,))
        self.assertEqual(self.call("/api/verify", {})["runs"][-1]["verdict"], "UNVERIFIED")

    def test_eight_scenarios(self):
        for scenario, expected in [("contained", "PASS"), ("restored", "FAIL"), ("corrected", "PASS"), ("deny-all", "FAIL"), ("wrong-account", "FAIL"), ("superseded", "PASS"), ("missing-evidence", "UNVERIFIED"), ("timeout", "UNVERIFIED")]:
            with self.subTest(scenario=scenario):
                self.call("/api/challenge", {"kind": scenario})
                state = self.call("/api/verify", {})
                self.assertEqual(state["runs"][-1]["verdict"], expected)

    def test_invalid_source_cannot_keep_previous_pass(self):
        state = self.call("/api/extract", {"note": "Disable svc-billing-7 under EVT-9999.", "mode": "local"})
        self.assertFalse(state["extraction"]["accepted"])
        self.assertFalse(state["contract_validation"][0])
        verified = self.call("/api/verify", {})
        self.assertEqual(verified["runs"][-1]["verdict"], "UNVERIFIED")

    def test_valid_note_and_ambiguous_note(self):
        accepted = self.call("/api/extract", {"note": "INC-042: Disable svc-billing-7. Source EVT-1042.", "mode": "local"})
        self.assertTrue(accepted["extraction"]["accepted"])
        rejected = self.call("/api/extract", {"note": "Disable the affected account.", "mode": "local"})
        self.assertFalse(rejected["extraction"]["accepted"])

    def test_superseded_restriction_is_rejected(self):
        self.call("/api/challenge", {"kind": "superseded"})
        state = self.call("/api/extract", {"note": "Disable svc-billing-7 under EVT-1042.", "mode": "local"})
        self.assertFalse(state["extraction"]["accepted"])
        self.assertIn("supersedes", state["extraction"]["reason"])

    def test_correction_requires_explicit_approval(self):
        self.call("/api/restore", {})
        self.call("/api/correct", {"approved": False}, 400)
        self.assertEqual(self.call("/api/verify", {})["runs"][-1]["verdict"], "FAIL")

    def test_report_excludes_credentials_and_tokens(self):
        self.call("/api/verify", {})
        report = json.dumps(self.call("/api/report"))
        self.assertNotIn("synthetic-compromised-key", report)
        self.assertNotIn("access_token", report)
        self.assertNotIn("key_hash", report)

    def test_browser_sessions_are_isolated(self):
        self.call("/api/restore", {})
        other = build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()))
        with other.open(self.base + "/api/state") as response:
            state = json.load(response)
        self.assertEqual(state["phase"], "contained")
        self.assertEqual(self.call("/api/state")["phase"], "restored")

    def test_reset_clears_restore_evidence(self):
        self.call("/api/restore", {})
        self.assertIsNone(self.call("/api/reset", {})["last_restore"])

    def test_cross_origin_mutation_rejected(self):
        req = Request(self.base + "/api/reset", data=b"{}", headers={"Origin": "https://unrelated.example", "Content-Type": "application/json"})
        with self.assertRaises(HTTPError) as caught:
            self.client.open(req)
        self.assertEqual(caught.exception.code, 403)


if __name__ == "__main__":
    unittest.main()
