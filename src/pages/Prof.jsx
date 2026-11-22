import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { prochainLundi, serieJours } from '../lib/dates'
import PARCOURS from '../parcours.json'
import Top from './Top'

const TITRES = Object.fromEntries(PARCOURS.flatMap(p => p.steps.map(s => [p.id + '/' + s.id, { parcours: p.title, etape: s.title }])))

export default function Prof() {
  const [eleve, setEleve] = useState(null)
  const [progress, setProgress] = useState([])
  const [form, setForm] = useState({ mot_du_prof: '', prochaine_eval: '', prochaine_colle: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => data && setForm({
      mot_du_prof: data.mot_du_prof || '', prochaine_eval: data.prochaine_eval || '', prochaine_colle: data.prochaine_colle || ''
    }))
    supabase.from('profiles').select('id, prenom, nom').eq('role', 'eleve').limit(1).maybeSingle().then(({ data }) => {
      setEleve(data)
      if (data) supabase.from('progress').select('parcours, step, done_at').eq('user_id', data.id).order('done_at', { ascending: false })
        .then(({ data: p }) => setProgress(p || []))
    })
  }, [])

  async function enregistrer(e) {
    e.preventDefault(); setMsg('')
    const { error } = await supabase.from('settings').update({
      mot_du_prof: form.mot_du_prof, prochaine_eval: form.prochaine_eval || null,
      prochaine_colle: form.prochaine_colle || null, updated_at: new Date().toISOString()
    }).eq('id', 1)
    setMsg(error ? 'Non enregistré : ' + error.message : 'Enregistré. Cathy le verra à sa prochaine visite.')
  }
  const serie = useMemo(() => serieJours(progress.map(p => p.done_at)), [progress])
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <>
      <header className="prof-top">
        <Top />
        <div className="wrap">
          <h1>Tableau de bord</h1>
          <p>{eleve ? `${eleve.prenom} ${eleve.nom || ''} · série en cours : ${serie} jour${serie > 1 ? 's' : ''}` : 'Le compte de l\'élève n\'est pas encore créé.'}</p>
        </div>
      </header>
      <main className="papier" style={{ paddingBottom: 40 }}>
        <div className="wrap grille-prof">
          <section className="carte">
            <h2>Le mot du prof et les dates</h2>
            <form className="form" onSubmit={enregistrer}>
              <label className="champ">Message affiché sur le post-it
                <textarea rows="5" value={form.mot_du_prof} onChange={set('mot_du_prof')} placeholder="Par exemple : Cette semaine, on vise les démonstrations du chapitre IV…" />
              </label>
              <div className="deux">
                <label className="champ">Prochaine évaluation<input type="date" value={form.prochaine_eval} onChange={set('prochaine_eval')} /></label>
                <label className="champ">Prochaine colle<input type="date" value={form.prochaine_colle} onChange={set('prochaine_colle')} /></label>
              </div>
              <p className="pct" style={{ margin: 0 }}>Sans date, l'évaluation affichée est le lundi suivant ({new Date(prochainLundi() + 'T00:00:00').toLocaleDateString('fr-FR')}).</p>
              <button className="btn">Enregistrer</button>
              {msg && <p className="ok" role="status">{msg}</p>}
            </form>
          </section>

          <section className="carte">
            <h2>Progression</h2>
            <div className="mini-parcours">
              {PARCOURS.map(p => {
                const n = new Set(progress.filter(r => r.parcours === p.id).map(r => r.step)).size
                return (
                  <div key={p.id}>
                    <p><span>{p.title}</span><span>{n} / {p.steps.length}</span></p>
                    <div className="trait"><span style={{ width: (100 * n / p.steps.length) + '%' }} /></div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="carte">
            <h2>Activité récente</h2>
            {progress.length === 0 ? <p className="vide">Aucune étape validée pour l'instant.</p> : (
              <ul className="activite">
                {progress.slice(0, 12).map(r => {
                  const t = TITRES[r.parcours + '/' + r.step] || { parcours: r.parcours, etape: r.step }
                  return <li key={r.parcours + r.step}><span>{t.etape} <small style={{ color: 'var(--doux)' }}>({t.parcours})</small></span>
                    <span>{new Date(r.done_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>
                })}
              </ul>
            )}
          </section>

          <section className="carte">
            <h2>Copies à corriger</h2>
            <p className="vide">Les évaluations du jour arrivent à l'étape suivante : les copies de Cathy apparaîtront ici, prêtes à être annotées.</p>
          </section>
        </div>
      </main>
    </>
  )
}
