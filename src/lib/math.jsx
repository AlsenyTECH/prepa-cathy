import { useEffect, useRef } from 'react'

let chargement = null
export function chargerMathJax() {
  if (chargement) return chargement
  chargement = new Promise((ok) => {
    window.MathJax = {
      tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']], macros: { R: '\\mathbb{R}', N: '\\mathbb{N}', Vect: '\\operatorname{Vect}' } },
      svg: { fontCache: 'global' },
      startup: { typeset: false, ready: () => { window.MathJax.startup.defaultReady(); window.MathJax.startup.promise.then(ok) } }
    }
    const s = document.createElement('script')
    s.src = '/parcours/assets/mathjax/tex-svg.js'; s.async = true
    document.head.appendChild(s)
  })
  return chargement
}

/** Affiche du HTML contenant des formules \( \) et les met en forme. */
export function Maths({ html, className, as: Tag = 'div' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.innerHTML = html || ''
    let annule = false
    chargerMathJax().then(() => { if (!annule && el.isConnected) window.MathJax.typesetPromise([el]).catch(() => {}) })
    return () => { annule = true }
  }, [html])
  return <Tag ref={ref} className={className} />
}
