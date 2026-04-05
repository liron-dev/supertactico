# Agent Execution Protocol
**When needs to plan or write complex logic**:
Agent(subagent_type:"logic-cartographer",model:"sonnet") → map all logic to YAML

**Every major coding task**:
1. Agent(subagent_type:"env-detective",model:"haiku") → gather env facts
2. Agent(subagent_type:"devils-advocate",model:"haiku") → wait for risk notes
3. Code addressing all noted flaws

# Skill Execution Protocol
**batch-fs**: For 2+ file/dir creations, Skill("batch-fs") must invoke and individual write_file or bash calls are prohibited. Use one batch-fs for all files/dirs combined.
