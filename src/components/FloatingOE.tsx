export function FloatingOE() {
  // Generate 18 particles with random starting positions and animation delays
  const particles = Array.from({ length: 18 }).map((_, i) => {
    // Generate pseudo-random deterministic values based on index
    const left = (i * 17 + 23) % 100 // 0-100%
    const top = (i * 29 + 11) % 100 // 0-100%
    const scale = 0.5 + ((i * 13) % 15) / 10 // 0.5 - 1.9
    const delay = (i * 7) % 40 // 0 - 40s
    const duration = 40 + (i * 3) % 30 // 40 - 70s
    const isReverse = i % 2 === 0
    const opacity = 0.03 + ((i * 5) % 5) / 100 // 0.03 - 0.07

    return (
      <div
        key={i}
        className="floating-oe-item"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          opacity: opacity,
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`,
          animationDirection: isReverse ? 'reverse' : 'normal',
          '--s': scale,
        } as React.CSSProperties}
      >
        OE
      </div>
    )
  })

  return (
    <div className="floating-oe-container">
      {particles}
    </div>
  )
}
