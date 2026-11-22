import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PHOTOS } from '../lib/photos'

export default function Connexion() {
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const [q] = useSearchParams()
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: mdp })
    setBusy(false)
    if (error) { setErr('Adresse ou mot de passe incorrect. Vérifie-les, puis réessaie.'); return }
    const suite = q.get('suite')
    if (suite && suite.startsWith('/parcours/')) window.location.href = suite
    else nav('/')
  }
  return (
    <div className="connexion">
      <div className="cote" style={{ backgroundImage: `url(${PHOTOS.cahier.url.replace('w=1800', 'w=1200')})` }}>
        <p>Un peu chaque jour, et le lundi se passe bien.</p>
      </div>
      <form onSubmit={go} className="papier-blanc">
        <h1>Connexion</h1>
        <label className="champ">Adresse e-mail
          <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="champ">Mot de passe
          <input type="password" autoComplete="current-password" required value={mdp} onChange={e => setMdp(e.target.value)} />
        </label>
        {err && <p className="erreur" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </div>
  )
}
