## ADDED Requirements

### Requirement: Knowledge Ingestion Skill accepts article text or URL as input
The knowledge-ingestion Skill SHALL accept input with either `text` (raw article content) or `url` (to fetch and extract content). The Skill SHALL use the configured LLM to split the article into atomic KnowledgeCards.

#### Scenario: Ingestion from pasted text
- **WHEN** user provides raw article text as input
- **THEN** the Skill processes the text and produces KnowledgeCard drafts

#### Scenario: Ingestion from URL
- **WHEN** user provides a URL as input
- **THEN** the Skill fetches the page, extracts readable content, and produces KnowledgeCard drafts

### Requirement: AI splits article into atomic KnowledgeCards
The Skill SHALL prompt the LLM to split the article into independent, atomic statements — each expressible in 2-3 sentences, understandable without the original article, and independently referenceable. The LLM SHALL also suggest a `topic` for each card and `tags`.

#### Scenario: Article split into multiple cards
- **WHEN** a 2000-word article about RAG is ingested
- **THEN** the Skill produces between 3 and 15 KnowledgeCard drafts, each covering one independent concept

#### Scenario: Cards are atomic
- **WHEN** reviewing the output cards
- **THEN** each card can be understood without reading adjacent cards or the original article

### Requirement: Ingestion output requires user confirmation before writing
The Skill SHALL return KnowledgeCard drafts to the UI for user review. Files SHALL NOT be written to the KB directory until the user explicitly confirms (individually or in bulk). Users SHALL be able to edit topic, tags, and content before confirming.

#### Scenario: User confirms all cards
- **WHEN** user clicks "Confirm All" after reviewing drafts
- **THEN** all draft cards are written as Markdown files to the KB directory with `source_type: "ai_confirmed"`

#### Scenario: User confirms individual cards
- **WHEN** user confirms some cards and rejects others
- **THEN** only confirmed cards are written; rejected cards are discarded without any file being created

#### Scenario: User edits a card before confirming
- **WHEN** user modifies a card's topic before confirming
- **THEN** the written file uses the user-modified topic and `source_type: "user_defined"`

### Requirement: SourceArticle file created alongside KnowledgeCards
The Skill SHALL create a SourceArticle Markdown file in the KB directory's `sources/` subdirectory when a new article is ingested. Each KnowledgeCard's `source` frontmatter field SHALL point to this SourceArticle file using a relative path.

#### Scenario: SourceArticle created on ingestion
- **WHEN** an article is ingested and at least one card is confirmed
- **THEN** a SourceArticle file is created in `sources/` with the original content preserved

### Requirement: Ingestion run recorded in Context Store
Each knowledge-ingestion Skill run SHALL be recorded in the `records` table with `skill_name="knowledge-ingestion"`, the input URL or text length, and the output list of confirmed card file paths.

#### Scenario: Ingestion record created after confirmation
- **WHEN** user confirms cards from an ingestion run
- **THEN** a record is inserted with the confirmed card paths in the output JSON
