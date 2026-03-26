import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Loader({ onComplete }) {
  const fullText = "VITTY"

  useEffect(() => {
    // 5 chars * 100ms (stagger) + 800ms duration + 600ms visual hangtime = 1800ms
    const timer = setTimeout(() => onComplete(), 1800)
    return () => clearTimeout(timer)
  }, [onComplete])

  const containerVar = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }

  const topVar = {
    hidden: { y: '-100%', opacity: 0, filter: 'blur(4px)' },
    show: { y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  }

  const bottomVar = {
    hidden: { y: '100%', opacity: 0, filter: 'blur(4px)' },
    show: { y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
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
          overflow: 'hidden',
          padding: '10px',
      }}>
        <motion.span
          layoutId="vitty-logo"
          variants={containerVar}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95] }}
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
               style={{ position: 'relative', display: 'inline-block' }}
             >
               {/* Left Half (Vertical Split) */}
               <motion.span
                 variants={topVar}
                 style={{ 
                   position: 'absolute', 
                   left: 0, top: 0, 
                   clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' 
                 }}
               >
                 {char}
               </motion.span>
               
               {/* Right Half (Vertical Split) */}
               <motion.span
                 variants={bottomVar}
                 style={{ 
                   position: 'absolute', 
                   left: 0, top: 0, 
                   clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' 
                 }}
               >
                 {char}
               </motion.span>

               {/* Hidden placeholder for sizing */}
               <span style={{ opacity: 0 }}>{char}</span>
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