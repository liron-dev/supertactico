# Mandatory Gates — Run Agents Before Acting

Evaluate ALL gates against the overall task before taking any action. Gates trigger on the nature of the whole undertaking, not just the first concrete step.

**logic-cartographer** → Before implementing domain logic (states, transitions, rules, resolution order). Run FIRST so its YAML informs other gates. Agent(model:"sonnet"). Skip: trivial edits, config, pure UI.
**devils-advocate** → Before big changes, architectural decisions, executing a plan. Agent(model:"haiku"). Skip: small fixes, deps, formatting.
**env-detective** → Before install/build/deploy commands. Agent(model:"haiku"). Pass exact commands to dry-run.

# File Creation

For 2+ files/dirs: `Skill("batch-fs")` with no args — write content only in the heredoc.
