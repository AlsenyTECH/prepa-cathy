import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'
import { PHOTOS } from '../lib/photos'
import { dateLongue, joursAvant, prochainLundi, dansNJours, serieJours } from '../lib/dates'
import { calculer } from '../lib/tampons'
import PARCOURS from '../parcours.json'
import Top from './Top'
import { Link } from 'react-router-dom'
import { compterCartes } from './Cartes'
import { fmtNote } from '../lib/evals'

function salutation(prenom) {
  const h = new Date().getHours()
  return (h >= 18 || h < 4 ? 'Bonsoir ' : 'Bonjour ') + prenom
}

export default function Accueil({ eleveId, apercu }) {
  const { profile } = useSession()
  const [progress, setProgress] = useState([])
  const [settings, setSettings] = useState(null)
  const [eleve, setEleve] = useState(null)
  const id = eleveId || profile?.id

  useEffect(() => {
    if (!id) return
    supabase.from('progress').select('parcours, step, done_at').eq('user_id', id).then(({ data }) => setProgress(data || []))
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setSettings(data))
    supabase.from('profiles').select('prenom, nom').eq('id', id).maybeSingle().then(({ data }) => setEleve(data))
    supabase.from('evaluations').select('id, statut, note').eq('eleve_id', id).eq('kind', 'jour').eq('jour', new Date().toLocaleDateString('sv-SE')).maybeSingle().then(({ data }) => setEvalJour(data || false))
    supabase.from('evaluations').select('id, jour, note').eq('eleve_id', id).eq('statut', 'corrigee').order('jour', { ascending: false }).limit(1).maybeSingle().then(({ data }) => setDerniere(data))
    compterCartes(id).then(setCartes)
  }, [id])
  const [evalJour, setEvalJour] = useState(null)
  const [derniere, setDerniere] = useState(null)
  const [cartes, setCartes] = useState(null)

  const prenom = eleve?.prenom || profile?.prenom || ''
  const serie = useMemo(() => serieJours(progress.map(p => p.done_at)), [progress])
  const tampons = useMemo(() => calculer(progress, serie), [progress, serie])
  const nouveaux = useMemo(() => {
    let vus = []; try { vus = JSON.parse(localStorage.getItem('tampons-vus') || '[]') } catch (e) { }
    return new Set(tampons.filter(t => t.gagne && !vus.includes(t.code)).map(t => t.code))
  }, [tampons])
  useEffect(() => {
    if (apercu || !tampons.length) return
    try { localStorage.setItem('tampons-vus', JSON.stringify(tampons.filter(t => t.gagne).map(t => t.code))) } catch (e) { }
  }, [tampons, apercu])

  const [toutVoir, setToutVoir] = useState(false)
  const reprise = useMemo(() => {
    const recent = [...progress].sort((a, b) => b.done_at.localeCompare(a.done_at))[0]
    const p = PARCOURS.find(x => x.id === recent?.parcours) || PARCOURS[PARCOURS.length - 1]
    const faits = new Set(progress.filter(r => r.parcours === p.id).map(r => r.step))
    const s = p.steps.find(x => !faits.has(x.id))
    return s ? { p, s, debut: faits.size === 0 } : null
  }, [progress])
  const gagnes = tampons.filter(t => t.gagne), aFaire = tampons.filter(t => !t.gagne)
  const affiches = toutVoir ? tampons : [...gagnes, ...aFaire.slice(0, 3)]
  const evalJ = joursAvant(settings?.prochaine_eval || prochainLundi())
  const colleJ = joursAvant(settings?.prochaine_colle)
  const photo = PHOTOS.bureau

  return (
    <>
      <header className="hero">
        <div className="photo" style={{ backgroundImage: `url(${photo.url})` }} role="img" aria-label="Un bureau avec des notes de maths et une calculatrice" />
        <Top apercu={apercu} />
        <div className="wrap hero-in">
          <div>
            <h1 className="salut">{prenom ? salutation(prenom) : ' '}</h1>
            <p className="date">{dateLongue().replace(/^./, c => c.toUpperCase())}</p>
            <ul className="rebours">
              <li>Évaluation du lundi : <span className="marque">{dansNJours(evalJ)}</span></li>
              {colleJ !== null && colleJ >= 0 && <li>Prochaine colle : <span className="marque">{dansNJours(colleJ)}</span></li>}
            </ul>
            {reprise && (
              <a className="reprendre" href={`/parcours/${reprise.p.file}#${reprise.s.id}`}>
                <span className="rond" aria-hidden="true" />
                <span><small>{reprise.debut ? 'Commencer' : 'Reprendre'} · {reprise.p.title}</small><b>{reprise.s.title}</b></span>
              </a>
            )}
          </div>
          <aside className="postit" aria-label="Le mot de ton prof">
            <h2>Le mot de ton prof</h2>
            <p>{settings?.mot_du_prof || 'Bienvenue dans ton espace ! Ici, tu retrouves tes parcours, tes évaluations et tout ce que tu as déjà validé.'}</p>
            <p className="sign">MathNexus</p>
          </aside>
        </div>
        <p className="credit">Photo : <a href={photo.lien} target="_blank" rel="noreferrer">{photo.auteur}</a> / Unsplash</p>
      </header>

      <main className="papier">
        <section className="bloc wrap" aria-labelledby="t-jour">
          <h2 className="titre" id="t-jour">Aujourd'hui</h2>
          <p className="sous">Un peu chaque jour, c'est ce qui fait la différence le lundi.</p>
          <div className="jour">
            <div className="carte eval-jour">
              <h3>Ton évaluation du jour</h3>
              {evalJour && evalJour.statut === 'rendue' ? <p>Copie rendue, bravo. Ton prof la corrige ; tu verras la note ici.</p>
                : evalJour && evalJour.statut === 'corrigee' ? <p>Corrigée : <b className="marque">{fmtNote(evalJour.note)}/20</b>. Regarde les annotations de ton prof.</p>
                : evalJour && evalJour.statut === 'en_cours' ? <p>Tu l'as commencée : le chrono tourne toujours. Reprends-la vite.</p>
                : <p>15 minutes, 3 questions, comme le lundi : une question de cours, une démonstration, un exercice.</p>}
              <div className="actions">
                {apercu ? <span className="btn" aria-disabled="true">Aperçu</span>
                  : <Link className="btn" to={evalJour?.id && ['rendue', 'corrigee'].includes(evalJour.statut) ? '/evaluation/' + evalJour.id : '/evaluation'}>
                    {!evalJour || evalJour.statut === 'a_faire' ? 'Commencer l\'évaluation' : evalJour.statut === 'en_cours' ? 'Reprendre' : 'Voir ma copie'}</Link>}
                {!apercu && <Link className="lien" to="/historique">Mes évaluations{derniere ? ` (dernière note : ${fmtNote(derniere.note)})` : ''}</Link>}
              </div>
            </div>
            <div className="carte memo-accueil">
              <h3>Cartes mémo</h3>
              <p>{!cartes ? ' ' : cartes.aFaire === 0 ? 'Tout est à jour. Reviens demain pour la suite.' : `${cartes.aFaire} carte${cartes.aFaire > 1 ? 's' : ''} à revoir aujourd'hui, environ ${Math.max(2, Math.round(cartes.aFaire / 2))} minutes.`}</p>
              {!apercu && cartes?.aFaire > 0 && <Link className="btn ghost" to="/cartes">Réviser mes cartes</Link>}
            </div>
            <div className="carte serie">
              <span className="nb" aria-hidden="true">{serie}</span>
              <p><strong>{serie === 0 ? 'Pas encore de série' : serie === 1 ? 'jour de travail' : 'jours d\'affilée'}</strong>
                {serie === 0 ? 'Valide une étape aujourd\'hui pour la lancer.' : 'Reviens demain pour la prolonger.'}</p>
            </div>
          </div>
        </section>

        <section className="bloc wrap" aria-labelledby="t-parcours">
          <h2 className="titre" id="t-parcours">Mes parcours</h2>
          <p className="sous">Un parcours par chapitre du cours. Reprends là où tu t'es arrêtée.</p>
          <div className="parcours">
            {PARCOURS.map(p => {
              const faits = new Set(progress.filter(r => r.parcours === p.id).map(r => r.step))
              const n = p.steps.filter(s => faits.has(s.id)).length
              const suite = p.steps.find(s => !faits.has(s.id))
              const pct = Math.round(100 * n / p.steps.length)
              return (
                <article className="ligne-parcours" key={p.id}>
                  <div className="chiffre" aria-hidden="true"><small>Chapitre</small>{p.chap}</div>
                  <div>
                    <h3>{p.title}</h3>
                    <p className="infos">{p.steps.length} étapes, {p.videos} vidéos{suite && n > 0 ? `. Prochaine étape : ${suite.title}` : ''}</p>
                    <div className="trait" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={'Progression ' + p.title}><span style={{ width: pct + '%' }} /></div>
                    <p className="pct">{n === 0 ? 'Pas encore commencé' : `${n} sur ${p.steps.length} étapes validées`}</p>
                  </div>
                  {n === p.steps.length && <span className="tampon-mini">Terminé</span>}
                  <a className={'btn' + (n ? '' : ' ghost')} href={`/parcours/${p.file}${suite ? '#' + suite.id : ''}`}>
                    {n === 0 ? 'Commencer' : suite ? 'Continuer' : 'Revoir'}
                  </a>
                </article>
              )
            })}
          </div>
        </section>

        <section className="bloc wrap" aria-labelledby="t-tampons">
          <h2 className="titre" id="t-tampons">Mes tampons</h2>
          <p className="sous">{gagnes.length === 0 ? 'Tes prochains tampons à décrocher. Chacun marque quelque chose que tu as vraiment fait.' : `${gagnes.length} sur ${tampons.length}. Chacun marque quelque chose que tu as vraiment fait.`}</p>
          <div className="tampons">
            {affiches.map((t, i) => t.gagne ? (
              <div key={t.code} className={'tampon gagne' + (nouveaux.has(t.code) ? ' nouveau' : '')} style={{ '--r': `${[-4, 3, -2, 5, -6, 2][i % 6]}deg` }}>
                <b>{t.label}</b><small>Validé</small>
              </div>
            ) : (
              <div key={t.code} className="tampon pas"><b>{t.label}</b><small>{t.aide}</small></div>
            ))}
          </div>
          {aFaire.length > 3 && <button className="voir-tout" onClick={() => setToutVoir(v => !v)}>{toutVoir ? 'Voir moins de tampons' : `Voir les ${aFaire.length - 3} autres tampons`}</button>}
        </section>
        <footer className="pied wrap">Cours d'après les fiches de S. Pellerin. Explications, vidéos et exercices : MathNexus.</footer>
      </main>
    </>
  )
}
