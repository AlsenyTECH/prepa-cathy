import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'
import { Maths } from '../lib/math'
import { chargerEval, DUREE, mmss, TYPES, urlSignee, fmtNote } from '../lib/evals'
import Ardoise, { versPNG } from '../components/Ardoise'
import { Chargement } from '../App'
import Top from './Top'

const BLEU = '#1f3fbf', VERT = '#0b7a46'
const H0 = 900

function lireLocal(id) { try { return JSON.parse(localStorage.getItem('eval-' + id) || 'null') } catch (e) { return null } }

export default function Evaluation() {
  const { id: idParam } = useParams()
  const [etat, setEtat] = useState({ charge: false })
  async function charger() {
    try {
      let id = idParam
      if (!id) { const { data, error } = await supabase.rpc('eval_du_jour'); if (error) throw error; id = data }
      setEtat({ charge: true, ...(await chargerEval(id)) })
    } catch (e) { setEtat({ charge: true, erreur: e.message }) }
  }
  useEffect(() => { charger() }, [idParam])

  if (!etat.charge) return <Chargement />
  return (
    <>
      <header className="prof-top eval-top"><Top /></header>
      <main className="papier eval-page">
        {etat.erreur ? <div className="wrap"><p className="erreur">Impossible d'ouvrir l'évaluation : {etat.erreur}</p></div>
          : etat.items.length === 0 ? <div className="wrap"><div className="carte"><h1>Pas de question aujourd'hui</h1><p>Le programme choisi par ton prof ne contient pas encore de question. Reviens un peu plus tard.</p><Link className="btn" to="/">Retour à mon espace</Link></div></div>
          : etat.ev.statut === 'a_faire' ? <Consignes ev={etat.ev} items={etat.items} onGo={charger} />
          : etat.ev.statut === 'en_cours' ? <Passage ev={etat.ev} items={etat.items} onRendu={charger} />
          : <Copie ev={etat.ev} items={etat.items} />}
      </main>
    </>
  )
}

function Consignes({ ev, items, onGo }) {
  const [go, setGo] = useState(false)
  async function commencer() {
    setGo(true)
    await supabase.from('evaluations').update({ statut: 'en_cours', started_at: new Date().toISOString() }).eq('id', ev.id)
    onGo()
  }
  let cumul = 0
  return (
    <div className="wrap consignes">
      <h1 className="titre">Évaluation du jour</h1>
      <p className="sous">15 minutes, {items.length} questions, comme le lundi. Le chrono démarre quand tu appuies sur « Commencer ».</p>
      <ol className="plan-eval">
        {items.map(it => { cumul += it.q.duree_min; return (
          <li key={it.id}><b>{TYPES[it.q.type]}</b><span>{it.q.partie}</span><span className="rythme">à finir vers {cumul} min · {fmtNote(it.bareme)} pts</span></li>
        ) })}
      </ol>
      <div className="carte aide-eval">
        <p>Écris au stylet directement sous chaque énoncé. Si tu manques de place, appuie sur « Ajouter de la place ».</p>
        <p>Les repères de rythme t'indiquent où tu devrais en être. Après 15 minutes, tu peux continuer : ton encre passe en vert, ton prof verra ce que tu as écrit après le temps.</p>
        <p>Tu peux aussi joindre une photo d'une feuille, si tu préfères le papier pour une question.</p>
      </div>
      <button className="btn grand" onClick={commencer} disabled={go}>{go ? 'C\'est parti…' : 'Commencer (15 min)'}</button>
    </div>
  )
}

function Passage({ ev, items, onRendu }) {
  const { session } = useSession()
  const local = useMemo(() => lireLocal(ev.id) || {}, [ev.id])
  const [traits, setTraits] = useState(local.traits || {})
  const [hauteurs, setHauteurs] = useState(local.hauteurs || {})
  const [actif, setActif] = useState(local.actif || items[0].id)
  const [outil, setOutil] = useState('stylo')
  const [photos, setPhotos] = useState({})
  const temps = useRef(local.temps || {}), delai = useRef(local.delai || {})
  const [maintenant, setMaintenant] = useState(Date.now())
  const [envoi, setEnvoi] = useState(null)
  const [confirmer, setConfirmer] = useState(false)
  const debut = new Date(ev.started_at).getTime()
  const ecoule = (maintenant - debut) / 1000
  const reste = DUREE - ecoule
  const couleur = reste > 0 ? BLEU : VERT

  useEffect(() => {
    const iv = setInterval(() => {
      setMaintenant(Date.now())
      if (document.visibilityState !== 'visible') return
      temps.current[actifRef.current] = (temps.current[actifRef.current] || 0) + 1
      if ((Date.now() - debut) / 1000 <= DUREE) delai.current[actifRef.current] = (delai.current[actifRef.current] || 0) + 1
    }, 1000)
    return () => clearInterval(iv)
  }, [debut])
  const actifRef = useRef(actif); actifRef.current = actif

  useEffect(() => {
    try { localStorage.setItem('eval-' + ev.id, JSON.stringify({ traits, hauteurs, actif, temps: temps.current, delai: delai.current })) } catch (e) { }
  }, [traits, hauteurs, actif, maintenant, ev.id])

  const reperes = useMemo(() => { let c = 0; return items.map(it => (c += it.q.duree_min)) }, [items])
  const idx = items.findIndex(i => i.id === actif)
  const it = items[idx]

  async function rendre() {
    setEnvoi('Envoi de ta copie…')
    try {
      const uid = session.user.id
      for (const item of items) {
        const h = hauteurs[item.id] || H0
        const blob = await versPNG(traits[item.id] || [], h)
        const chemin = `${uid}/${ev.id}/${item.id}.png`
        const up = await supabase.storage.from('copies').upload(chemin, blob, { upsert: true, contentType: 'image/png' })
        if (up.error) throw up.error
        let photo_path = null
        const f = photos[item.id]
        if (f) {
          photo_path = `${uid}/${ev.id}/${item.id}-photo.${(f.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')}`
          const r = await supabase.storage.from('copies').upload(photo_path, f, { upsert: true, contentType: f.type })
          if (r.error) throw r.error
        }
        const { error } = await supabase.from('eval_items').update({
          copie_path: chemin, photo_path, temps_sec: temps.current[item.id] || 0, temps_dans_delai_sec: delai.current[item.id] || 0
        }).eq('id', item.id)
        if (error) throw error
      }
      const { error } = await supabase.from('evaluations').update({ statut: 'rendue', submitted_at: new Date().toISOString() }).eq('id', ev.id)
      if (error) throw error
      try { localStorage.removeItem('eval-' + ev.id) } catch (e) { }
      onRendu()
    } catch (e) { setEnvoi(null); alert('La copie n\'est pas partie : ' + e.message + '. Vérifie ta connexion et réessaie, rien n\'est perdu.') }
  }

  const pct = Math.min(100, 100 * ecoule / DUREE)
  return (
    <div className="passage">
      <div className="barre-eval">
        <div className="wrap">
          <div className={'chrono-eval' + (reste <= 0 ? ' depasse' : reste < 120 ? ' bientot' : '')} role="timer" aria-label="Temps restant">
            {reste > 0 ? mmss(reste) : '+' + mmss(-reste)}
            <small>{reste > 0 ? 'restantes' : 'après le temps'}</small>
          </div>
          <div className="rythme-barre" aria-hidden="true">
            <span className="fait" style={{ width: pct + '%' }} />
            {reperes.slice(0, -1).map((m, i) => <i key={i} style={{ left: (100 * m / 15) + '%' }}><em>Q{i + 1}</em></i>)}
          </div>
          <nav className="onglets-q" aria-label="Questions">
            {items.map((x, i) => (
              <button key={x.id} aria-current={x.id === actif} onClick={() => setActif(x.id)}>
                Q{i + 1}{(traits[x.id] || []).length ? ' ✓' : ''}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="wrap">
        <article className="question">
          <p className="q-type">Question {idx + 1} · {TYPES[it.q.type]} · {fmtNote(it.bareme)} points · vise {it.q.duree_min} min</p>
          <Maths className="enonce" html={it.q.enonce} />
        </article>

        <div className="outils" role="toolbar" aria-label="Outils">
          <button aria-pressed={outil === 'stylo'} onClick={() => setOutil('stylo')}><span className="pastille" style={{ background: couleur }} />Stylo</button>
          <button aria-pressed={outil === 'gomme'} onClick={() => setOutil('gomme')}>Gomme</button>
          <button onClick={() => setTraits(t => ({ ...t, [actif]: (t[actif] || []).slice(0, -1) }))} disabled={!(traits[actif] || []).length}>Annuler</button>
          <button onClick={() => setHauteurs(h => ({ ...h, [actif]: (h[actif] || H0) + 450 }))}>Ajouter de la place</button>
          <label className="photo-btn">
            {photos[actif] ? 'Photo jointe ✓' : 'Joindre une photo'}
            <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) setPhotos(p => ({ ...p, [actif]: f })) }} />
          </label>
        </div>

        <Ardoise key={actif} traits={traits[actif] || []} onTraits={t => setTraits(x => ({ ...x, [actif]: t }))}
          hauteur={hauteurs[actif] || H0} couleur={couleur} outil={outil} label={'Ta réponse à la question ' + (idx + 1)} />

        <div className="pied-eval">
          {idx > 0 && <button className="btn ghost" onClick={() => setActif(items[idx - 1].id)}>Question précédente</button>}
          {idx < items.length - 1 ? <button className="btn" onClick={() => setActif(items[idx + 1].id)}>Question suivante</button>
            : !confirmer ? <button className="btn" onClick={() => setConfirmer(true)}>Rendre ma copie</button>
              : <span className="confirmer">Tu ne pourras plus modifier ta copie.
                <button className="btn" onClick={rendre} disabled={!!envoi}>{envoi || 'Oui, rendre'}</button>
                <button className="btn ghost" onClick={() => setConfirmer(false)} disabled={!!envoi}>Pas encore</button></span>}
        </div>
      </div>
    </div>
  )
}

export function ImageCopie({ copie, annotation, alt }) {
  const [u, setU] = useState({})
  useEffect(() => { Promise.all([urlSignee(copie), urlSignee(annotation)]).then(([c, a]) => setU({ c, a })) }, [copie, annotation])
  if (!copie) return <p className="vide">Pas de copie pour cette question.</p>
  return (
    <div className="copie-img">
      {u.c && <img src={u.c} alt={alt} />}
      {u.a && <img src={u.a} alt="Annotations du prof" />}
    </div>
  )
}

function LienPhoto({ path }) {
  const [u, setU] = useState(null)
  useEffect(() => { urlSignee(path).then(setU) }, [path])
  return u ? <a href={u} target="_blank" rel="noreferrer">Voir la photo jointe</a> : null
}

function Copie({ ev, items }) {
  const corrigee = ev.statut === 'corrigee'
  const duree = ev.submitted_at && ev.started_at ? (new Date(ev.submitted_at) - new Date(ev.started_at)) / 1000 : null
  return (
    <div className="wrap copie-vue">
      <h1 className="titre">{corrigee ? 'Ta copie corrigée' : 'Copie rendue'}</h1>
      <p className="sous">
        {new Date(ev.jour + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        {duree != null && ` · rendue en ${mmss(duree)}${duree <= DUREE + 30 ? ', dans le temps' : ''}`}
      </p>
      {corrigee ? (
        <div className="note-finale">
          <span className="note">{fmtNote(ev.note)}<small>/20</small></span>
          {ev.commentaire && <p className="postit-mini">{ev.commentaire}</p>}
        </div>
      ) : <div className="carte"><p style={{ margin: 0 }}>Bien joué, ta copie est partie. Ton prof va la corriger ; la note et ses annotations apparaîtront ici.</p></div>}

      {items.map((it, i) => (
        <section key={it.id} className="carte q-corrigee">
          <p className="q-type">Question {i + 1} · {TYPES[it.q.type]}{corrigee ? ` · ${fmtNote(it.points)} / ${fmtNote(it.bareme)}` : ''}
            {it.temps_sec != null && <> · {mmss(it.temps_sec)} passées</>}</p>
          <Maths className="enonce" html={it.q.enonce} />
          <ImageCopie copie={it.copie_path} annotation={it.annotation_path} alt={'Ta réponse à la question ' + (i + 1)} />
          {it.photo_path && <LienPhoto path={it.photo_path} />}
          {corrigee && it.commentaire && <p className="commentaire-prof">{it.commentaire}</p>}
          {corrigee && <details className="corrige"><summary>Voir le corrigé</summary><Maths html={it.q.corrige} /></details>}
        </section>
      ))}
      <div className="pied-eval"><Link className="btn ghost" to="/historique">Toutes mes évaluations</Link><Link className="btn" to="/">Retour à mon espace</Link></div>
    </div>
  )
}
