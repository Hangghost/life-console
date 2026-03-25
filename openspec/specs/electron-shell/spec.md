## ADDED Requirements

### Requirement: Sidebar navigation with three pages
The application SHALL display a fixed left sidebar with navigation items: Inbox, Today View, Toolbox, and a search entry point. Clicking a navigation item SHALL switch the main content area to the corresponding page.

#### Scenario: Navigate between pages
- **WHEN** user clicks "Today" in the sidebar while viewing Inbox
- **THEN** the main content area switches to Today View

### Requirement: IPC channels for object operations
The application SHALL expose IPC channels `objects:create`, `objects:update`, `objects:query`, and `objects:delete` from main process, accessible via preload bridge in renderer.

#### Scenario: Renderer creates an object via IPC
- **WHEN** renderer invokes `objects:create` with type="inbox_item" and content="Buy groceries"
- **THEN** main process creates the object in SQLite and returns the created object with its UUID

### Requirement: IPC channels for inbox inference
The main process SHALL push inference results to renderer via `inbox:infer` channel when Claude API inference completes for an inbox item.

#### Scenario: Inference result pushed to renderer
- **WHEN** Claude API returns inference for inbox item with id="abc-123"
- **THEN** main process sends an `inbox:infer` event to renderer with the object ID, inferred type, confidence, and suggested properties

### Requirement: IPC channels for plugin operations
The application SHALL expose IPC channels `plugins:list`, `plugins:run` from renderer to main, and `plugins:status` from main to renderer for execution status updates.

#### Scenario: Renderer requests plugin list
- **WHEN** renderer invokes `plugins:list`
- **THEN** main process returns an array of registered plugin metadata (name, display_name, description, plugin_type, permissions)

#### Scenario: Plugin execution status update
- **WHEN** a workflow plugin transitions from "running" to "completed"
- **THEN** main process sends a `plugins:status` event to renderer with plugin name, status, and result

### Requirement: IPC channel for full-text search
The application SHALL expose an IPC channel `search:query` that accepts a search string and returns matching objects using SQLite FTS5.

#### Scenario: Search returns results
- **WHEN** renderer invokes `search:query` with query="API"
- **THEN** main process returns all non-archived objects whose title or content matches "API"

### Requirement: API key management
The application SHALL provide a settings interface for the user to input and persist their Claude API key. The key SHALL be stored locally and never exposed to the renderer process.

#### Scenario: User sets API key
- **WHEN** user enters their Claude API key in settings
- **THEN** the key is persisted locally and used for all subsequent Claude API calls

#### Scenario: Missing API key
- **WHEN** user attempts inbox inference without a configured API key
- **THEN** the system skips inference and shows a prompt to configure the API key
