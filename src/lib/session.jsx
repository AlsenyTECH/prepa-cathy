import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const Ctx = createContext(null)
export function SessionProvider({ children }) {
  const [state, setState] = useState({ loading: true, session: null, profile: null })
  useEffect(() => {
    let alive = true
    async function load(session) {
      if (!session) { alive && setState({ loading: false, session: null, profile: null }); return }
      const { data } = await supabase.from('profiles').select('id, role, prenom, nom').eq('id', session.user.id).maybeSingle()
      alive && setState({ loading: false, session, profile: data })
    }
    supabase.auth.getSession().then(({ data }) => load(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { setTimeout(() => load(session), 0) })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>
}
export const useSession = () => useContext(Ctx)
