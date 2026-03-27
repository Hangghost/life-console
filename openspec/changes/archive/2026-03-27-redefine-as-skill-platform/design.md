## Context

Life Console was designed as a "Context-Driven Agentic Workspace" with heavyweight modules: LLM Gateway, Personal Skills Engine, Inbox AI inference, Today View scheduler, Knowledge Graph, and Event Bus. After reflection on actual usage scenarios, the real need is simpler: a single platform to host personally-built small tools (Skills), with outputs automatically stored in a structured Context Store, which external AI agents (Claude Code) can query via MCP.

The current codebase (MVP v0.1) has an Electron shell, a plugin system loading from `~/.life-console/plugins/`, SQLite object store, Inbox with Claude inference, and Today View. This is the baseline to refactor from.

## Goals / Non-Goals

**Goals:**
- Reorient the app around a `skills/` directory inside the project (not a hidden system folder)
- Simplify the Skill contract: `manifest.json` + `core.ts` (pure function) + optional `ui.tsx`
- Replace the "Toolbox/Inbox/TodayView" sidebar with a Skills-first navigation
- Retain SQLite as Context Store — simplify the schema to match actual Skill output needs
- Remove the built-in LLM Gateway from the SDK; Skills call external APIs directly or via their own `.env`
- Establish the MCP Server interface design (Phase 2) so the data model supports it from day one

**Non-Goals:**
- MCP Server implementation (Phase 2)
- Inbox AI inference and Today View (deferred, not deleted — may return)
- Personal Skills Engine (AI learning preferences)
- Knowledge Graph
- Cloud sync
- Permission confirmation dialogs (the old plugin permission system)

## Decisions

### 1. Skills live in `skills/` inside the repo, not `~/.life-console/plugins/`

**Chosen:** `skills/<skill-name>/` inside the project directory.

**Why:** The founding use case is "vibe coding your own tools." Skills are source code the user writes and owns, not third-party plugins to install. Keeping them in the repo means they're version-controlled, editable, and visible. The hidden `~/.life-console/plugins/` pattern was designed for distributable plugins — wrong mental model.

**Alternative considered:** Keep `~/.life-console/plugins/` as the runtime location, copy built Skills there. Rejected: adds a build/copy step with no benefit for a single-user tool.

### 2. Skill SDK removes LLM Gateway — Skills call APIs directly

**Chosen:** `core.ts` is a plain async function. No `context.llm.ask()`. Skills use their own `.env` for API keys and call APIs (Anthropic, OpenAI, etc.) directly or with their own SDK.

**Why:** LLM Gateway added indirection for multi-model routing and centralized billing — neither needed for a personal tool. Removing it simplifies the SDK surface dramatically and removes a hard dependency on Claude API from the platform itself.

**Alternative considered:** Keep `context.llm.ask()` as a convenience wrapper. Rejected: it creates platform-level API key management complexity that isn't needed in Phase 1.

### 3. Context Store schema simplified — single `records` table

**Chosen:** Replace the typed `objects` table (with `workflow_run`, `inbox_item`, etc.) with a simpler `records` table: `id`, `skill_name`, `input` (JSON), `output` (JSON), `created_at`.

**Why:** The existing schema baked in too many domain assumptions (tasks, notes, inbox items). Skills produce whatever they produce — the Context Store should record the raw input/output pair tagged by skill. Querying shape is defined by the Skill's output schema, not by the platform. This also makes MCP read/query trivial.

**Alternative considered:** Keep the typed object model and map Skill outputs to object types. Rejected: forces Skills to conform to a pre-defined type system, which conflicts with "edge-case personal tools."

### 4. Dual interface via a thin runner — same `core.ts`, different calling layer

**Chosen:** The Electron main process provides a Skill runner that can be called from (a) the renderer via IPC (UI mode) and (b) the MCP Server via a function call (headless mode). Both call `skill.core.run(input)` and write the result to Context Store.

**Why:** This is the dual-interface promise from the proposal. Decoupling `core.ts` from the UI means the MCP Server in Phase 2 requires zero changes to Skill code.

### 5. Sidebar becomes a Skills list — Inbox and Today View hidden, not deleted

**Chosen:** Sidebar shows Skills loaded from `skills/` directory. Inbox and Today View are removed from the primary navigation but their code is preserved (commented routing, or a hidden route).

**Why:** Preserves optionality — if actual usage reveals need for Inbox/Today View, re-enabling is trivial. Avoids a big deletion that may need to be undone.

## Risks / Trade-offs

- **Skills call external APIs without platform mediation** → No centralized rate limiting or error handling. Mitigation: each Skill owns its error handling; the runner catches thrown errors and records them in Context Store.
- **Simplified `records` table loses typed querying** → Claude Code can't do `query({ type: "task" })`. Mitigation: Skills define output schema in `manifest.json`; MCP Server can filter by `skill_name` and query JSON fields. Sufficient for Phase 1.
- **No permission system** → Any Skill can read/write anything. Mitigation: acceptable for a single-user personal tool. Can be added later.
- **`ui.tsx` is optional but the runner must handle Skills with no UI** → Headless-only Skills (no `ui.tsx`) must still be invokable from the sidebar. Mitigation: show a generic "Run" button with auto-generated form from `manifest.json` input schema (same as current Toolbox behavior).

## Migration Plan

1. Move `skills/` directory into repo root (already has `subtitle-translator` from MVP v0.1)
2. Strip `context.llm.ask()` and `context.tools.*` from Skill SDK; update `subtitle-translator/core.ts` to call Anthropic SDK directly
3. Update `manifest.json` schema: remove `plugin_type`, `permissions`, `output.auto_create_object`; add `input_schema`, `output_schema`
4. Replace SQLite schema: drop `objects`, `relations` tables; create `records` table
5. Update Electron shell: replace sidebar routes (Inbox → Skills list), update IPC channels
6. Delete or hide `inbox/` and `today-view/` from navigation (keep code)

Rollback: git revert. No external data migration needed (local SQLite, user can wipe).

## Open Questions

- Should `skills/` be inside the Electron app bundle or loaded from `~/Documents/life-console-skills/` to survive app updates?
- Phase 2: MCP Server as a separate Node process, or running inside Electron main process?
- When the sidebar lists Skills, should it show all skills or only those with `ui.tsx`? (Proposed: show all, headless Skills get an auto-generated form)
