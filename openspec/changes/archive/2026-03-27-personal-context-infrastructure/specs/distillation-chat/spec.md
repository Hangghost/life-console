## ADDED Requirements

### Requirement: Distillation Chat injects full Agent Layer into system prompt
The distillation-chat interface SHALL load all Agent Layer files (all axioms, all methodologies, all skills SOPs) and inject them into the LLM system prompt before each conversation. The injection SHALL include a preamble explaining the user's context and the purpose of the chat session.

#### Scenario: System prompt includes all axioms
- **WHEN** user opens the distillation-chat page
- **THEN** the underlying LLM system prompt contains all axiom files from the Agent Layer

#### Scenario: System prompt token budget respected
- **WHEN** the Agent Layer exceeds 4000 tokens
- **THEN** the system notifies the user and allows them to select which parts to include

### Requirement: Distillation Chat supports on-demand Knowledge Base search
During a distillation chat session, the LLM SHALL be able to search the Knowledge Base via a tool call to retrieve relevant KnowledgeCards to inform the conversation.

#### Scenario: LLM searches KB during distillation
- **WHEN** the conversation involves a topic covered in the Knowledge Base
- **THEN** the LLM calls searchKnowledge() and cites relevant cards in its response

### Requirement: User can trigger distillation write-back to Agent Layer
When the user and LLM reach a conclusion about a new or updated axiom/methodology, the user SHALL be able to trigger a write-back. The LLM SHALL propose the exact Markdown content to be written, and the user SHALL confirm before any file is modified.

#### Scenario: New axiom distilled and confirmed
- **WHEN** user says "add this as a new axiom" and confirms the LLM's proposed content
- **THEN** a new axiom file is created in the Agent Layer's axioms/ directory

#### Scenario: Existing methodology updated
- **WHEN** user says "update my code review methodology to include this" and confirms
- **THEN** the existing methodology file is updated with the new content, and the previous version is appended to its `## Version History` section

#### Scenario: User rejects proposed write-back
- **WHEN** the LLM proposes Markdown content for write-back but user clicks "Reject"
- **THEN** no files are modified and the conversation continues

### Requirement: Write-back triggers Skill Loader automatically
After a successful write-back to the Agent Layer, the system SHALL automatically execute the Skill Loader for all configured targets.

#### Scenario: Skill Loader runs after write-back
- **WHEN** user confirms a write-back to the Agent Layer
- **THEN** Skill Loader executes within 5 seconds and updates all configured IDE context files

### Requirement: Distillation Chat uses user-configured external Model API
The distillation-chat SHALL use the Model API key and model name configured in Life Console settings (not a bundled model). The user SHALL be able to configure API key, base URL, and model name.

#### Scenario: Chat uses configured API
- **WHEN** user sends a message in distillation-chat
- **THEN** the request is sent to the configured API endpoint with the configured model

#### Scenario: API key not configured
- **WHEN** user opens distillation-chat without a configured API key
- **THEN** the system shows a prompt directing user to settings to configure the API key
