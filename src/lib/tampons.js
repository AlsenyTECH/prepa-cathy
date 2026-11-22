import PARCOURS from '../parcours.json'

const ids = (pid, pred) => PARCOURS.find(p => p.id === pid).steps.map(s => s.id).filter(pred)
const range = (pfx, a, b) => Array.from({ length: b - a + 1 }, (_, i) => pfx + (a + i))

// Chaque tampon : un code, ce qui est écrit dessus, et ce qu'il faut faire pour l'obtenir.
export const TAMPONS = [
  { code: 'premier-pas', label: 'Premier pas', aide: 'Valide ta première étape', test: (d) => d.total >= 1 },
  { code: 'recurrence', label: 'Récurrence maîtrisée', aide: 'Étape « Le raisonnement par récurrence »', test: (d) => d.has('suites-fonctions', ['s4']) },
  { code: 'suites', label: 'Suites : bien joué', aide: 'Toute la partie A des suites (chapitre II)', test: (d) => d.has('suites-fonctions', range('s', 1, 8)) },
  { code: 'demos-2', label: 'Démonstrations du chapitre II', aide: 'Les 8 étapes de démonstrations', test: (d) => d.has('suites-fonctions', range('d', 1, 8)) },
  { code: 'matrices', label: 'As des matrices', aide: 'Toute la partie Matrices (chapitre III)', test: (d) => d.has('algebre-lineaire', ids('algebre-lineaire', i => /^a\d/.test(i))) },
  { code: 'espaces', label: 'Espaces vectoriels', aide: 'Toute la partie Espaces vectoriels', test: (d) => d.has('algebre-lineaire', ids('algebre-lineaire', i => /^b\d/.test(i))) },
  { code: 'epsilon', label: 'Reine des ε', aide: 'Définition, unicité, opérations et gendarmes (chapitre IV)', test: (d) => d.has('limites', ['l1', 'l2', 'l6', 'l9']) },
  { code: 'serie-3', label: '3 jours d\'affilée', aide: 'Travaille 3 jours de suite', test: (d) => d.serie >= 3 },
  { code: 'serie-7', label: 'Une semaine sans lâcher', aide: 'Travaille 7 jours de suite', test: (d) => d.serie >= 7 },
  ...PARCOURS.map(p => ({ code: 'fini-' + p.id, label: p.title + ' : terminé', aide: 'Termine le parcours ' + p.title, test: (d) => d.has(p.id, p.steps.map(s => s.id)) })),
]

export function calculer(progress, serie) {
  const set = new Set(progress.map(r => r.parcours + '/' + r.step))
  const d = { total: progress.length, serie, has: (pid, steps) => steps.length > 0 && steps.every(s => set.has(pid + '/' + s)) }
  return TAMPONS.map(t => ({ ...t, gagne: t.test(d) }))
}
