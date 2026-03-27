## ADDED Requirements

### Requirement: Knowledge UI page displays KnowledgeCards grouped by topic
The Knowledge UI page SHALL display all KnowledgeCards from the configured KB directory, grouped by `topic` frontmatter field. Each card SHALL show its title (first heading), tags, source_type indicator, and creation date.

#### Scenario: Cards grouped by topic
- **WHEN** user navigates to the Knowledge page
- **THEN** cards are displayed in collapsible topic groups sorted alphabetically

#### Scenario: source_type visually distinguished
- **WHEN** a card with `source_type: "ai_inferred"` is displayed
- **THEN** it shows a visual indicator (e.g., an icon or badge) distinguishing it from ai_confirmed and user_defined cards

### Requirement: Knowledge UI supports full-text search across all cards
The Knowledge UI SHALL provide a search input that filters displayed cards by matching against card content and tags in real time.

#### Scenario: Search filters cards
- **WHEN** user types "RAG" in the search input
- **THEN** only cards containing "RAG" in their content or tags are displayed

### Requirement: User can confirm AI-inferred card classifications
The Knowledge UI SHALL provide a "Confirm" action for each card with `source_type: "ai_inferred"`. Confirming SHALL update the file's frontmatter `source_type` to "ai_confirmed".

#### Scenario: User confirms a card classification
- **WHEN** user clicks "Confirm" on an ai_inferred card
- **THEN** the card's Markdown file frontmatter is updated to `source_type: "ai_confirmed"`

### Requirement: User can edit card content and metadata in the UI
The Knowledge UI SHALL provide an inline editor for card content (Markdown) and metadata fields (topic, tags). Saving SHALL write changes to the Markdown file and update `source_type` to "user_defined".

#### Scenario: User edits card topic
- **WHEN** user changes a card's topic in the editor and saves
- **THEN** the Markdown file is updated with the new topic and `source_type: "user_defined"`

### Requirement: User can view the SourceArticle linked to a card
Each KnowledgeCard view SHALL include a link to its SourceArticle. Clicking the link SHALL open a read-only view of the original article content.

#### Scenario: Source article accessible from card
- **WHEN** user clicks "View Source" on a KnowledgeCard
- **THEN** a panel shows the original SourceArticle content with the relevant passage highlighted
