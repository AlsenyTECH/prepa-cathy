import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { prochainLundi, serieJours } from '../lib/dates'
import PARCOURS from '../parcours.json'
import Top from './Top'
import { Link } from 'react-router-dom'
import { fmtNote, dateCourte, mmss } from '../lib/evals'

function Programme() {
  const [parties, setParties] = useState([])
  const [choix, setChoix] = useState(new Set())
  const [msg, setMsg] = useState('')
  useEffect(() => {
    supabase.from('questions').select('chapitre, partie, ordre').eq('actif', true).order('ordre').then(({ data }) => {
      const m = new Map()
      for (const q of data || []) { const k = q.chapitre + '|' + q.partie; m.set(k, { k, chapitre: q.chapitre, partie: q.partie, n: (m.get(k)?.n || 0) + 1 }) }
      setParties([...m.values()])
    })
    supabase.from('settings').select('programme').eq('id', 1).maybeSingle().then(({ data }) => setChoix(new Set(data?.programme || [])))
  }, [])
  function basculer(k) { setMsg(''); setChoix(c => { const n = new Set(c); n.has(k) ? n.delete(k) : n.add(k); return n }) }
  async function enregistrer() {
    const { error } = await supabase.from('settings').update({ programme: [...choix], updated_at: new Date().toISOString() }).eq('id', 1)
    setMsg(error ? 'Non enregistré : ' + error.message : 'Programme enregistré. Il s\'applique dès la prochaine évaluation du jour.')
  }
  const chapitres = [...new Set(parties.map(p => p.chapitre))]
  return (
    <section className="carte programme">
      <h2>Programme des évaluations du jour</h2>
      <p className="pct" style={{ marginTop: 0 }}>Coche les parties à évaluer. Chaque jour, Cathy reçoit une question de cours, une démonstration et un exercice tirés de ces parties, en priorité celles qu'elle n'a pas encore vues ou qu'elle a ratées. Rien de coché : tout le programme.</p>
      {chapitres.map(ch => (
        <fieldset key={ch}><legend>{ch}</legend>
          {parties.filter(p => p.chapitre === ch).map(p => (
            <label key={p.k} className="case"><input type="checkbox" checked={choix.has(p.k)} onChange={() => basculer(p.k)} />{p.partie} <small>({p.n})</small></label>
          ))}
        </fieldset>
      ))}
      <button className="btn" onClick={enregistrer}>Enregistrer le programme</button>
      {msg && <p className="ok" role="status">{msg}</p>}
    </section>
  )
}

function Copies({ eleveId }) {
  const [evs, setEvs] = useState(null)
  useEffect(() => {
    if (!eleveId) return
    supabase.from('evaluations').select('id, jour, statut, note, started_at, submitted_at').eq('eleve_id', eleveId).order('jour', { ascending: false }).limit(15).then(({ data }) => setEvs(data || []))
  }, [eleveId])
  const aCorriger = (evs || []).filter(e => e.statut === 'rendue')
  const autres = (evs || []).filter(e => e.statut !== 'rendue')
  const lib = { a_faire: 'pas commencée', en_cours: 'commencée, pas rendue', corrigee: 'corrigée' }
  return (
    <section className="carte">
      <h2>Copies à corriger{aCorriger.length ? ` (${aCorriger.length})` : ''}</h2>
      {!evs ? <p className="vide">Chargement…</p> : aCorriger.length === 0 ? <p className="vide">Aucune copie en attente.</p> : (
        <ul className="activite">{aCorriger.map(e => {
          const d = (new Date(e.submitted_at) - new Date(e.started_at)) / 1000
          return <li key={e.id}><span>{dateCourte(e.jour)} <small style={{ color: 'var(--doux)' }}>rendue en {mmss(d)}</small></span><Link className="btn" to={'/correction/' + e.id}>Corriger</Link></li>
        })}</ul>
      )}
      {autres.length > 0 && <><h3 className="h3-mini">Dernières évaluations</h3>
        <ul className="activite">{autres.slice(0, 7).map(e => (
          <li key={e.id}><span>{dateCourte(e.jour)}</span>
            {e.statut === 'corrigee' ? <Link to={'/correction/' + e.id}>{fmtNote(e.note)}/20</Link> : <span>{lib[e.statut]}</span>}</li>
        ))}</ul></>}
    </section>
  )
}

function Chronos({ eleveId }) {
  const [rows, setRows] = useState([])
  useEffect(() => {
    if (!eleveId) return
    supabase.from('exo_chronos').select('parcours, step, exo, secondes, objectif, at').eq('user_id', eleveId).order('at', { ascending: false }).limit(10).then(({ data }) => setRows(data || []))
  }, [eleveId])
  const ok = rows.filter(r => r.secondes <= r.objectif).length
  return (
    <section className="carte">
      <h2>Exercices chronométrés</h2>
      {rows.length === 0 ? <p className="vide">Cathy n'a pas encore lancé le chrono sur un exercice des parcours.</p> : <>
        <p className="pct" style={{ marginTop: 0 }}>{ok} sur {rows.length} dans le temps visé, sur les derniers essais.</p>
        <ul className="activite">{rows.map((r, i) => {
          const t = TITRES[r.parcours + '/' + r.step]
          return <li key={i}><span>{t ? t.etape : r.step}, exercice {r.exo}</span><span className={r.secondes <= r.objectif ? 'ok-txt' : 'lent-txt'}>{mmss(r.secondes)} / {r.objectif / 60} min</span></li>
        })}</ul></>}
    </section>
  )
}

const TITRES = Object.fromEntries(PARCOURS.flatMap(p => p.steps.map(s => [p.id + '/' + s.id, { parcours: p.title, etape: s.title }])))

export default function Prof() {
  const [eleve, setEleve] = useState(null)
  const [progress, setProgress] = useState([])
  const [form, setForm] = useState({ mot_du_prof: '', prochaine_eval: '', prochaine_colle: '' })
  const [msg, setMsg] = useState('')
  const [nouv, setNouv] = useState({ email: '', prenom: 'Cathy', nom: 'Monteiro', mdp: '' })
  const [msgCompte, setMsgCompte] = useState(null)
  async function creerEleve(e) {
    e.preventDefault(); setMsgCompte(null)
    const { data, error } = await supabase.rpc('creer_compte_eleve', { p_email: nouv.email, p_mdp: nouv.mdp, p_prenom: nouv.prenom, p_nom: nouv.nom })
    if (error) { setMsgCompte({ err: 'Compte non créé : ' + error.message }); return }
    setEleve({ id: data, prenom: nouv.prenom, nom: nouv.nom })
    setMsgCompte({ ok: `Compte créé. ${nouv.prenom} se connecte avec ${nouv.email} et le mot de passe que tu as choisi ; elle pourra le changer.` })
  }

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
          {eleve && <Copies eleveId={eleve.id} />}
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

          {!eleve && (
            <section className="carte">
              <h2>Créer le compte de l'élève</h2>
              <form className="form" onSubmit={creerEleve}>
                <div className="deux">
                  <label className="champ">Prénom<input required value={nouv.prenom} onChange={e => setNouv(n => ({ ...n, prenom: e.target.value }))} /></label>
                  <label className="champ">Nom<input value={nouv.nom} onChange={e => setNouv(n => ({ ...n, nom: e.target.value }))} /></label>
                </div>
                <label className="champ">Son adresse e-mail<input type="email" required value={nouv.email} onChange={e => setNouv(n => ({ ...n, email: e.target.value }))} /></label>
                <label className="champ">Mot de passe provisoire (8 caractères minimum)<input required minLength={8} value={nouv.mdp} onChange={e => setNouv(n => ({ ...n, mdp: e.target.value }))} /></label>
                <button className="btn">Créer le compte</button>
                {msgCompte?.err && <p className="erreur" role="alert">{msgCompte.err}</p>}
              </form>
            </section>
          )}
          {msgCompte?.ok && <section className="carte"><p className="ok" role="status" style={{ margin: 0 }}>{msgCompte.ok}</p></section>}

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

          <Programme />
          <Chronos eleveId={eleve?.id} />
        </div>
      </main>
    </>
  )
}
