interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  tone?: "up" | "down" | "flat"
  className?: string
}

const toneColor = {
  up: "var(--success)",
  down: "var(--warning)",
  flat: "var(--muted-foreground)",
}

export function Sparkline({ data, width = 56, height = 16, tone = "flat", className }: SparklineProps) {
  if (data.length < 2) {
    return <span className="text-xs text-muted-foreground/60">—</span>
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = width / (data.length - 1)

  const points = data
    .map((value, index) => {
      const x = index * step
      const y = height - ((value - min) / span) * (height - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={points}
        fill="none"
        stroke={toneColor[tone]}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
