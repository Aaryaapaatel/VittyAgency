import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ loaderDone }) {
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

  // Define the common transition for the shared element and other nav items
  const sharedTransition = { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] };

  return (
    <>
      <motion.nav
        initial={{ y: 0, opacity: 0 }}
        animate={loaderDone ? { y: 0, opacity: 1 } : { y: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 5vw',
          height: scrolled ? 80 : 72,
          background: 'rgba(4, 14, 44, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid rgba(26,74,255,${scrolled ? 0.4 : 0.2})`,
          transition: 'height 0.3s, border-color 0.3s, background-color 0.3s',
        }}
      >
        <a
          href="#hero"
          onClick={(e) => handleNav(e, '#hero')}
          className="nav-logo"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
          aria-label="Vitty home"
        >
          <motion.span
            style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: scrolled ? '1.5rem' : '1.8rem', // Slightly shrink on scroll
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              transition: 'font-size 0.3s'
            }}
          >
            VITTY
          </motion.span>
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', margin: 0, padding: 0 }}
          className="nav-desktop">
          {NAV_LINKS.map(({ label, href }, i) => (
            <motion.li
              key={label}
              initial={{ y: -20, opacity: 0 }}
              animate={loaderDone ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
              // Staggered animation for nav links
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
            >
              <NavLink label={label} href={href} onClick={(e) => handleNav(e, href)} />
            </motion.li>
          ))}
        </ul>

        {/* Hamburger Menu Button (Mobile) */}
        <motion.button
          initial={{ y: -20, opacity: 0 }}
          animate={loaderDone ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.8 + NAV_LINKS.length * 0.1, ease: 'easeOut' }}
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
              // Middle line disappears when menu is open
              background: menuOpen && i === 1 ? 'transparent' : 'var(--cyan, #00d4ff)',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                  : i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none'
                : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </motion.button>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0,
              background: 'rgba(5,8,16,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--navy-border, rgba(26,74,255,0.2))',
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
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontWeight: 600, fontSize: '1.1rem',
                  letterSpacing: '3px', textTransform: 'uppercase',
                  color: 'var(--white-dim, rgba(255,255,255,0.7))', textDecoration: 'none',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--navy-border, rgba(26,74,255,0.2))',
                }}
              >
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile/Desktop display rules */}
      <style>{`
        /* Mobile-first: hide desktop links on tablets/phones */
        @media (max-width: 1024px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        /* Desktop and large tablets landscape */
        @media (min-width: 1025px) {
          .nav-mobile { display: none !important; }
          .nav-desktop { display: flex !important; }
        }
      `}</style>
    </>
  )
}

// NavLink component with hover effect
function NavLink({ label, href, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'var(--font-body, sans-serif)',
        fontWeight: 600, fontSize: '0.85rem',
        letterSpacing: '2px', textTransform: 'uppercase',
        color: hov ? 'var(--cyan, #00d4ff)' : 'var(--white-dim, rgba(255,255,255,0.7))',
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
        background: 'var(--cyan, #00d4ff)', transition: 'width 0.3s',
      }} />
    </a>
  )
}

