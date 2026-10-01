function channel(hex: string, i: number): number {
  return parseInt(hex.replace("#", "").slice(i, i + 2), 16)
}

function toHex(v: number): string {
  return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")
}

export function soft(hex: string, amt = 0.2): string {
  return (
    "#" +
    toHex(channel(hex, 0) * amt + 246 * (1 - amt)) +
    toHex(channel(hex, 2) * amt + 245 * (1 - amt)) +
    toHex(channel(hex, 4) * amt + 235 * (1 - amt))
  )
}

export function shade(hex: string, amt: number): string {
  const m = (v: number) => (amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))
  return "#" + toHex(m(channel(hex, 0))) + toHex(m(channel(hex, 2))) + toHex(m(channel(hex, 4)))
}

export function rgba(hex: string, a: number): string {
  return `rgba(${channel(hex, 0)},${channel(hex, 2)},${channel(hex, 4)},${a})`
}

export function orbGrad(color: string): string {
  return `radial-gradient(circle at 33% 24%, ${shade(color, 0.34)}, ${color} 54%, ${shade(color, -0.28)})`
}
