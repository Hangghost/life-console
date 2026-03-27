## ADDED Requirements

### Requirement: MCP Server starts with Life Console and listens on localhost
The system SHALL start an HTTP MCP Server when Life Console launches, listening on `localhost:7777` (configurable in settings). The server SHALL only accept connections from localhost. The server SHALL stop when Life Console quits.

#### Scenario: MCP Server available after app launch
- **WHEN** Life Console finishes launching
- **THEN** an HTTP server is accepting connections on `localhost:7777`

#### Scenario: Port conflict handled gracefully
- **WHEN** port 7777 is already in use at launch
- **THEN** Life Console shows a notification and allows user to configure an alternate port, then retries

### Requirement: MCP tool — getMethodology
The server SHALL expose a tool `getMethodology(topic: string)` that searches methodologies/ for the most relevant methodology file and returns its full content.

#### Scenario: Relevant methodology found
- **WHEN** an external client calls `getMethodology("code review")`
- **THEN** the server returns the content of the best-matching methodology file

#### Scenario: No methodology found
- **WHEN** an external client calls `getMethodology("underwater basket weaving")`
- **THEN** the server returns an empty result with a message indicating no match

### Requirement: MCP tool — listAxioms
The server SHALL expose a tool `listAxioms(category?: string)` that returns all axiom files, optionally filtered by category. Each result SHALL include `id`, `title`, `category`, and the full file content.

#### Scenario: List all axioms
- **WHEN** an external client calls `listAxioms()` with no arguments
- **THEN** the server returns all axiom files sorted by id

#### Scenario: List axioms by category
- **WHEN** an external client calls `listAxioms("methodology")`
- **THEN** the server returns only axioms with category "methodology"

### Requirement: MCP tool — searchKnowledge
The server SHALL expose a tool `searchKnowledge(query: string, limit?: number)` that performs full-text search across all KnowledgeCard files and returns matching cards with their content. Default limit is 10.

#### Scenario: Knowledge search returns relevant cards
- **WHEN** an external client calls `searchKnowledge("RAG precision recall")`
- **THEN** the server returns KnowledgeCard files whose content matches the query terms

### Requirement: MCP tool — getCard
The server SHALL expose a tool `getCard(id: string)` that returns a specific KnowledgeCard by its id field from frontmatter.

#### Scenario: Card found by id
- **WHEN** an external client calls `getCard("kc-20260327-001")`
- **THEN** the server returns the full Markdown content of the matching card

#### Scenario: Card not found
- **WHEN** an external client calls `getCard("nonexistent-id")`
- **THEN** the server returns an error indicating the card was not found

### Requirement: MCP Server connection info displayed in Life Console UI
The system SHALL display the MCP Server URL and connection status in Life Console settings, along with copy-paste configuration snippets for Claude Code and Cursor.

#### Scenario: User copies MCP config for Claude Code
- **WHEN** user clicks "Copy for Claude Code" in settings
- **THEN** the clipboard contains a valid JSON snippet for `~/.claude/settings.json` mcpServers configuration
