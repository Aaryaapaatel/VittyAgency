import React, { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'

const LETTERS = ['V', 'I', 'T', 'T', 'Y']

// Sub-component to handle hooks for each individual letter
const AnimatedLetter = ({ letter, index, total, progress }) => {
  const start = index / total
  const end = (index + 0.5) / total
  const opacity = useTransform(progress, [start, end], [0, 1])
  const y = useTransform(progress, [start, end], [10, 0])

  return (
    <motion.span style={{ opacity, y, display: 'inline-block' }}>
      {letter}
    </motion.span>
  )
}

export default function Loader({ onComplete }) {
  const progress = useMotionValue(0)
  const barWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 2.2,
      ease: "easeInOut",
      onComplete: () => {
        // Slight pause at the end for impact before revealing the site
        setTimeout(() => onComplete(), 500)
      }
    })
    return () => controls.stop()
  }, [progress, onComplete])

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--navy)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{ width: 'fit-content' }}>
        <div style={{
          display: 'flex',
          gap: '0.15em',
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 900,
          letterSpacing: '0.1em',
          color: '#fff',
          marginBottom: '0.5rem'
        }}>
          {LETTERS.map((char, i) => (
            <AnimatedLetter 
              key={i} 
              letter={char} 
              index={i} 
              total={LETTERS.length} 
              progress={progress} 
            />
          ))}
          <motion.span 
            style={{ 
              color: '#00d4ff', 
              opacity: useTransform(progress, [0.9, 1], [0, 1]) 
            }}
          >
            .
          </motion.span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <motion.div
            style={{
              width: barWidth,
              height: '100%',
              background: '#fff',
              boxShadow: '0 0 10px #fff'
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}