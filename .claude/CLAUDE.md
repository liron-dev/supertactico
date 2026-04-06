# Mandatory Gates — Run Agents Before Acting

**logic-cartographer** → Before tasks with state/dependencies/rules/logic. Agent(model:"sonnet"). Skip: trivial edits, config, pure UI.
**devils-advocate** → Before big changes, architectural decisions, executing a plan. Agent(model:"haiku"). Skip: small fixes, deps, formatting.
**env-detective** → Before install/build/deploy commands. Agent(model:"haiku"). Pass exact commands to dry-run.

# File Creation

For 2+ files/dirs: `Skill("batch-fs")` with no args — write content only in the heredoc.
