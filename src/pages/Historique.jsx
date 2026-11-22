import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'
import { Maths } from '../lib/math'
import { DUREE, fmtNote, dateCourte, TYPES } from '../lib/evals'
import { Chargement } from '../App'
import Top from './Top'

const STATUTS = { a_faire: 'À faire', en_cours: 'Commencée', rendue: 'En correction', corrigee: 'Corrigée' }

function Courbe({ points }) {
  if (points.length < 2) return <p className="vide">La courbe apparaîtra après deux évaluations corrigées.</p>
  const W = 640, H = 200, px = 34, py = 18
  const x = i => px + i * (W - 2 * px) / (points.length - 1)
  const y = n => py + (20 - n) * (H - 2 * py) / 20
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.note).toFixed(1)}`).join(' ')
  return (
    <svg className="courbe" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={'Évolution des notes : ' + points.map(p => fmtNote(p.note)).join(', ')}>
      {[0, 10, 20].map(n => <g key={n}><line x1={px} x2={W - px} y1={y(n)} y2={y(n)} className={n === 10 ? 'mi' : 'grille'} /><text x={px - 8} y={y(n) + 4} textAnchor="end">{n}</text></g>)}
      <path d={d} className="trace" />
      {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.note)} r="4.5" className={p.aTemps ? 'pt' : 'pt lent'}><title>{dateCourte(p.jour)} : {fmtNote(p.note)}/20</title></circle>)}
    </svg>
  )
}

export default function Historique() {
  const { profile } = useSession()
  const [evs, setEvs] = useState(null)
  const [items, setItems] = useState([])
  useEffect(() => {
    supabase.from('evaluations').select('id, jour, kind, statut, note, started_at, submitted_at').eq('eleve_id', profile.id).order('jour', { ascending: false }).limit(90)
      .then(({ data }) => {
        setEvs(data || [])
        const corr = (data || []).filter(e => e.statut === 'corrigee').map(e => e.id)
        if (corr.length) supabase.from('eval_items').select('id, evaluation_id, points, bareme, question_id, q:questions(titre, partie, type, enonce, corrige)').in('evaluation_id', corr)
          .then(({ data: it }) => setItems(it || []))
      })
  }, [profile.id])

  const aTemps = e => e.submitted_at && e.started_at && (new Date(e.submitted_at) - new Date(e.started_at)) / 1000 <= DUREE + 30
  const corrigees = useMemo(() => (evs || []).filter(e => e.statut === 'corrigee' && e.note != null).reverse().map(e => ({ ...e, aTemps: aTemps(e) })), [evs])
  const rendues = (evs || []).filter(e => e.submitted_at)
  const pctTemps = rendues.length ? Math.round(100 * rendues.filter(aTemps).length / rendues.length) : null
  const dernieres = corrigees.slice(-7)
  const moyenne = dernieres.length ? dernieres.reduce((s, e) => s + Number(e.note), 0) / dernieres.length : null
  const aRefaire = useMemo(() => {
    const vu = new Map()
    for (const it of items) {
      const r = it.points == null ? null : it.points / it.bareme
      if (r != null && r < 0.6 && !vu.has(it.question_id)) vu.set(it.question_id, it)
    }
    return [...vu.values()]
  }, [items])

  if (!evs) return <Chargement />
  return (
    <>
      <header className="prof-top"><Top /><div className="wrap"><h1>Mes évaluations</h1><p>Tes notes, ton rythme, et ce qu'il reste à retravailler.</p></div></header>
      <main className="papier historique">
        <div className="wrap">
          <div className="chiffres">
            <div className="carte"><span className="gros">{fmtNote(moyenne)}</span><p>moyenne sur les {dernieres.length || 0} dernières corrigées</p></div>
            <div className="carte"><span className="gros">{pctTemps == null ? '–' : pctTemps + ' %'}</span><p>des copies rendues dans les 15 minutes</p></div>
            <div className="carte"><span className="gros">{rendues.length}</span><p>évaluation{rendues.length > 1 ? 's' : ''} rendue{rendues.length > 1 ? 's' : ''}</p></div>
          </div>

          <section className="carte"><h2>Mes notes</h2><Courbe points={corrigees} />
            {corrigees.length > 1 && <p className="pct">Les points orange sont les copies rendues après les 15 minutes.</p>}</section>

          <section className="carte">
            <h2>À refaire</h2>
            {aRefaire.length === 0 ? <p className="vide">Rien pour l'instant. Les questions où tu as eu moins de 60 % des points viendront ici, pour les retravailler.</p> : (
              <ul className="a-refaire">
                {aRefaire.map(it => (
                  <li key={it.id}>
                    <details>
                      <summary><b>{it.q.titre}</b> <small>{TYPES[it.q.type]} · {it.q.partie} · {fmtNote(it.points)}/{fmtNote(it.bareme)}</small></summary>
                      <Maths className="enonce" html={it.q.enonce} />
                      <details className="corrige"><summary>Voir le corrigé</summary><Maths html={it.q.corrige} /></details>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="carte">
            <h2>Toutes mes évaluations</h2>
            {evs.length === 0 ? <p className="vide">Aucune pour l'instant. La première t'attend sur ton espace.</p> : (
              <ul className="activite">
                {evs.map(e => (
                  <li key={e.id}><Link to={'/evaluation/' + e.id}>{dateCourte(e.jour)}</Link>
                    <span>{e.statut === 'corrigee' ? <b>{fmtNote(e.note)}/20</b> : STATUTS[e.statut]}</span></li>
                ))}
              </ul>
            )}
          </section>
          <div className="pied-eval"><Link className="btn" to="/">Retour à mon espace</Link></div>
        </div>
      </main>
    </>
  )
}
