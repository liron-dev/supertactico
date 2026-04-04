# Agent Execution Protocol
For EVERY coding task, you MUST execute this strict 3-step sequence:

1. **Pre-code:** Use the Agent (`subagent_type: "devils-advocate"`) to critique the plan. Do not proceed until you have its bulleted risk notes.
2. **Generate code:** Solve the task while addressing every logic flaw found in Step 1. 
3. **Post-code:** Use the Agent (`subagent_type: "grand-jury"`) to audit your work. Output its "Indictments" and fix any fatal errors before finishing.

Never generate code without completing step 1. Never deliver output without completing step 3.
