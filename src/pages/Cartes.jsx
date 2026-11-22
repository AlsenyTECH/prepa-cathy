import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'
import { Maths } from '../lib/math'
import { Chargement } from '../App'
import Top from './Top'

const INTERVALLES = [1, 2, 4, 8, 16]
const MAX = 12, MAX_NOUVELLES = 5
function jour(n = 0) { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE') }

export async function compterCartes(uid) {
  const [{ count: total }, { data: rev }] = await Promise.all([
    supabase.from('cartes').select('id', { count: 'exact', head: true }).eq('actif', true),
    supabase.from('revisions').select('prochaine').eq('user_id', uid)
  ])
  const dues = (rev || []).filter(r => r.prochaine <= jour()).length
  const nouvelles = Math.max(0, (total || 0) - (rev || []).length)
  return { dues, nouvelles, aFaire: Math.min(MAX, dues + Math.min(MAX_NOUVELLES, nouvelles)) }
}

export default function Cartes() {
  const { profile } = useSession()
  const [pile, setPile] = useState(null)
  const [revs, setRevs] = useState({})
  const [i, setI] = useState(0)
  const [retourne, setRetourne] = useState(false)
  const [bilan, setBilan] = useState({ ok: 0, ko: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('cartes').select('id, chapitre, partie, recto, verso, ordre').eq('actif', true).order('ordre'),
      supabase.from('revisions').select('*').eq('user_id', profile.id)
    ]).then(([{ data: cartes }, { data: rv }]) => {
      const r = Object.fromEntries((rv || []).map(x => [x.carte_id, x]))
      const dues = (cartes || []).filter(c => r[c.id] && r[c.id].prochaine <= jour()).sort((a, b) => r[a.id].prochaine.localeCompare(r[b.id].prochaine))
      const neuves = (cartes || []).filter(c => !r[c.id])
      const s = dues.slice(0, MAX)
      s.push(...neuves.slice(0, Math.min(MAX_NOUVELLES, MAX - s.length)))
      setRevs(r); setPile(s)
    })
  }, [profile.id])

  async function repondre(su) {
    const c = pile[i], r = revs[c.id]
    const boite = su ? Math.min(5, (r?.boite || 0) + 1) : 1
    const ligne = { user_id: profile.id, carte_id: c.id, boite, prochaine: jour(INTERVALLES[boite - 1]), vues: (r?.vues || 0) + 1, reussies: (r?.reussies || 0) + (su ? 1 : 0), updated_at: new Date().toISOString() }
    setRevs(x => ({ ...x, [c.id]: ligne }))
    setBilan(b => su ? { ...b, ok: b.ok + 1 } : { ...b, ko: b.ko + 1 })
    supabase.from('revisions').upsert(ligne).then(() => {})
    if (!su && !c.revue) setPile(p => [...p, { ...c, revue: true }]) // revue une fois en fin de séance
    setRetourne(false); setI(n => n + 1)
  }

  if (!pile) return <Chargement />
  const c = pile[i]
  return (
    <>
      <header className="prof-top"><Top /><div className="wrap"><h1>Cartes mémo</h1><p>Les définitions et énoncés à savoir par cœur. Une carte bien sue revient de plus en plus tard.</p></div></header>
      <main className="papier cartes-page">
        <div className="wrap">
          {pile.length === 0 ? (
            <div className="carte fini"><h2>Rien à revoir aujourd'hui</h2><p>Toutes tes cartes sont à jour. Reviens demain.</p><Link className="btn" to="/">Retour à mon espace</Link></div>
          ) : !c ? (
            <div className="carte fini">
              <h2>Séance terminée</h2>
              <p>{bilan.ok} carte{bilan.ok > 1 ? 's' : ''} sue{bilan.ok > 1 ? 's' : ''}{bilan.ko ? `, ${bilan.ko} à revoir demain` : ''}. Bravo, c'est en revenant chaque jour que ça rentre.</p>
              <Link className="btn" to="/">Retour à mon espace</Link>
            </div>
          ) : (
            <>
              <p className="compteur">Carte {Math.min(i + 1, pile.length)} sur {pile.length}{c.revue ? ' · deuxième passage' : !revs[c.id] ? ' · nouvelle' : ''}</p>
              <article className={'memo' + (retourne ? ' retourne' : '')}>
                <p className="q-type">{c.partie}</p>
                <Maths className="recto" html={c.recto} />
                {retourne && <Maths className="verso" html={c.verso} />}
              </article>
              <div className="pied-eval">
                {!retourne ? <button className="btn grand" onClick={() => setRetourne(true)}>Voir la réponse</button> : <>
                  <button className="btn ghost grand" onClick={() => repondre(false)}>À revoir</button>
                  <button className="btn grand" onClick={() => repondre(true)}>Je savais</button>
                </>}
              </div>
              {!retourne && <p className="pct" style={{ textAlign: 'center' }}>Essaie de répondre de tête, ou sur un brouillon, avant de retourner la carte.</p>}
            </>
          )}
        </div>
      </main>
    </>
  )
}
