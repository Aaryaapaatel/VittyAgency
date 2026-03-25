import React from 'react'
import { motion } from 'framer-motion'
import useReveal from './useReveal.js'
import { SectionLabel } from './Services.jsx'

const STEPS = [
  {
    num: '01',
    title: 'Free AI Audit',
    desc: 'We conduct a deep audit of every process in your coaching operation — identifying every operational leak, every manual task, and every missed automation opportunity. You walk away with a custom roadmap and projected ROI — even if you don\'t hire us.',
  },
  {
    num: '02',
    title: 'System Architecture',
    desc: 'We design your complete AI automation stack: CRM connections, lead pipelines, onboarding flows, communication triggers, and performance dashboards — all built around your specific coaching model and revenue goals.',
  },
  {
    num: '03',
    title: 'Precision Deployment',
    desc: 'Our team deploys your entire system with zero disruption to your existing operations. Within 30 days, your business is running on intelligent automation — client intake, follow-ups, scheduling, and reporting all handled automatically.',
  },
  {
    num: '04',
    title: 'Optimise & Scale',
    desc: 'Your systems get smarter over time. We continuously monitor performance, run optimisations, and scale what\'s working — compounding your cost savings and revenue gains month after month. Most clients break even within 30 days. Then they just profit.',
  },
]

export default function Process() {
  const [ref, visible] = useReveal()

  return (
    <section id="process" style={{
      padding: '120px 5vw',
      background: 'var(--navy)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left accent line */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 1,
        background: 'linear-gradient(to bottom, transparent, var(--blue-glow), transparent)',
      }} />

      <SectionLabel>HOW WE OPERATE</SectionLabel>
      <motion.h2
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 900, letterSpacing: '2px',
          textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '4rem',
        }}
      >
        THE VITTY<br />
        <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(240,244,255,0.3)' }}>PROTOCOL</span>
      </motion.h2>

      <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '4rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 500px', maxWidth: 800 }}>
          {STEPS.map((step, i) => (
            <ProcessStep key={step.num} {...step} delay={i * 0.12} isLast={i === STEPS.length - 1} />
          ))}
        </div>
        
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <AnimatedGraph />
        </div>
      </div>
    </section>
  )
}

function ProcessStep({ num, title, desc, delay, isLast }) {
  const [ref, visible] = useReveal()
  const [hov, setHov] = React.useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        gap: '2rem',
        paddingTop: '2.5rem',
        paddingBottom: isLast ? '0' : '2.5rem',
        borderBottom: isLast ? 'none' : '1px solid rgba(26,74,255,0.15)',
        paddingLeft: hov ? '1rem' : 0,
        transition: 'padding-left 0.3s',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900,
          color: 'transparent',
          WebkitTextStroke: `1px ${hov ? 'var(--cyan)' : 'rgba(26,74,255,0.5)'}`,
          lineHeight: 1, transition: 'all 0.3s',
        }}>{num}</div>
        {!isLast && <div style={{ width: 1, flex: 1, minHeight: 40, background: 'rgba(26,74,255,0.2)' }} />}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700,
          letterSpacing: '2px', textTransform: 'uppercase',
          color: hov ? 'var(--cyan)' : 'var(--white)',
          marginBottom: '0.75rem', transition: 'color 0.25s',
        }}>{title}</div>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--white-muted)' }}>{desc}</div>
      </div>
    </motion.div>
  )
}

function AnimatedGraph() {
  const [ref, visible] = useReveal()
  const bars = [
    { height: '35%', color: 'rgba(26, 74, 255, 0.8)' },
    { height: '55%', color: 'var(--blue-glow)' },
    { height: '80%', color: 'var(--cyan)' },
    { height: '100%', color: 'var(--white)' },
  ];

  return (
    <div 
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 'clamp(1rem, 2vw, 2rem)',
        height: '400px',
        width: '100%',
        maxWidth: '500px',
        padding: '2rem 2rem 2.1rem 2rem', // slightly more bottom padding for axis
        background: 'rgba(26, 74, 255, 0.03)',
        borderRadius: '24px',
        border: '1px solid rgba(26, 74, 255, 0.1)',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}
    >
      {/* Background grid lines */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(26, 74, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 74, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        backgroundPosition: 'center center',
        opacity: 0.5,
        zIndex: 0,
        borderRadius: '24px'
      }} />

      {bars.map((bar, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={visible ? { height: bar.height, opacity: 1 } : {}}
          transition={{
            duration: 1.2,
            delay: 0.3 + i * 0.2,
            type: 'spring',
            stiffness: 40
          }}
          style={{
            flex: 1,
            maxWidth: '60px',
            background: `linear-gradient(to top, rgba(26,74,255,0.1), ${bar.color})`,
            borderRadius: '8px 8px 0 0',
            boxShadow: `0 0 20px ${bar.color}33`,
            position: 'relative',
            zIndex: 1,
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none'
          }}
        >
        </motion.div>
      ))}

      {/* Trend Arrow going up just above the bars */}
      <svg 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 2, 
          pointerEvents: 'none' 
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trendGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="var(--blue-glow)" />
            <stop offset="80%" stopColor="var(--cyan)" />
            <stop offset="100%" stopColor="var(--white)" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--white)" />
          </marker>
        </defs>
        <motion.line
          x1="15%" y1="60%" x2="85%" y2="5%"
          stroke="url(#trendGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={visible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
        />
      </svg>

      {/* Decorative Axes */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        right: '2rem',
        height: '2px',
        background: 'linear-gradient(90deg, rgba(26, 74, 255, 0.4), transparent)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        top: '2rem',
        width: '2px',
        background: 'linear-gradient(0deg, rgba(26, 74, 255, 0.4), transparent)',
        zIndex: 1
      }} />
    </div>
  )
}
