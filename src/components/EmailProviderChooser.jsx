import React from 'react'

export function buildWebmailComposeUrl(provider, { to, subject = '', body = '' }) {
  const encodedTo = encodeURIComponent(to)
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)

  if (provider === 'gmail') {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`
  }

  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`
}

export default function EmailProviderChooser({
  open,
  onClose,
  onChoose,
  title = 'Choose your email provider',
  subtitle = 'Open your draft in browser-based Gmail or Outlook.',
}) {
  if (!open) return null

  const btnStyle = {
    flex: 1,
    minWidth: 150,
    border: '1px solid rgba(26,74,255,0.35)',
    background: 'rgba(5,8,16,0.95)',
    color: 'var(--white)',
    padding: '12px 14px',
    fontFamily: 'var(--font-display)',
    fontSize: '0.72rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2,4,10,0.72)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(520px, 100%)',
          background: 'var(--navy)',
          border: '1px solid rgba(0,212,255,0.35)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
          padding: '1.35rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--blue-glow), var(--cyan), var(--blue-glow))' }} />

        <div style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          {title}
        </div>
        <p style={{ marginTop: '0.7rem', color: 'var(--white-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" style={btnStyle} onClick={() => onChoose('gmail')}>
            Open Gmail
          </button>
          <button type="button" style={btnStyle} onClick={() => onChoose('outlook')}>
            Open Outlook
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '1rem',
            border: 'none',
            background: 'transparent',
            color: 'var(--white-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
