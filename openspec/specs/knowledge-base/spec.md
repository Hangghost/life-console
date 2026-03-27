## ADDED Requirements

### Requirement: Knowledge Base stored as Markdown files in user-chosen directory
The system SHALL allow users to configure a Knowledge Base directory path in settings. All KnowledgeCard, SourceArticle, Argument, and OpenQuestion entries SHALL be stored as individual Markdown files with YAML frontmatter in this directory. The directory structure SHALL be Obsidian-compatible.

#### Scenario: User configures KB directory
- **WHEN** user selects a directory path in Life Console settings
- **THEN** the system stores the path and uses it as the root for all KB file operations

#### Scenario: KB files are readable by Obsidian
- **WHEN** a user opens the configured directory as an Obsidian vault
- **THEN** all KnowledgeCard files appear as notes with valid frontmatter and readable content

### Requirement: KnowledgeCard Markdown format with YAML frontmatter
Each KnowledgeCard SHALL be a Markdown file with YAML frontmatter containing: `id` (unique string), `type` ("KnowledgeCard"), `topic` (string), `source` (relative path to SourceArticle), `source_type` ("ai_inferred" | "ai_confirmed" | "user_defined"), `created_at` (ISO 8601 date), `tags` (string array). The file body SHALL contain AI-generated content followed by a `## 我的筆記` section that is always left blank for user writing.

#### Scenario: KnowledgeCard file created after ingestion
- **WHEN** the knowledge-ingestion skill produces a card with topic "AI導入企業"
- **THEN** a file is created at `cards/ai-doaru-qiye/kc-<timestamp>.md` with valid frontmatter and a blank `## 我的筆記` section

#### Scenario: source_type defaults to ai_inferred
- **WHEN** a card is created by the AI ingestion skill without user confirmation
- **THEN** `source_type` is set to "ai_inferred"

### Requirement: source_type three-tier classification for reclassification safety
The system SHALL track the origin of each classification decision via `source_type`: `ai_inferred` (AI-generated, safe to overwrite), `ai_confirmed` (AI-generated and user confirmed, prompt before overwriting), `user_defined` (user-created or manually modified, never overwrite automatically).

#### Scenario: User confirms AI-suggested topic
- **WHEN** user approves an AI-suggested topic classification in the knowledge UI
- **THEN** the card's `source_type` is updated from "ai_inferred" to "ai_confirmed"

#### Scenario: User manually edits a card topic
- **WHEN** user edits a card's topic field directly in the knowledge UI
- **THEN** the card's `source_type` is set to "user_defined"

### Requirement: SourceArticle stored as Markdown with original content preserved
Each ingested article SHALL be stored as a SourceArticle Markdown file at `sources/<slug>.md` with frontmatter: `id`, `type` ("SourceArticle"), `url` (optional), `title`, `ingested_at`. The original article content SHALL be preserved in the file body unchanged.

#### Scenario: Article ingested from URL
- **WHEN** user provides a URL for ingestion
- **THEN** a SourceArticle file is created with the fetched content and the URL in frontmatter

### Requirement: KB directory path is user-exportable
The system SHALL provide an export function that packages the entire KB directory as a zip file. The zip SHALL preserve the directory structure and all Markdown files.

#### Scenario: User exports KB
- **WHEN** user triggers export in settings
- **THEN** a zip file is downloaded containing all KB Markdown files with their relative paths preserved
