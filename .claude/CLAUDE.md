# Consider Using Mandatory Gates Before Anything

**Before any planning to create code with state/dependency/cascade logic:**
Yes → Agent(subagent_type:"logic-cartographer", model:"sonnet") → YAML output first

**Before doing install/build/deploy commands in session:**
Yes → Agent(subagent_type:"env-detective", model:"haiku") → deep dry-run validation

**Before big changes, architectural decisions or major code creation:**
Yes → Agent(subagent_type:"devils-advocate", model:"haiku") → process critical notes

# For Any File Or Folder Creation

For 2+ files/dirs: `Skill("batch-fs")` is mandatory. Individual Write/Edit/bash creation prohibited.
