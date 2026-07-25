export function formatDuration(totalMinutes: number) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return "0min"
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}min`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h${String(minutes).padStart(2, "0")}`
}

export const durationOptions = [
  { label: "15min", value: 15 },
  { label: "30min", value: 30 },
  { label: "45min", value: 45 },
  { label: "1h", value: 60 },
  { label: "1h15", value: 75 },
  { label: "1h30", value: 90 },
  { label: "1h45", value: 105 },
  { label: "2h", value: 120 },
  { label: "2h30", value: 150 },
  { label: "3h", value: 180 },
  { label: "3h30", value: 210 },
  { label: "4h", value: 240 },
]