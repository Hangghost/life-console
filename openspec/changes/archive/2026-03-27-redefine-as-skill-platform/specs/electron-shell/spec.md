## MODIFIED Requirements

### Requirement: Sidebar navigation with Skills list
The application SHALL display a fixed left sidebar listing all registered Skills by `displayName`. Clicking a Skill SHALL switch the main content area to that Skill's UI (or auto-generated form if no `ui.tsx`). The sidebar SHALL NOT show Inbox, Today View, or Toolbox as primary navigation items.

#### Scenario: Skills listed in sidebar
- **WHEN** the app starts and discovers Skills in `skills/`
- **THEN** each Skill's `displayName` appears as a navigation item in the sidebar

#### Scenario: Navigate to a Skill
- **WHEN** user clicks a Skill in the sidebar
- **THEN** the main content area renders the Skill's `ui.tsx` component (or auto-generated form)

#### Scenario: Empty state when no Skills found
- **WHEN** no Skills are discovered in `skills/`
- **THEN** the main content area shows a prompt explaining how to add a Skill

## MODIFIED Requirements

### Requirement: IPC channels for Skill operations
The application SHALL expose IPC channels `skills:list` (renderer → main, returns registered Skills metadata) and `skills:run` (renderer → main, executes a Skill by name with input). The main process SHALL push execution results back via `skills:result` (main → renderer).

#### Scenario: Renderer requests Skill list
- **WHEN** renderer invokes `skills:list`
- **THEN** main process returns an array of Skill metadata objects with `name`, `displayName`, `description`, `inputSchema`, `hasUI`

#### Scenario: Skill execution result pushed to renderer
- **WHEN** a Skill execution completes
- **THEN** main process sends `skills:result` to renderer with `{ skillName, output, error, recordId }`

## REMOVED Requirements

### Requirement: IPC channels for inbox inference
**Reason**: Inbox AI inference is deferred. The LLM Gateway and automatic inference pipeline are not part of the Personal Skill Platform.
**Migration**: No migration needed. If Inbox is re-enabled in a future phase, this requirement will be re-added.

### Requirement: Sidebar navigation with three pages
**Reason**: Replaced by Skills-first sidebar. Inbox and Today View are removed from primary navigation.
**Migration**: Routes for Inbox and Today View may remain in code as hidden routes for future re-enablement.
