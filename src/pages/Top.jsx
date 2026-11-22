import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'

export default function Top({ apercu }) {
  const { profile } = useSession()
  const nav = useNavigate()
  async function sortir() { await supabase.auth.signOut(); nav('/connexion') }
  return (
    <div className="top">
      <div className="wrap">
        <Link className="logo" to="/">{profile?.role === 'prof' ? 'Espace prof' : 'Mon espace'}</Link>
        <nav aria-label="Compte">
          {profile?.role === 'prof' && (apercu ? <Link to="/">Retour au tableau de bord</Link> : <Link to="/apercu">Voir l'espace de l'élève</Link>)}
          <Link to="/mot-de-passe">Mot de passe</Link>
          <button onClick={sortir}>Se déconnecter</button>
        </nav>
      </div>
    </div>
  )
}
