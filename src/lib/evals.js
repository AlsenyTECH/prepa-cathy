import { supabase } from './supabase'

export const TYPES = { cours: 'Question de cours', demo: 'Démonstration', exercice: 'Exercice' }
export const DUREE = 900

export async function chargerEval(id) {
  const [{ data: ev, error }, { data: items }] = await Promise.all([
    supabase.from('evaluations').select('*').eq('id', id).maybeSingle(),
    supabase.from('eval_items').select('*, q:questions(titre, enonce, corrige, type, chapitre, partie, duree_min)').eq('evaluation_id', id).order('ordre')
  ])
  if (error || !ev) throw new Error(error?.message || 'Évaluation introuvable')
  return { ev, items: items || [] }
}

const cacheUrl = new Map()
export async function urlSignee(path) {
  if (!path) return null
  const c = cacheUrl.get(path)
  if (c && c.exp > Date.now()) return c.url
  const { data } = await supabase.storage.from('copies').createSignedUrl(path, 3600)
  if (data?.signedUrl) cacheUrl.set(path, { url: data.signedUrl, exp: Date.now() + 3000e3 })
  return data?.signedUrl || null
}

export function mmss(s) {
  const neg = s < 0; s = Math.abs(Math.round(s))
  return (neg ? '−' : '') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
}

export function fmtNote(n) { return n == null ? '–' : String(Math.round(n * 10) / 10).replace('.', ',') }

export function dateCourte(d) {
  return new Date(d + (d.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}
