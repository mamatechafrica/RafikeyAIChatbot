import confetti from 'canvas-confetti'
const brandColors = ['#fc8e13', '#3898f9', '#e252a9', '#ff3b3b', '#42D42C']

export function fallingConfetti() {
  const duration = 5 * 1000
  const end = Date.now() + duration

  ;(function frame() {
    confetti({
      particleCount: 2,
      startVelocity: 10,
      spread: 80,
      origin: { x: Math.random(), y: 0 },
      colors: brandColors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

// explosion from sides
export function sideBurstConfetti() {
  const duration = 3 * 1000
  const end = Date.now() + duration

  ;(function frame() {
    // 🎇 Left side burst
    confetti({
      particleCount: 6,
      startVelocity: 50,
      angle: 60,
      spread: 75,
      origin: { x: 0, y: 0.6 },
      colors: brandColors,
    })

    // 🎇 Right side burst
    confetti({
      particleCount: 6,
      startVelocity: 50,
      angle: 120,
      spread: 75,
      origin: { x: 1, y: 0.6 },
      colors: brandColors,
    })

    // keep bursting for a few seconds
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

export function failEffect() {
  const duration = 2 * 1000
  const end = Date.now() + duration

  const colors = ['#dc2626', '#b91c1c', '#7f1d1d'] // reds

  ;(function frame() {
    confetti({
      particleCount: 1,
      startVelocity: 10,
      spread: 40,
      ticks: 50,
      gravity: 1,
      scalar: 1.2,
      origin: { x: Math.random(), y: 0 },
      colors,
      shapes: ['square'], // looks heavier
    })

    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}
