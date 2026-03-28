import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import heroImg from '../assets/Animate_image_rotate_202603281700-ezgif.com-video-to-avif-converter.avif'
import mobileHeroImg from '../assets/mobile-hero.avif'

const STATS = [
  { num: '87', suffix: '%', label: 'Time Saved\nPer Week' },
  { num: '60', suffix: '%', label: 'Cost Reduction\nin Ops' },
  { num: '5x', suffix: '', label: 'Average ROI\nWithin 90 Days' },
  { num: '30', suffix: '+', label: 'Hours Recovered\nPer Week' },
]

export default function Hero() {
  const containerRef = useRef(null)
  const [statsVisible, setStatsVisible] = React.useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect() } },
      { threshold: 0.4 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const scrollToContact = (e) => {
    e.preventDefault()
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToServices = (e) => {
    e.preventDefault()
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background Images */}
      <img src={heroImg} alt="Hero Background Desktop" className="vitty-hero-bg vitty-desktop-bg" />
      <img src={mobileHeroImg} alt="Hero Background Mobile" className="vitty-hero-bg vitty-mobile-bg" />

      {/* Dark overlay */}
      <div className="vitty-hero-overlay" />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,74,255,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '120px 5vw 80px',
        maxWidth: 1400, margin: '0 auto'
      }}>

        <div className="hero-content-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: 800 }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--cyan)', marginBottom: '1.5rem',
            }}
          >
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse 2s infinite' }} />
            AI Automation Agency
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-1px', color: 'var(--white)', marginBottom: '1.5rem',
            }}
          >
            Build Smarter.<br />
            <span style={{ color: 'var(--cyan)' }}>Automate Everything.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.8,
              color: 'var(--white)', maxWidth: 600, margin: '0 auto 2.5rem',
              letterSpacing: '0.5px',
            }}
          >
            Vitty Agency builds intelligent AI automation systems for business coaches who are done trading time for tasks. Save 40+ hours a week, cut costs by up to 60%, and deliver measurable ROI within 30 days.
          </motion.p>

          <motion.div
            className="hero-btn-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <HeroBtn primary href="#contact" onClick={scrollToContact}>Book Free AI Audit →</HeroBtn>
            <HeroBtn href="#services" onClick={scrollToServices}>Our Services</HeroBtn>
          </motion.div>

        </div>

        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            display: 'flex', justifyContent: 'center', width: '100%',
            gap: '3rem', marginTop: '5rem',
            paddingTop: '3rem',
            borderTop: '1px solid rgba(26,74,255,0.2)',
            flexWrap: 'wrap',
          }}
        >
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} animate={statsVisible} />
          ))}
        </motion.div>

      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .vitty-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .vitty-desktop-bg { display: block; }
        .vitty-mobile-bg { display: none; }
        .vitty-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(4, 6, 20, 0.55);
          z-index: 1;
        }
        @media (max-width: 992px) {
          .hero-two-col { flex-direction: column; text-align: center; }
          .hero-text { text-align: center !important; display: flex; flex-direction: column; alignItems: center; }
          .hero-text p { margin-left: auto; margin-right: auto; }
          .hero-btn-group { justify-content: center !important; }
        }
        @media (max-width: 768px) {
          .vitty-desktop-bg { display: none; }
          .vitty-mobile-bg { display: block; object-position: bottom left; }
          .vitty-hero-overlay { background: rgba(4, 6, 20, 0.75); }
        }
      `}</style>
    </section>
  )
}

function HeroBtn({ primary, href, onClick, children }) {
  const [hov, setHov] = React.useState(false)
  const base = {
    fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
    letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none',
    padding: '16px 40px', cursor: 'pointer',
    clipPath: 'polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)',
    transition: 'all 0.25s', display: 'inline-block',
  }
  const styles = primary
    ? { ...base, color: 'var(--black)', background: hov ? 'var(--white)' : 'var(--cyan)', boxShadow: hov ? '0 0 40px rgba(0,212,255,0.5)' : 'none' }
    : { ...base, color: hov ? 'var(--cyan)' : 'var(--white)', background: 'transparent', border: `1px solid ${hov ? 'var(--cyan)' : 'rgba(240,244,255,0.25)'}`, boxShadow: hov ? '0 0 20px rgba(0,212,255,0.2)' : 'none' }
  return (
    <a href={href} style={styles} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </a>
  )
}

function StatItem({ num, suffix, label, animate }) {
  const ref = useRef(null)
  const n = parseInt(num)

  useEffect(() => {
    if (!animate || isNaN(n)) return
    let cur = 0
    const step = n / 60
    const timer = setInterval(() => {
      cur += step
      if (cur >= n) {
        if (ref.current) ref.current.textContent = num + suffix
        clearInterval(timer)
      } else {
        if (ref.current) ref.current.textContent = Math.floor(cur) + suffix
      }
    }, 20)
    return () => clearInterval(timer)
  }, [animate])

  return (
    <div style={{ textAlign: 'center' }}>
      <div ref={ref} style={{
        fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900,
        color: 'var(--white)', lineHeight: 1,
      }}>
        {isNaN(n) ? num + suffix : '0' + suffix}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        letterSpacing: '1.5px', color: 'var(--white-muted)',
        textTransform: 'uppercase', marginTop: 6, whiteSpace: 'pre-line',
      }}>{label}</div>
    </div>
  )
}
