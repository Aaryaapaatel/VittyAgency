import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Loader({ onComplete }) {
  const fullText = "VITTY"

  useEffect(() => {
    // 5 chars * 150ms + 500ms duration + 600ms visual hangtime = ~1800ms
    const timer = setTimeout(() => onComplete(), 1800)
    return () => clearTimeout(timer)
  }, [onComplete])

  const containerVar = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const charVar = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4, 14, 44, 1)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
      }}>
        <motion.span
          layoutId="vitty-logo"
          variants={containerVar}
          initial="hidden"
          animate="show"
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '3px',
            color: '#ffffff',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1,
            display: 'inline-flex',
            whiteSpace: 'nowrap',
          }}
        >
          {fullText.split('').map((char, i) => (
            <motion.span
              key={i}
              variants={charVar}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>

        {/* Blinking cursor */}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1,
            marginLeft: '5px',
          }}
        >
          |
        </motion.span>
      </div>
    </motion.div>
  )
}