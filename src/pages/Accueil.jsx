import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'
import { PHOTOS } from '../lib/photos'
import { dateLongue, joursAvant, prochainLundi, dansNJours, serieJours } from '../lib/dates'
import { calculer } from '../lib/tampons'
import PARCOURS from '../parcours.json'
import Top from './Top'

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
  }, [id])

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
              <p>15 minutes, 3 questions, comme le lundi. Elle arrive très bientôt dans ton espace.</p>
              <button className="btn" disabled>Commencer l'évaluation</button>
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
          <p className="sous">{tampons.filter(t => t.gagne).length} sur {tampons.length}. Chaque tampon marque quelque chose que tu as vraiment fait.</p>
          <div className="tampons">
            {tampons.map((t, i) => t.gagne ? (
              <div key={t.code} className={'tampon gagne' + (nouveaux.has(t.code) ? ' nouveau' : '')} style={{ '--r': `${[-4, 3, -2, 5, -6, 2][i % 6]}deg` }}>
                <b>{t.label}</b><small>Validé</small>
              </div>
            ) : (
              <div key={t.code} className="tampon pas"><b>{t.label}</b><small>{t.aide}</small></div>
            ))}
          </div>
        </section>
        <footer className="pied wrap">Cours d'après les fiches de S. Pellerin. Explications, vidéos et exercices : MathNexus.</footer>
      </main>
    </>
  )
}
