## ADDED Requirements

### Requirement: Load plugins from manifest files
The system SHALL scan the plugin directory (`~/.life-console/plugins/`) for `manifest.json` files, validate their format, and register discovered plugins.

#### Scenario: Valid manifest discovered
- **WHEN** a plugin directory contains a valid manifest.json with required fields (name, version, plugin_type, entry, permissions)
- **THEN** the system registers the plugin and displays it in the Toolbox

#### Scenario: Invalid manifest ignored
- **WHEN** a manifest.json is missing required fields
- **THEN** the system logs a warning and skips the plugin without crashing

### Requirement: Permission confirmation on first load
The system SHALL display a permission confirmation dialog when a plugin is first loaded, showing the plugin name, description, and requested permissions. The plugin SHALL NOT execute until the user approves.

#### Scenario: User approves permissions
- **WHEN** a new plugin requests permissions ["network:external", "llm:claude"] and user clicks "安裝"
- **THEN** the plugin is activated and available for use

#### Scenario: User denies permissions
- **WHEN** user clicks "取消" on the permission dialog
- **THEN** the plugin is not activated and does not appear in the Toolbox

### Requirement: Display workflow plugins as executable cards
The Toolbox SHALL display each workflow plugin as a card showing display_name, description, and a "執行" button.

#### Scenario: Toolbox listing
- **WHEN** user navigates to Toolbox
- **THEN** all approved plugins are shown as cards with their display_name and description

### Requirement: Auto-generate input form from input_schema
For workflow plugins, the system SHALL generate an input form based on the manifest's `input_schema` (JSON Schema). Required fields SHALL be enforced before execution.

#### Scenario: Form generation
- **WHEN** user clicks "執行" on a workflow plugin with input_schema containing "url" (required) and "target_language" (optional, default "zh-TW")
- **THEN** the system shows a form with a required URL field and an optional language field pre-filled with "zh-TW"

### Requirement: Execute workflow plugin and show status
The system SHALL execute the workflow plugin's entry function, passing user input and a WorkflowContext. During execution, the UI SHALL show a running status. On completion or failure, the UI SHALL update accordingly.

#### Scenario: Successful execution
- **WHEN** a workflow plugin completes successfully
- **THEN** the UI shows "completed" status and the output result

#### Scenario: Execution failure
- **WHEN** a workflow plugin throws an error
- **THEN** the UI shows "failed" status with the error message

### Requirement: Auto-create object from output
When a plugin's manifest has `output.auto_create_object=true`, the system SHALL create a new object using `output.output_type` and `output.output_mapping` after successful execution, and create a `produces` relation from the workflow_run object to the output object.

#### Scenario: LearningHacker output creates note
- **WHEN** LearningHacker workflow completes with output { video_title: "React Hooks", translated_summary: "..." }
- **THEN** the system creates a note object with title "React Hooks - 學習筆記", content from translated_summary, and a produces relation from the workflow_run

### Requirement: PhotoSift quick-launch integration
The system SHALL display PhotoSift as a card in the Toolbox. Clicking it SHALL launch the external PhotoSift application. No embedding or object creation.

#### Scenario: Launch PhotoSift
- **WHEN** user clicks the PhotoSift card
- **THEN** the system launches the external PhotoSift application
