import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MotDePasse() {
  const [a, setA] = useState(''), [b, setB] = useState('')
  const [msg, setMsg] = useState(null)
  async function go(e) {
    e.preventDefault()
    if (a.length < 8) return setMsg({ err: 'Choisis au moins 8 caractères.' })
    if (a !== b) return setMsg({ err: 'Les deux mots de passe sont différents.' })
    const { error } = await supabase.auth.updateUser({ password: a })
    setMsg(error ? { err: 'Le mot de passe n\'a pas été changé : ' + error.message } : { ok: 'Mot de passe changé.' })
    if (!error) { setA(''); setB('') }
  }
  return (
    <div className="connexion" style={{ gridTemplateColumns: '1fr' }}>
      <form onSubmit={go}>
        <h1>Changer de mot de passe</h1>
        <label className="champ">Nouveau mot de passe<input type="password" autoComplete="new-password" value={a} onChange={e => setA(e.target.value)} /></label>
        <label className="champ">Confirme-le<input type="password" autoComplete="new-password" value={b} onChange={e => setB(e.target.value)} /></label>
        {msg?.err && <p className="erreur" role="alert">{msg.err}</p>}
        {msg?.ok && <p className="ok" role="status">{msg.ok}</p>}
        <button className="btn">Changer le mot de passe</button>
        <Link to="/">Retour à mon espace</Link>
      </form>
    </div>
  )
}
