const J = 86400000
export const debutJour = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
export function joursAvant(dateStr) {
  if (!dateStr) return null
  const cible = debutJour(new Date(dateStr + 'T00:00:00'))
  return Math.round((cible - debutJour()) / J)
}
export function prochainLundi() {
  const d = debutJour(); const n = (8 - d.getDay()) % 7 || 7
  const r = new Date(d.getTime() + n * J)
  return r.toISOString().slice(0, 10)
}
export function dansNJours(n) {
  if (n === null || n === undefined) return ''
  if (n < 0) return 'passée'
  if (n === 0) return "aujourd'hui"
  if (n === 1) return 'demain'
  return `dans ${n} jours`
}
export const dateLongue = (d = new Date()) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
export function serieJours(dates) {
  // nombre de jours consécutifs (jusqu'à aujourd'hui ou hier) avec au moins une activité
  const jours = new Set(dates.map(d => debutJour(new Date(d)).getTime()))
  let t = debutJour().getTime()
  if (!jours.has(t)) t -= J
  let n = 0
  while (jours.has(t)) { n++; t -= J }
  return n
}
