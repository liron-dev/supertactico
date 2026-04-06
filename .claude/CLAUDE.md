# Gates — Run Agents Before Acting

**logic-cartographer** → Before doing code with state/dependencies/rules/cascade/logic. Agent(model:"sonnet"). Skip: trivial edits, config, pure UI.
**devils-advocate** → Before big changes, architectural decisions, implementing a plan. Agent(model:"haiku"). Skip: small fixes, deps, formatting.
**env-detective** → Before install/build/deploy commands. Agent(model:"haiku"). Pass exact commands to dry-run.

# File Creation

For 2+ files/dirs: `Skill("batch-fs")` with no args — write content only in the heredoc.
