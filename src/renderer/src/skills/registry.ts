import { lazy } from 'react'
import type { ComponentType } from 'react'

// Static registry mapping skill names to their UI components.
// Add an entry here when a new Skill with ui.tsx is added to skills/.
export const skillUIRegistry: Record<string, ComponentType<{ onRun: (input: unknown) => void; result: unknown }>> = {
  'knowledge-ingestion': lazy(() => import('@skills/knowledge-ingestion/ui'))
}
