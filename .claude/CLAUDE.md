# Agent Execution Protocol
Every major coding task:
1. Agent(subagent_type:"environment-detective",model:"haiku") → cache env facts
2. Agent(subagent_type:"devils-advocate",model:"haiku") → wait for risk notes
3. Code addressing all noted flaws

# Skill Execution Protocol
When creating 2+ files/dirs, use `batch-fs` skill instead of individual Write/Bash calls.
