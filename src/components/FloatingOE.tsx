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

export function FloatingOE() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const particles: Particle[] = []
    const numParticles = 45 // Kicsit több

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Inicializálás
    for (let i = 0; i < numParticles; i++) {
      const radius = 25 + Math.random() * 40 // Kisebbek, 25-65 sugarúak (kb 50-130px font)
      particles.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 1.5, // Kicsit gyorsabb mozgás
        vy: (Math.random() - 0.5) * 1.5,
        radius: radius,
        opacity: 0.03 + Math.random() * 0.05, // 3-8%
        fontSize: radius * 1.8,
        fontWeight: Math.random() > 0.5 ? 700 : 800
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const themeData = document.querySelector('.overlay-scene')?.getAttribute('data-theme')
      const isVilagos = themeData === 'vilagos'
      // A szöveg színe a témától függően legyen fekete vagy fehér, de nagyon átlátszó
      const baseColor = isVilagos ? '1, 41, 139' : '255, 255, 255'

      // Frissítés és ütközésvizsgálat
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
            // Egyszerű rugalmas ütközés (massza a területtel arányos)
            const nx = dx / distance
            const ny = dy / distance
            const tx = -ny
            const ty = nx

            // Sebességek pontszorzata a normál és érintő vektorokra
            const dpNorm1 = p1.vx * nx + p1.vy * ny
            const dpTan1 = p1.vx * tx + p1.vy * ty
            const dpNorm2 = p2.vx * nx + p2.vy * ny
            const dpTan2 = p2.vx * tx + p2.vy * ty

            const m1 = p1.radius * p1.radius
            const m2 = p2.radius * p2.radius

            // 1D rugalmas ütközés a normálon
            const m1_norm = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2)
            const m2_norm = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2)

            // Visszaalakítás x, y komponensekké
            p1.vx = tx * dpTan1 + nx * m1_norm
            p1.vy = ty * dpTan1 + ny * m1_norm
            p2.vx = tx * dpTan2 + nx * m2_norm
            p2.vy = ty * dpTan2 + ny * m2_norm

            // Szétválasztás, nehogy beragadjanak egymásba
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
        ctx.fillText("OE", p1.x, p1.y)
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'overlay' }}
    />
  )
}
