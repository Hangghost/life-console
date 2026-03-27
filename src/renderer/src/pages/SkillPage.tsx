import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { skillUIRegistry } from '../skills/registry'
import { api } from '../hooks/useIPC'
import type { RegisteredSkill, SkillResultEvent } from '../../../shared/types'

interface Props {
  skill: RegisteredSkill
}

export default function SkillPage({ skill }: Props): React.ReactElement {
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const unsubscribe = api.skills.onResult((event: SkillResultEvent) => {
      if (event.skillName !== skill.manifest.name) return
      setRunning(false)
      if (event.error) {
        setError(event.error)
        setResult(null)
      } else {
        setResult(event.output)
        setError(null)
      }
    })
    return unsubscribe
  }, [skill.manifest.name])

  const handleRun = useCallback(
    (input: unknown) => {
      setRunning(true)
      setError(null)
      api.skills.run(skill.manifest.name, input).catch((err: Error) => {
        setRunning(false)
        setError(err.message)
      })
    },
    [skill.manifest.name]
  )

  const UIComponent = skill.hasUI ? skillUIRegistry[skill.manifest.name] : undefined

  if (UIComponent) {
    return (
      <Suspense fallback={<Loading />}>
        <div style={{ position: 'relative' }}>
          {running && <RunningOverlay />}
          <UIComponent onRun={handleRun} result={result} />
          {error && <ErrorBox message={error} />}
        </div>
      </Suspense>
    )
  }

  // Auto-generated form from inputSchema
  return (
    <AutoForm
      skill={skill}
      onRun={handleRun}
      result={result}
      error={error}
      running={running}
    />
  )
}

function Loading(): React.ReactElement {
  return <div style={styles.loading}>Loading...</div>
}

function RunningOverlay(): React.ReactElement {
  return (
    <div style={styles.runningOverlay}>
      Running...
    </div>
  )
}

function ErrorBox({ message }: { message: string }): React.ReactElement {
  return (
    <div style={styles.errorBox}>
      Error: {message}
    </div>
  )
}

interface AutoFormProps {
  skill: RegisteredSkill
  onRun: (input: unknown) => void
  result: unknown
  error: string | null
  running: boolean
}

function AutoForm({ skill, onRun, result, error, running }: AutoFormProps): React.ReactElement {
  const schema = skill.manifest.inputSchema
  const properties = schema.properties ?? {}
  const required = schema.required ?? []

  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    for (const [key, prop] of Object.entries(properties)) {
      defaults[key] = prop.default != null ? String(prop.default) : ''
    }
    return defaults
  })

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const input: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(formValues)) {
      input[key] = value
    }
    onRun(input)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{skill.manifest.displayName}</h2>
      <p style={styles.desc}>{skill.manifest.description}</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {Object.entries(properties).map(([key, prop]) => (
          <div key={key} style={styles.field}>
            <label style={styles.label}>
              {key}
              {required.includes(key) && <span style={{ color: '#fc8181' }}> *</span>}
            </label>
            {prop.description && <div style={styles.hint}>{prop.description}</div>}
            <input
              type="text"
              value={formValues[key] ?? ''}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={prop.default != null ? String(prop.default) : ''}
              required={required.includes(key)}
              style={styles.input}
            />
          </div>
        ))}

        <button type="submit" disabled={running} style={styles.runBtn}>
          {running ? 'Running...' : 'Run'}
        </button>
      </form>

      {error && <ErrorBox message={error} />}

      {result != null && (
        <div style={styles.resultBox}>
          <div style={styles.resultTitle}>Result</div>
          <pre style={styles.resultPre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 32px',
    maxWidth: 600
  },
  title: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 700,
    color: '#e2e8f0'
  },
  desc: {
    margin: '0 0 24px',
    color: '#718096',
    fontSize: 14
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#a0aec0'
  },
  hint: {
    fontSize: 11,
    color: '#718096'
  },
  input: {
    padding: '8px 10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 5,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none'
  },
  runBtn: {
    padding: '9px 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    alignSelf: 'flex-start'
  },
  errorBox: {
    marginTop: 16,
    padding: '10px 14px',
    background: '#742a2a',
    border: '1px solid #9b2c2c',
    borderRadius: 6,
    color: '#feb2b2',
    fontSize: 13
  },
  resultBox: {
    marginTop: 20,
    padding: '12px 16px',
    background: '#1a202c',
    border: '1px solid #2d3748',
    borderRadius: 6
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#718096',
    marginBottom: 8
  },
  resultPre: {
    margin: 0,
    fontSize: 12,
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  },
  loading: {
    padding: 32,
    color: '#718096'
  },
  runningOverlay: {
    padding: '8px 16px',
    background: '#744210',
    color: '#fefcbf',
    fontSize: 13,
    borderRadius: 4,
    marginBottom: 8,
    display: 'inline-block'
  }
}
