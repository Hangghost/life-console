import React, { useState } from 'react'

interface Props {
  onRun: (input: unknown) => void
  result: unknown
}

interface TranslatorResult {
  translatedPath?: string
  lineCount?: number
}

export default function SubtitleTranslatorUI({ onRun, result }: Props): React.ReactElement {
  const [filePath, setFilePath] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('Traditional Chinese')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onRun({ filePath, targetLanguage })
  }

  const output = result as TranslatorResult | null

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Subtitle Translator</h2>
      <p style={styles.desc}>Translate .srt subtitle files using Claude AI.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>
            Subtitle File Path <span style={{ color: '#fc8181' }}>*</span>
          </label>
          <div style={styles.hint}>Absolute path to the .srt file</div>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="/path/to/subtitle.srt"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Target Language</label>
          <input
            type="text"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.runBtn}>
          Translate
        </button>
      </form>

      {output && output.translatedPath && (
        <div style={styles.success}>
          <div style={styles.successTitle}>Translation complete</div>
          <div style={styles.successDetail}>Output: {output.translatedPath}</div>
          <div style={styles.successDetail}>{output.lineCount} subtitle blocks translated</div>
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
  success: {
    marginTop: 20,
    padding: '12px 16px',
    background: '#1c4532',
    border: '1px solid #276749',
    borderRadius: 6
  },
  successTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#68d391',
    marginBottom: 6
  },
  successDetail: {
    fontSize: 13,
    color: '#9ae6b4'
  }
}
