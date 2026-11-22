import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Maths } from '../lib/math'
import { chargerEval, DUREE, mmss, TYPES, urlSignee, fmtNote } from '../lib/evals'
import Ardoise, { versPNG } from '../components/Ardoise'
import { Chargement } from '../App'
import Top from './Top'

const ROUGE = '#c41f2e'

export default function Correction() {
  const { id } = useParams()
  const nav = useNavigate()
  const [d, setD] = useState(null)
  const [erreur, setErreur] = useState('')
  const [annot, setAnnot] = useState({})
  const [fonds, setFonds] = useState({})
  const [haut, setHaut] = useState({})
  const [pts, setPts] = useState({})
  const [com, setCom] = useState({})
  const [general, setGeneral] = useState('')
  const [note, setNote] = useState('')
  const [outil, setOutil] = useState('stylo')
  const [envoi, setEnvoi] = useState('')

  useEffect(() => {
    chargerEval(id).then(async (r) => {
      setD(r)
      setPts(Object.fromEntries(r.items.map(i => [i.id, i.points ?? ''])))
      setCom(Object.fromEntries(r.items.map(i => [i.id, i.commentaire || ''])))
      setGeneral(r.ev.commentaire || ''); setNote(r.ev.note ?? '')
      const f = {}
      for (const i of r.items) f[i.id] = await urlSignee(i.copie_path)
      setFonds(f)
    }).catch(e => setErreur(e.message))
  }, [id])

  if (erreur) return <p className="erreur wrap">{erreur}</p>
  if (!d) return <Chargement />
  const { ev, items } = d
  const somme = items.reduce((s, i) => s + (parseFloat(String(pts[i.id]).replace(',', '.')) || 0), 0)
  const bareme = items.reduce((s, i) => s + Number(i.bareme), 0) || 20
  const noteAuto = Math.round(20 * somme / bareme * 2) / 2
  const duree = ev.submitted_at && ev.started_at ? (new Date(ev.submitted_at) - new Date(ev.started_at)) / 1000 : null

  async function enregistrer() {
    setEnvoi('Enregistrement…')
    try {
      for (const it of items) {
        let annotation_path = it.annotation_path
        if ((annot[it.id] || []).length) {
          const basY = Math.max(...annot[it.id].flatMap(t => t.p.map(q => q[1])))
          const blob = await versPNG(annot[it.id], Math.ceil(basY + 40), { transparent: true })
          annotation_path = `${ev.eleve_id}/${ev.id}/${it.id}-annotation.png`
          const up = await supabase.storage.from('copies').upload(annotation_path, blob, { upsert: true, contentType: 'image/png' })
          if (up.error) throw up.error
        }
        const p = parseFloat(String(pts[it.id]).replace(',', '.'))
        const { error } = await supabase.from('eval_items').update({ points: isNaN(p) ? null : p, commentaire: com[it.id] || null, annotation_path }).eq('id', it.id)
        if (error) throw error
      }
      const n = note === '' ? noteAuto : parseFloat(String(note).replace(',', '.'))
      const { error } = await supabase.from('evaluations').update({ statut: 'corrigee', note: n, commentaire: general || null }).eq('id', ev.id)
      if (error) throw error
      nav('/')
    } catch (e) { setEnvoi(''); setErreur('Correction non enregistrée : ' + e.message) }
  }

  return (
    <>
      <header className="prof-top"><Top />
        <div className="wrap"><h1>Correction</h1>
          <p>{new Date(ev.jour + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {duree != null && ` · rendue en ${mmss(duree)}${duree > DUREE + 30 ? ` (${mmss(duree - DUREE)} de plus que les 15 min)` : ', dans le temps'}`}</p></div>
      </header>
      <main className="papier correction">
        <div className="wrap">
          <p className="sous">Annote en rouge directement sur la copie. L'encre verte de l'élève est ce qu'elle a écrit après les 15 minutes.</p>
          <div className="outils" role="toolbar" aria-label="Outils d'annotation">
            <button aria-pressed={outil === 'stylo'} onClick={() => setOutil('stylo')}><span className="pastille" style={{ background: ROUGE }} />Stylo rouge</button>
            <button aria-pressed={outil === 'gomme'} onClick={() => setOutil('gomme')}>Gomme</button>
          </div>
          {items.map((it, i) => (
            <section key={it.id} className="carte q-corrigee">
              <p className="q-type">Question {i + 1} · {TYPES[it.q.type]} · {it.q.partie}
                {it.temps_sec != null && <> · {mmss(it.temps_sec)} passées{it.temps_sec > it.temps_dans_delai_sec ? `, dont ${mmss(it.temps_sec - it.temps_dans_delai_sec)} après le temps` : ''}</>}</p>
              <Maths className="enonce" html={it.q.enonce} />
              <details className="corrige"><summary>Corrigé de référence</summary><Maths html={it.q.corrige} /></details>
              {it.copie_path ? (fonds[it.id] && <Ardoise traits={annot[it.id] || []} onTraits={t => setAnnot(a => ({ ...a, [it.id]: t }))}
                hauteur={haut[it.id] || 300} fond={fonds[it.id]} couleur={ROUGE} taille={3.6} outil={outil} label={'Copie, question ' + (i + 1)} />)
                : <p className="vide">Pas de copie pour cette question.</p>}
              {it.copie_path && <button className="voir-tout" onClick={() => setHaut(h => ({ ...h, [it.id]: (h[it.id] || 900) + 400 }))}>Ajouter de la place sous la copie</button>}
              {it.photo_path && <PhotoJointe path={it.photo_path} />}
              <div className="deux notation">
                <label className="champ">Points (sur {fmtNote(it.bareme)})
                  <input inputMode="decimal" value={pts[it.id]} onChange={e => setPts(p => ({ ...p, [it.id]: e.target.value }))} /></label>
                <label className="champ">Commentaire<input value={com[it.id]} onChange={e => setCom(c => ({ ...c, [it.id]: e.target.value }))} placeholder="Ce qui manque, ce qui est bien" /></label>
              </div>
            </section>
          ))}
          <section className="carte">
            <h2>Note et mot pour Cathy</h2>
            <div className="deux">
              <label className="champ">Note sur 20 (calculée : {fmtNote(noteAuto)})<input inputMode="decimal" value={note} placeholder={String(noteAuto).replace('.', ',')} onChange={e => setNote(e.target.value)} /></label>
              <label className="champ">Mot général<input value={general} onChange={e => setGeneral(e.target.value)} placeholder="Par exemple : bonne rédaction, attention au temps sur la démo" /></label>
            </div>
            <div className="pied-eval">
              <Link className="btn ghost" to="/">Annuler</Link>
              <button className="btn" onClick={enregistrer} disabled={!!envoi}>{envoi || 'Rendre la copie corrigée'}</button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

function PhotoJointe({ path }) {
  const [u, setU] = useState(null)
  useEffect(() => { urlSignee(path).then(setU) }, [path])
  return u ? <p><a href={u} target="_blank" rel="noreferrer">Ouvrir la photo jointe par l'élève</a></p> : null
}
