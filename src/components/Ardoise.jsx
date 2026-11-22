import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { getStroke } from 'perfect-freehand'

/* Ardoise en coordonnées logiques : largeur 1000, hauteur variable.
   Un trait = { c: couleur, s: taille, p: [[x, y, pression], ...] }. */
export const LARGEUR = 1000
const INTERLIGNE = 44

function chemin(trait) {
  const pts = getStroke(trait.p, { size: trait.s, thinning: 0.55, smoothing: 0.5, streamline: 0.45, simulatePressure: trait.sim !== false })
  const path = new Path2D()
  if (!pts.length) return path
  path.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
  }
  path.closePath()
  return path
}

export function dessiner(ctx, traits, hauteur, { lignes = true, fond = null, blanc = true } = {}) {
  if (blanc) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, LARGEUR, hauteur) }
  if (fond) ctx.drawImage(fond, 0, 0, LARGEUR, fond.naturalHeight * LARGEUR / fond.naturalWidth)
  else if (lignes) {
    ctx.strokeStyle = 'rgba(36,73,216,.13)'; ctx.lineWidth = 1.5
    for (let y = INTERLIGNE * 1.5; y < hauteur; y += INTERLIGNE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LARGEUR, y); ctx.stroke() }
    ctx.strokeStyle = 'rgba(196,31,46,.22)'; ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(80, hauteur); ctx.stroke()
  }
  for (const t of traits) { ctx.fillStyle = t.c; ctx.fill(chemin(t)) }
}

/** Exporte des traits en PNG (Blob). transparent : seulement l'encre (pour les annotations). */
export function versPNG(traits, hauteur, { transparent = false, echelle = 1.4 } = {}) {
  const c = document.createElement('canvas')
  c.width = Math.round(LARGEUR * echelle); c.height = Math.round(hauteur * echelle)
  const ctx = c.getContext('2d'); ctx.scale(echelle, echelle)
  dessiner(ctx, traits, hauteur, { blanc: !transparent, lignes: !transparent })
  return new Promise(ok => c.toBlob(ok, 'image/png'))
}

export default function Ardoise({ ref, traits, onTraits, hauteur, couleur = '#1f3fbf', taille = 4.2, outil = 'stylo', fond = null, lectureSeule = false, label = 'Zone de réponse' }) {
  const cv = useRef(null), boite = useRef(null)
  const enCours = useRef(null), traitsRef = useRef(traits)
  const [stylet, setStylet] = useState(false)
  const [img, setImg] = useState(null)
  const [larg, setLarg] = useState(0)
  traitsRef.current = traits

  useEffect(() => {
    if (!fond) { setImg(null); return }
    const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => setImg(i); i.src = fond
  }, [fond])

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setLarg(e.contentRect.width))
    ro.observe(boite.current); return () => ro.disconnect()
  }, [])

  const hReelle = img ? Math.max(hauteur, img.naturalHeight * LARGEUR / img.naturalWidth) : hauteur

  function rendre() {
    const c = cv.current; if (!c || !larg) return
    const dpr = window.devicePixelRatio || 1, k = larg / LARGEUR
    c.width = Math.round(larg * dpr); c.height = Math.round(hReelle * k * dpr)
    const ctx = c.getContext('2d'); ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0)
    const tous = enCours.current ? [...traitsRef.current, enCours.current] : traitsRef.current
    dessiner(ctx, tous, hReelle, { fond: img })
  }
  useEffect(rendre, [traits, larg, hReelle, img])

  useImperativeHandle(ref, () => ({ hauteur: hReelle }), [hReelle])

  function pos(e) {
    const r = cv.current.getBoundingClientRect(), k = LARGEUR / r.width
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k, e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5]
  }
  function gommer(p) {
    const avant = traitsRef.current
    const apres = avant.filter(t => !t.p.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 20))
    if (apres.length !== avant.length) onTraits(apres)
  }
  function down(e) {
    if (lectureSeule) return
    if (e.pointerType === 'pen' && !stylet) setStylet(true)
    if (e.pointerType === 'touch' && stylet) return // la paume ou le doigt ne dessinent pas quand un stylet est utilisé
    e.preventDefault(); try { cv.current.setPointerCapture(e.pointerId) } catch (er) { }
    const p = pos(e)
    if (outil === 'gomme') { enCours.current = { gomme: true }; gommer(p); return }
    enCours.current = { c: couleur, s: taille, p: [p], sim: e.pointerType !== 'pen' }
    rendre()
  }
  function move(e) {
    const t = enCours.current; if (!t) return
    const evts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
    if (t.gomme) { gommer(pos(e)); return }
    for (const ev of evts) t.p.push(pos(ev))
    rendre()
  }
  function up() {
    const t = enCours.current; enCours.current = null
    if (!t || t.gomme) return
    if (t.p.length === 1) t.p.push([t.p[0][0] + 0.5, t.p[0][1] + 0.5, t.p[0][2]])
    t.p = t.p.map(([x, y, z]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(z * 100) / 100])
    onTraits([...traitsRef.current, t])
  }

  return (
    <div ref={boite} className="ardoise">
      <canvas ref={cv} aria-label={label} role="img"
        style={{ width: '100%', height: larg ? hReelle * larg / LARGEUR : 300, touchAction: lectureSeule || stylet ? 'pan-y' : 'none', cursor: lectureSeule ? 'default' : outil === 'gomme' ? 'cell' : 'crosshair' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
    </div>
  )
}
