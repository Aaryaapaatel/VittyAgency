import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Process',  href: '#process'  },
  { label: 'About',    href: '#about'    },
  { label: 'Contact',  href: '#contact'  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5vw',
          height: scrolled ? 80 : 72,
          background: 'rgba(4, 14, 44, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid rgba(26,74,255,${scrolled ? 0.4 : 0.2})`,
          transition: 'height 0.3s, border-color 0.3s',
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNav(e, '#hero')}
          className="nav-logo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
          aria-label="Vitty home"
        >
          <img
            src="/favicon.png"
            alt="Vitty"
            className="nav-logo-img"
            style={{
              width: scrolled ? 310 : 322,
              height: scrolled ? 310 : 322,
              objectFit: 'contain',
              transition: 'width 0.3s, height 0.3s',
            }}
          />
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', margin: 0 }}
          className="nav-desktop">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <NavLink label={label} href={href} onClick={(e) => handleNav(e, href)} />
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#contact"
          onClick={(e) => handleNav(e, '#contact')}
          className="nav-desktop"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--black)',
            background: 'var(--cyan)',
            padding: '10px 22px',
            textDecoration: 'none',
            clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          Free AI Audit
        </a>

        {/* Hamburger */}
        <button
          className="nav-mobile"
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'flex', flexDirection: 'column', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: 24, height: 2,
              background: menuOpen && i === 1 ? 'transparent' : 'var(--cyan)',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                : i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none'
                : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: 60, left: 0, right: 0,
              background: 'rgba(5,8,16,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--navy-border)',
              padding: '2rem 5vw',
              zIndex: 999,
              display: 'flex', flexDirection: 'column', gap: '1.2rem',
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => handleNav(e, href)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600, fontSize: '1.1rem',
                  letterSpacing: '3px', textTransform: 'uppercase',
                  color: 'var(--white-dim)', textDecoration: 'none',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--navy-border)',
                }}
              >
                {label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => handleNav(e, '#contact')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--black)', background: 'var(--cyan)',
                padding: '12px 24px', textDecoration: 'none',
                textAlign: 'center', marginTop: '0.5rem',
                clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
              }}
            >
              Free AI Audit
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .nav-logo { margin-right: auto; }
          .nav-logo-img { width: 140px !important; height: 140px !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}

function NavLink({ label, href, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 600, fontSize: '0.85rem',
        letterSpacing: '2px', textTransform: 'uppercase',
        color: hov ? 'var(--cyan)' : 'var(--white-dim)',
        textDecoration: 'none',
        position: 'relative',
        transition: 'color 0.2s',
        paddingBottom: '4px',
      }}
    >
      {label}
      <span style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 1, width: hov ? '100%' : 0,
        background: 'var(--cyan)', transition: 'width 0.3s',
      }} />
    </a>
  )
}
