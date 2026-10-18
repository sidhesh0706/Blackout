# Screenshot provenance

These are unedited screenshots of the running Blackout application at localhost, captured with Playwright on 18 October 2026. They use synthetic incidents and real local SQLite/HTTP execution. They are not generated mockups.

- `workspace.png`: initial contained state, desktop 1440px.
- `containment-failure.png`: observed FAIL after restoring the earlier snapshot.
- `verified-correction.png`: observed PASS after an operator-approved correction.
- `incident-requirements.png`: local rule interpretation and independent validation; explicitly not a live AI result.
- `challenge-lab.png`: eight executed synthetic scenarios and observed verdicts.
- `mobile.png`: initial workspace at 390px, full page.

Reproduce with `scripts/browser-check.cjs`. Captures wait for transient notifications to disappear and use reduced motion for stable evidence. Timings, database hashes, generated IDs and timestamps vary across runs.
