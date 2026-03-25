## ADDED Requirements

### Requirement: WorkflowContext provides llm.ask
The SDK SHALL provide `context.llm.ask(prompt, options?)` that calls Claude API and returns `{ text: string }`. Options include `model` (default "claude-sonnet") and `maxTokens` (default 1000).

#### Scenario: Plugin calls llm.ask
- **WHEN** a plugin calls `context.llm.ask("Translate this text", { maxTokens: 2000 })`
- **THEN** the system sends the prompt to Claude API and returns the response text

### Requirement: WorkflowContext provides tools.fetchUrl
The SDK SHALL provide `context.tools.fetchUrl(url, options?)` that performs an HTTP request and returns `{ status: number, text: string }`. Options include `method` (GET/POST), `headers`, and `body`.

#### Scenario: Plugin fetches a URL
- **WHEN** a plugin calls `context.tools.fetchUrl("https://example.com")`
- **THEN** the system performs a GET request and returns the status code and response body

### Requirement: WorkflowContext provides tools.readFile and tools.writeFile
The SDK SHALL provide `context.tools.readFile(path)` returning file content as string, and `context.tools.writeFile(path, content)` writing content to the specified path.

#### Scenario: Plugin reads a file
- **WHEN** a plugin calls `context.tools.readFile("/path/to/file.txt")`
- **THEN** the system returns the file content as a string

#### Scenario: Plugin writes a file
- **WHEN** a plugin calls `context.tools.writeFile("/path/to/output.md", "# Notes")`
- **THEN** the system writes the content to the specified path

### Requirement: WorkflowContext provides store.create
The SDK SHALL provide `context.store.create(type, data)` that creates a new object in the database and returns `{ id: string }`. Data includes optional title, content, properties, and source.

#### Scenario: Plugin creates a note object
- **WHEN** a plugin calls `context.store.create("note", { title: "My Note", content: "...", properties: { tags: ["test"] } })`
- **THEN** the system creates a note object and returns its UUID

### Requirement: WorkflowContext provides store.query
The SDK SHALL provide `context.store.query(filter)` that queries objects by type, status, tags, and limit, returning an array of matching objects.

#### Scenario: Plugin queries tasks
- **WHEN** a plugin calls `context.store.query({ type: "task", status: "todo", limit: 10 })`
- **THEN** the system returns up to 10 non-archived task objects with status "todo"

### Requirement: Workflow plugin entry function signature
A workflow plugin SHALL export an async `run(input, context)` function. `input` matches the manifest's `input_schema`. `context` is a `WorkflowContext`. The function SHALL return an object whose keys can be referenced in the manifest's `output_mapping`.

#### Scenario: Plugin execution contract
- **WHEN** the system loads a workflow plugin
- **THEN** it expects a named export `run` that accepts (input, context) and returns a Promise of an output object
