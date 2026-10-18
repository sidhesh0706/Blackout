# Submission material

## Project title

Blackout: Containment Verification After Recovery

## Short description

Blackout verifies that restoring an application does not undo incident containment. In applications that store account status or permissions in their database, an older backup can re-enable compromised access while ordinary health checks still pass.

Our working prototype preserves source-linked containment requirements outside the restored database, then performs real HTTP access checks and a legitimate business transaction. It distinguishes PASS, FAIL and UNVERIFIED, detects containment rollback, and retests an operator-approved correction.

An optional AI adapter translates incident narratives into structured requirements. Every proposal must pass independent validation against approved source events and subsequent changes before predefined tests execute. An explicitly labelled local rule baseline also runs without an API key.

The laptop demonstration includes an actual SQLite restore, inspectable request traces, an exportable evidence report and eight repeatable challenge scenarios, including deny-all, missing evidence and timeouts. It supports incident responders evaluating a restored application before returning it to service.

## Required changes to the current 12-slide deck

1. Keep the title. Optional spoken hook: “Restoring the application should not restore compromised access.”
2. Rename the chart “Illustrative containment rollback scenario.” Add that the demonstrated account state lives in the restored application database.
3. Keep the two conditions. They are implemented as access and invoice-creation probes.
4. Keep the workflow. Replace “proposed” with “implemented prototype” only for the restore, deterministic validator and HTTP probes.
5. Keep the rollback boundary. Clarify that the independent verifier and ledger are trusted in this prototype; hashes prove continuity, not tamper-proofing.
6. Use a screenshot of the actual requirement and its event ID. Explain the seeded reference contract vs a newly interpreted requirement.
7. State “optional live Gemini adapter; local rule baseline available.” Do not claim live model accuracy or a completed AI benchmark without configuring a key and running that evaluation.
8. Keep PASS / FAIL / UNVERIFIED. PASS applies only to the declared checks.
9. Replace the planned-demo list with the actual containment-failure screenshot and the sequence: real restore → HTTP 200 for incident subject → approved correction → HTTP 403 plus legitimate HTTP 201.
10. Replace the planned-fixture bar chart with a compact expected/observed table. All eight synthetic scenarios match expectations locally. Also state 10 integration tests passed; this is not a production accuracy claim.
11. Add the operational use: “Run before returning a restored application to service.” Keep external SOC/backup integrations as future work.
12. Add the repository URL, team details and a short local-start command. Describe current scope: one app, two identities, SQLite snapshots, independent evidence, repeatable HTTP probes.

Use screenshots from docs/screenshots. Do not describe the local URL as a publicly hosted demo. No video is included.
