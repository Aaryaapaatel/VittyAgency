import React, { useState, Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'

// Keep the Loader and Cursor as standard imports so they appear immediately
import Loader from './components/Loader.jsx'
import Cursor from './components/Cursor.jsx'

// Lazy load the rest of the components
const GearCanvas = lazy(() => import('./components/GearCanvas.jsx'))
const Navbar = lazy(() => import('./components/Navbar.jsx'))
const Hero = lazy(() => import('./components/Hero.jsx'))
const Marquee = lazy(() => import('./components/Marquee.jsx'))
const Services = lazy(() => import('./components/Services.jsx'))
const Process = lazy(() => import('./components/Process.jsx'))
const About = lazy(() => import('./components/About.jsx'))
const Contact = lazy(() => import('./components/Contact.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))

export default function App() {
  const [loaderVisible, setLoaderVisible] = useState(true)
  const [loaderDone, setLoaderDone] = useState(false)

  const handleLoaderComplete = () => {
    setTimeout(() => {
      setLoaderDone(true)
      setTimeout(() => setLoaderVisible(false), 900)
    }, 400)
  }

  return (
    <>
      <AnimatePresence>
        {loaderVisible && <Loader onComplete={handleLoaderComplete} />}
      </AnimatePresence>
      <Cursor />

      {/* Fixed background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(26,74,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,74,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Wrap lazy components in Suspense */}
      <Suspense fallback={null}>
        <GearCanvas />
        <Navbar loaderDone={loaderDone} />
        
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero />
          <Marquee />
          <Services />
          <Process />
          <About />
          <Contact />
        </main>
        
        <Footer />
      </Suspense>
    </>
  )
}
