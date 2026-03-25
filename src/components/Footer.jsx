import React from 'react'
import igIcon from '../assets/instagram.png'
import inIcon from '../assets/linkedin.png'
import gmIcon from '../assets/gmail.png'
import EmailProviderChooser, { buildWebmailComposeUrl } from './EmailProviderChooser.jsx'

const FOOTER_LINKS = {
  Services: [
    'AI Business Automation',
    'Lead Generation Systems',
    'CRM & Workflow Integration',
    'Client Retention & ROI Systems',
    'Full AI Automation Package',
  ],
  Company: ['About Us', 'Our Process', 'Contact', 'Careers'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

export default function Footer() {
  const [chooserOpen, setChooserOpen] = React.useState(false)

  const handleScroll = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  const openEmailCompose = (provider) => {
    const composeUrl = buildWebmailComposeUrl(provider, {
      to: 'vittyagency@gmail.com',
      subject: '[Vitty Agency] New Inquiry',
      body: '',
    })
    sessionStorage.setItem('vitty_email_pending', '1')
    const popup = window.open(composeUrl, '_blank')
    if (popup) popup.opener = null
    setChooserOpen(false)
  }

  return (
    <footer style={{
      background: 'var(--black)',
      borderTop: '1px solid rgba(26,74,255,0.2)',
      padding: '5rem 5vw 2.5rem',
      position: 'relative', zIndex: 1,
    }}>
      {/* Top grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
        gap: '3.5rem',
        paddingBottom: '3.5rem',
        borderBottom: '1px solid rgba(26,74,255,0.15)',
      }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem', fontWeight: 900,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: 'var(--white)', marginBottom: '1rem',
          }}>
            VITTY<span style={{ color: 'var(--cyan)' }}>.</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem', letterSpacing: '2px',
            color: 'var(--cyan)', marginBottom: '1.2rem',
          }}>
            Intelligent Systems. Unstoppable Growth.
          </div>
          <p style={{
            fontSize: '0.88rem', lineHeight: 1.75,
            color: 'var(--white-muted)', marginBottom: '1.8rem', maxWidth: 280,
          }}>
            We build intelligent AI automation systems for business coaches — eliminating operational complexity and delivering measurable ROI within 30 days.
          </p>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            {[
              { id: 'in', icon: inIcon, href: 'https://www.linkedin.com/company/vitty-agency/' },
              { id: 'ig', icon: igIcon, href: 'https://www.instagram.com/vitty.agency?igsh=bjBvODBoeGN0aWwy' },
              { id: 'gm', icon: gmIcon, href: '#', onClick: (e) => { e.preventDefault(); setChooserOpen(true) } }
            ].map((s) => (
              <SocialBtn key={s.id} icon={s.icon} href={s.href} onClick={s.onClick} />
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([col, links]) => (
          <div key={col}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--white)', marginBottom: '1.3rem',
            }}>
              {col}
            </div>
            <ul style={{ listStyle: 'none' }}>
              {links.map((link) => (
                <li key={link} style={{ marginBottom: '0.6rem' }}>
                  <FooterLink
                    href={col === 'Services' ? '#services' : col === 'Company' && link === 'Our Process' ? '#process' : col === 'Company' && link === 'About Us' ? '#about' : col === 'Company' && link === 'Contact' ? '#contact' : '#'}
                    onClick={(e) => {
                      const map = { 'Our Process': '#process', 'About Us': '#about', 'Contact': '#contact' }
                      const target = col === 'Services' ? '#services' : map[link]
                      if (target) handleScroll(e, target)
                    }}
                  >
                    {link}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '2rem',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem', letterSpacing: '1px',
          color: 'var(--white-muted)',
        }}>
          © {new Date().getFullYear()} <span style={{ color: 'var(--cyan)' }}>VITTY AGENCY</span>. All Rights Reserved. &nbsp;|&nbsp; vittyagency@gmail.com
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem', letterSpacing: '2px',
          color: 'rgba(240,244,255,0.18)',
        }}>

        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <EmailProviderChooser
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onChoose={openEmailCompose}
        title="Choose your email provider"
        subtitle="Open a new draft to vittyagency@gmail.com in your browser."
      />
    </footer>
  )
}

function FooterLink({ href, onClick, children }) {
  const [hov, setHov] = React.useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: '0.88rem',
        color: hov ? 'var(--cyan)' : 'var(--white-muted)',
        textDecoration: 'none', fontWeight: 500,
        transition: 'color 0.2s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      <span style={{ color: 'var(--cyan)', opacity: hov ? 1 : 0.5, transition: 'opacity 0.2s' }}>›</span>
      {children}
    </a>
  )
}

function SocialBtn({ icon, href, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      target={href && href.startsWith('http') ? '_blank' : '_self'}
      rel={href && href.startsWith('http') ? 'noopener noreferrer' : ''}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 36, height: 36,
        background: hov ? 'rgba(0,212,255,0.15)' : 'rgba(26,74,255,0.1)',
        border: `1px solid ${hov ? 'var(--cyan)' : 'rgba(26,74,255,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none',
        transition: 'all 0.2s',
        clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)',
      }}
    >
      <img 
        src={icon} 
        alt="social icon" 
        style={{ 
          width: 18, 
          height: 18, 
          objectFit: 'contain', 
          opacity: hov ? 1 : 0.7, 
          transition: 'all 0.2s' 
        }} 
      />
    </a>
  )
}
