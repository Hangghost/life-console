## ADDED Requirements

### Requirement: Skill core.ts exports a plain async function
A Skill's `core.ts` SHALL export a default async function `run(input: unknown): Promise<unknown>`. The function SHALL be a pure processing unit with no dependency on platform internals. It may import any npm package or use its own `.env` for API keys.

#### Scenario: Minimal Skill implementation
- **WHEN** `core.ts` exports `export default async function run(input) { return { result: input.text.toUpperCase() } }`
- **THEN** the Skill runner can invoke it and receive the output without any SDK setup

#### Scenario: Skill using its own API key
- **WHEN** `core.ts` reads `process.env.ANTHROPIC_API_KEY` from the Skill's `.env` file
- **THEN** the Skill can call the Anthropic API directly without any platform-provided LLM gateway

### Requirement: Skill .env loaded per-Skill
The system SHALL load environment variables from `skills/<skill-name>/.env` before executing the Skill's `core.ts`. Variables SHALL be scoped to the Skill's execution context and SHALL NOT leak to other Skills or the platform.

#### Scenario: .env loaded before execution
- **WHEN** `skills/subtitle-translator/.env` contains `ANTHROPIC_API_KEY=sk-xxx`
- **THEN** during execution, `process.env.ANTHROPIC_API_KEY` resolves to `sk-xxx` within that Skill's `core.ts`

#### Scenario: Missing .env is not an error
- **WHEN** a Skill has no `.env` file
- **THEN** the system proceeds with execution without error; the Skill may still use system environment variables

### Requirement: Skill ui.tsx is an optional React component
If a Skill includes `ui.tsx`, it SHALL export a default React component. The component SHALL receive `onRun(input: unknown) => void` and `result: unknown | null` as props. The platform SHALL render this component in the main content area when the Skill is selected.

#### Scenario: Skill UI rendered
- **WHEN** user selects a Skill with a `ui.tsx` in the sidebar
- **THEN** the platform renders the Skill's React component in the main content area

#### Scenario: onRun triggers execution
- **WHEN** the Skill's UI component calls `onRun({ url: "https://example.com" })`
- **THEN** the platform passes the input to the Skill runner, executes `core.ts`, and passes the result back to the component via the `result` prop
