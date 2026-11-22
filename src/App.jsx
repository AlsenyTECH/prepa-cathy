import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './lib/session'
import Connexion from './pages/Connexion'
import Accueil from './pages/Accueil'
import Prof from './pages/Prof'
import MotDePasse from './pages/MotDePasse'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function Garde({ children }) {
  const { loading, session, profile } = useSession()
  if (loading) return <div className="papier" style={{ minHeight: '100vh' }} />
  if (!session) return <Navigate to="/connexion" replace />
  if (!profile) return (
    <div className="connexion" style={{ gridTemplateColumns: '1fr' }}><form>
      <h1>Accès non autorisé</h1>
      <p>Ce compte n'a pas été invité. Demande à ton professeur de t'ajouter, puis reconnecte-toi.</p>
      <button className="btn" type="button" onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
    </form></div>
  )
  return children
}

function Apercu() {
  const [etat, setEtat] = useState({ charge: false, id: null })
  useEffect(() => { supabase.from('profiles').select('id').eq('role', 'eleve').limit(1).maybeSingle().then(({ data }) => setEtat({ charge: true, id: data?.id || null })) }, [])
  if (!etat.charge) return <div className="papier" style={{ minHeight: '100vh' }} />
  if (!etat.id) return (
    <div className="connexion" style={{ gridTemplateColumns: '1fr' }}><form>
      <h1>Pas encore d'élève</h1>
      <p>L'espace de l'élève s'affichera ici dès que son compte sera créé. Crée-le depuis la case « Créer le compte de l'élève » de ton tableau de bord.</p>
      <Link className="btn" to="/">Retour au tableau de bord</Link>
    </form></div>
  )
  return <Accueil eleveId={etat.id} apercu />
}

function Maison() {
  const { profile } = useSession()
  return profile.role === 'prof' ? <Prof /> : <Accueil />
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/" element={<Garde><Maison /></Garde>} />
      <Route path="/apercu" element={<Garde><Apercu /></Garde>} />
      <Route path="/mot-de-passe" element={<Garde><MotDePasse /></Garde>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
