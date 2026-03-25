import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useReveal from './useReveal.js'
import { SectionLabel } from './Services.jsx'
import EmailProviderChooser, { buildWebmailComposeUrl } from './EmailProviderChooser.jsx'

export default function Contact() {
  const initialForm = { fname: '', lname: '', email: '', company: '', service: '', message: '' }
  const [leftRef, leftVisible] = useReveal()
  const [rightRef, rightVisible] = useReveal()

  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [chooserOpen, setChooserOpen] = useState(false)
  const [emailDraft, setEmailDraft] = useState(null)

  useEffect(() => {
    const syncStatusFromReturn = () => {
      if (sessionStorage.getItem('vitty_email_pending') === '1') {
        sessionStorage.removeItem('vitty_email_pending')
        setStatus('sent')
        setForm(initialForm)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncStatusFromReturn()
      }
    }

    syncStatusFromReturn()
    window.addEventListener('focus', syncStatusFromReturn)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('focus', syncStatusFromReturn)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const { fname, email, message } = form
    if (!fname.trim() || !email.trim() || !message.trim()) {
      setStatus('error')
      return
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(email)) { setStatus('error'); return }

    setStatus('sending')
    const subject = `[Vitty Agency] Inquiry from ${fname} ${form.lname} - ${form.service || 'General'}`
    const body = (
      `NEW INQUIRY — VITTY AGENCY\n\n` +
      `Name: ${fname} ${form.lname}\nEmail: ${email}\n` +
      `Company: ${form.company || 'Not provided'}\nService: ${form.service || 'Not specified'}\n\n` +
      `MESSAGE:\n${message}\n\n---\nSent via vittyagency.com`
    )
    setTimeout(() => {
      setEmailDraft({
        to: 'anjali.a.p3112@gmail.com',
        subject,
        body,
      })
      setChooserOpen(true)
      setStatus(null)
    }, 350)
  }

  const handleProviderChoose = (provider) => {
    if (!emailDraft) return
    const composeUrl = buildWebmailComposeUrl(provider, emailDraft)
    sessionStorage.setItem('vitty_email_pending', '1')
    const popup = window.open(composeUrl, '_blank')
    if (popup) popup.opener = null
    setChooserOpen(false)
    setStatus(null)
  }

  return (
    <section id="contact" style={{
      padding: '120px 5vw',
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr',
      gap: '6rem',
      alignItems: 'start',
    }}>
      {/* Info */}
      <motion.div
        ref={leftRef}
        initial={{ opacity: 0, x: -40 }}
        animate={leftVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ paddingTop: '1rem' }}
      >
        <SectionLabel>START YOUR JOURNEY</SectionLabel>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          fontWeight: 900, letterSpacing: '2px',
          textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '1.3rem',
        }}>
          READY TO RUN<br />
          <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(240,244,255,0.3)' }}>YOUR BUSINESS</span><br />
          <span style={{ color: 'var(--cyan)' }}>ON AUTOPILOT?</span>
        </h2>
        <p style={{ color: 'var(--white-muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.96rem' }}>
          Book a free 30-minute AI Audit. We'll show you exactly where your business is leaking time and money — and give you a custom roadmap with projected ROI. No commitment required. Walk away with a clear, actionable plan — even if you don't hire us.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { icon: '✅', text: 'No commitment required' },
            { icon: '✅', text: 'Custom AI roadmap provided — even if you don\'t hire us' },
            { icon: '✅', text: 'Spots limited to 10 clients per month' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ color: 'var(--cyan)', fontSize: '1rem', marginTop: 2 }}>{icon}</span>
              <span style={{ color: 'var(--white-dim)', fontSize: '0.96rem', lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>

        {[
          { icon: '✉', label: 'Email', val: 'vittyagency@gmail.com' },
          { icon: '🌐', label: 'Website', val: 'vittyagency.com' },
          { icon: '⏱', label: 'Response Time', val: 'Within 24 hours' },
        ].map(({ icon, label, val }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{
              width: 42, height: 42, flexShrink: 0,
              background: 'rgba(26,74,255,0.1)',
              border: '1px solid rgba(26,74,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: 'var(--cyan)',
              clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
            }}>{icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '2px', color: 'var(--white-muted)', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--white)', marginTop: 3 }}>{val}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.div
        ref={rightRef}
        initial={{ opacity: 0, x: 40 }}
        animate={rightVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{
          background: 'var(--navy)',
          border: '1px solid rgba(26,74,255,0.2)',
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--blue-glow), var(--cyan), var(--blue-glow))' }} />

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1.8rem', color: 'var(--white)' }}>
          Book Your Free AI Audit
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FormGroup label="First Name">
              <FormInput name="fname" value={form.fname} onChange={handleChange} placeholder="John" />
            </FormGroup>
            <FormGroup label="Last Name">
              <FormInput name="lname" value={form.lname} onChange={handleChange} placeholder="Doe" />
            </FormGroup>
          </div>
          <FormGroup label="Email Address" style={{ marginBottom: '1rem' }}>
            <FormInput name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
          </FormGroup>
          <FormGroup label="Company / Business" style={{ marginBottom: '1rem' }}>
            <FormInput name="company" value={form.company} onChange={handleChange} placeholder="Your Coaching Business" />
          </FormGroup>
          <FormGroup label="Service Interested In" style={{ marginBottom: '1rem' }}>
            <select
              name="service" value={form.service} onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select a Service</option>
              <option>AI Business Automation</option>
              <option>Lead Generation Systems</option>
              <option>CRM & Workflow Integration</option>
              <option>Client Retention & ROI Systems</option>
              <option>Full AI Automation Package</option>
            </select>
          </FormGroup>
          <FormGroup label="Tell Us About Your Business" style={{ marginBottom: '1.2rem' }}>
            <textarea
              name="message" value={form.message} onChange={handleChange}
              placeholder="Describe your coaching business, current operational challenges, and what success looks like for you..."
              style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }}
            />
          </FormGroup>

          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              width: '100%',
              fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--black)', background: status === 'sending' ? 'rgba(0,212,255,0.6)' : 'var(--cyan)',
              border: 'none', padding: '17px',
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              clipPath: 'polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (status !== 'sending') { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.4)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = status === 'sending' ? 'rgba(0,212,255,0.6)' : 'var(--cyan)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {status === 'sending' ? 'PREPARING...' : 'CLAIM MY FREE AI AUDIT →'}
          </button>

          {status === 'sent' && (
            <div style={{ marginTop: '1rem', padding: '10px 16px', borderLeft: '3px solid var(--cyan)', color: 'var(--cyan)', background: 'rgba(0,212,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              ✓ Email sent successfully.
            </div>
          )}
          {status === 'error' && (
            <div style={{ marginTop: '1rem', padding: '10px 16px', borderLeft: '3px solid #ff4444', color: '#ff6666', background: 'rgba(255,68,68,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              ⚠ Please fill in all required fields (Name, Email, Message).
            </div>
          )}
        </form>
      </motion.div>

      <EmailProviderChooser
        open={chooserOpen}
        onClose={() => {
          setChooserOpen(false)
          setStatus(null)
        }}
        onChoose={handleProviderChoose}
        title="Choose where to send"
        subtitle="Pick Gmail or Outlook to open this inquiry draft in your browser."
      />

      <style>{`
        @media (max-width: 900px) {
          #contact { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
        @media (max-width: 480px) {
          #contact form > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

const inputStyle = {
  background: 'rgba(5,8,16,0.85)',
  border: '1px solid rgba(26,74,255,0.28)',
  color: 'var(--white)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem', fontWeight: 500,
  padding: '11px 14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  appearance: 'none',
}

function FormInput({ name, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? 'var(--cyan)' : 'rgba(26,74,255,0.28)',
        boxShadow: focused ? '0 0 0 2px rgba(0,212,255,0.1)' : 'none',
      }}
    />
  )
}

function FormGroup({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--white-muted)' }}>{label}</label>
      {children}
    </div>
  )
}
