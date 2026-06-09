import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  fontSize: number
  fontWeight: number
}

interface FloatingOEProps {
  text?: string
}

// A szöveg hossza alapján dinamikusan skálázzuk a méretet
function getScaleForText(text: string): { sizeMultiplier: number; count: number; speedMultiplier: number } {
  const len = text.length
  if (len <= 2) return { sizeMultiplier: 1.0, count: 45, speedMultiplier: 1.0 }       // OE
  if (len <= 4) return { sizeMultiplier: 0.8, count: 40, speedMultiplier: 1.0 }       // EDTI
  if (len <= 8) return { sizeMultiplier: 0.6, count: 30, speedMultiplier: 0.9 }       // Rövid szó
  if (len <= 15) return { sizeMultiplier: 0.4, count: 22, speedMultiplier: 0.8 }      // Közepesen hosszú
  return { sizeMultiplier: 0.28, count: 16, speedMultiplier: 0.7 }                    // Hosszú szöveg
}

export function FloatingOE({ text = 'OE' }: FloatingOEProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef(text)

  // Frissítsük a szöveget anélkül, hogy újra inicializálnánk a részecskéket
  useEffect(() => {
    textRef.current = text
  }, [text])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const particles: Particle[] = []
    const { sizeMultiplier, count, speedMultiplier } = getScaleForText(text)

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Inicializálás
    for (let i = 0; i < count; i++) {
      const baseRadius = 25 + Math.random() * 40
      const radius = baseRadius * sizeMultiplier
      particles.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 1.5 * speedMultiplier,
        vy: (Math.random() - 0.5) * 1.5 * speedMultiplier,
        radius: radius,
        opacity: 0.03 + Math.random() * 0.05,
        fontSize: radius * 1.8,
        fontWeight: Math.random() > 0.5 ? 700 : 800
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const themeData = document.querySelector('.overlay-scene')?.getAttribute('data-theme')
      const isVilagos = themeData === 'vilagos'
      const baseColor = isVilagos ? '1, 41, 139' : '255, 255, 255'

      const currentText = textRef.current

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        p1.x += p1.vx
        p1.y += p1.vy

        // Falról visszapattanás
        if (p1.x - p1.radius < 0) { p1.x = p1.radius; p1.vx *= -1 }
        if (p1.x + p1.radius > canvas.width) { p1.x = canvas.width - p1.radius; p1.vx *= -1 }
        if (p1.y - p1.radius < 0) { p1.y = p1.radius; p1.vy *= -1 }
        if (p1.y + p1.radius > canvas.height) { p1.y = canvas.height - p1.radius; p1.vy *= -1 }

        // Részecske ütközések
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < p1.radius + p2.radius) {
            const nx = dx / distance
            const ny = dy / distance
            const tx = -ny
            const ty = nx

            const dpNorm1 = p1.vx * nx + p1.vy * ny
            const dpTan1 = p1.vx * tx + p1.vy * ty
            const dpNorm2 = p2.vx * nx + p2.vy * ny
            const dpTan2 = p2.vx * tx + p2.vy * ty

            const m1 = p1.radius * p1.radius
            const m2 = p2.radius * p2.radius

            const m1_norm = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2)
            const m2_norm = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2)

            p1.vx = tx * dpTan1 + nx * m1_norm
            p1.vy = ty * dpTan1 + ny * m1_norm
            p2.vx = tx * dpTan2 + nx * m2_norm
            p2.vy = ty * dpTan2 + ny * m2_norm

            const overlap = (p1.radius + p2.radius - distance) / 2
            p1.x -= overlap * nx
            p1.y -= overlap * ny
            p2.x += overlap * nx
            p2.y += overlap * ny
          }
        }

        // Kirajzolás
        ctx.font = `${p1.fontWeight} ${p1.fontSize}px 'Open Sans', system-ui, sans-serif`
        ctx.fillStyle = `rgba(${baseColor}, ${p1.opacity})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(currentText, p1.x, p1.y)
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [text]) // Re-init particles when text changes (different sizing)

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'overlay' }}
    />
  )
}
