# ABZ Coder Orchestration (Sequential)

1. Ensure tasks/<slug>/intake.md exists.
2. Researcher subagent writes tasks/<slug>/research.md and updates repo_runbook.md.
3. Lead writes tasks/<slug>/plan.md + updates tasks/<slug>/state.json.
4. Wait for user approval to implement.
5. Implementer subagent applies changes + logs tasks/<slug>/execution_log.md.
6. Reviewer subagent reviews and appends to tasks/<slug>/final_report.md.
7. Lead finalizes tasks/<slug>/final_report.md and marks state.json done.

Cache: .abzcache/ only, no embeddings.
