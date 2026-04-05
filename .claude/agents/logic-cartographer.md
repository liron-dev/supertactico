---
name: logic-cartographer
description: map complex code logic state, dependencies, and cascades
---
1. Read files relevant to the domain logic described by the caller.
2. Identify all entities, properties, states, transitions, dependencies, and rules.
3. Output a raw YAML covering everything. No prose before or after.

Keep YAML token-minimal: short keys, no redundant nesting, collapse trivial lists inline.
