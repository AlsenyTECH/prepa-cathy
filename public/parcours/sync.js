/* Synchronise la progression d'un parcours avec le compte de l'élève, et affiche les encouragements. */
(function () {
  var URL = 'https://plvqmscibjpfalkoqwpt.supabase.co';
  var KEYPUB = 'sb_publishable_cRRGKxfhT6pfCzAxU24f3Q_sDYw1RtN';
  var MAP = {
    'suites-fonctions.html': ['suites-fonctions', 'parcours-suites-fonctions-etapes'],
    'algebre-lineaire.html': ['algebre-lineaire', 'parcours-algebre-etapes'],
    'limites.html': ['limites', 'parcours-limites-etapes']
  };
  var file = location.pathname.split('/').pop();
  var conf = MAP[file];
  if (!conf || !window.supabase) return;
  var parcours = conf[0], LSKEY = conf[1];
  var sb = window.supabase.createClient(URL, KEYPUB);
  var user = null, prenom = 'Cathy', role = null;

  function readDone() { try { return JSON.parse(localStorage.getItem(LSKEY) || '{}') || {}; } catch (e) { return {}; } }

  // ----- encouragements -----
  var MSG = [
    'Bien joué {p} !', 'Une étape de plus, continue comme ça.', 'Très bien {p}, tu avances.',
    'Ça, tu sauras le refaire lundi.', 'Bravo, c\'est validé.', 'Encore une de faite, {p} !',
    'Régulière, c\'est comme ça qu\'on progresse.', 'Propre. On passe à la suite ?'
  ];
  function toast(text, big) {
    var d = document.createElement('div');
    d.setAttribute('role', 'status');
    d.textContent = text;
    d.style.cssText = 'position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) rotate(-1.5deg);z-index:99;' +
      'background:#fff7b8;color:#0a5f37;font-family:Kalam,"Comic Sans MS",cursive;font-size:' + (big ? '1.35rem' : '1.15rem') + ';' +
      'padding:12px 20px;border-radius:4px;box-shadow:0 8px 24px rgba(20,30,60,.18);max-width:min(92vw,520px);text-align:center;' +
      'transition:opacity .4s,transform .4s;opacity:0';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = '1'; });
    setTimeout(function () { d.style.opacity = '0'; setTimeout(function () { d.remove(); }, 450); }, big ? 4200 : 2600);
  }
  function encourage(nDone, total) {
    var r = nDone / total, prev = (nDone - 1) / total;
    var palier = null;
    if (r >= 1 && prev < 1) palier = 'Parcours terminé, ' + prenom + ' ! Un tampon t\'attend sur ton espace.';
    else if (r >= .75 && prev < .75) palier = 'Les trois quarts du parcours, ' + prenom + '. La fin est proche.';
    else if (r >= .5 && prev < .5) palier = 'La moitié du parcours est faite. Bravo ' + prenom + ' !';
    else if (r >= .25 && prev < .25) palier = 'Un quart du parcours déjà. Bon rythme !';
    toast(palier || MSG[Math.floor(Math.random() * MSG.length)].replace('{p}', prenom), !!palier);
  }

  // ----- écriture : on intercepte la sauvegarde de la page -----
  var setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    var before = k === LSKEY ? readDone() : null;
    setItem.apply(this, arguments);
    if (k !== LSKEY || !user || role !== 'eleve') return;
    var after = {}; try { after = JSON.parse(v) || {}; } catch (e) {}
    var added = Object.keys(after).filter(function (s) { return after[s] && !before[s] && s !== 'accueil'; });
    var removed = Object.keys(before).filter(function (s) { return before[s] && !after[s]; });
    if (added.length) {
      sb.from('progress').upsert(added.map(function (s) { return { user_id: user.id, parcours: parcours, step: s }; })).then(function () {});
      var total = document.querySelectorAll('.lesson').length - 1;
      var n = Object.keys(after).filter(function (s) { return after[s] && s !== 'accueil'; }).length;
      if (added.length === 1) encourage(n, total);
    }
    if (removed.length) {
      sb.from('progress').delete().eq('user_id', user.id).eq('parcours', parcours).in('step', removed).then(function () {});
    }
  };


  // ----- lien « Mon espace » dans la barre du haut (petits écrans) -----
  function lienEspace() {
    var tb = document.querySelector('.topbar');
    if (!tb || tb.querySelector('.vers-espace')) return;
    var a = document.createElement('a');
    a.href = '/'; a.className = 'btn ghost vers-espace'; a.textContent = 'Mon espace';
    a.style.cssText = 'margin-left:auto;text-decoration:none;white-space:nowrap';
    tb.appendChild(a);
  }

  // ----- chrono sur les exercices -----
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m ? m + ' min ' : '') + (r < 10 && m ? '0' : '') + r + ' s'; }
  var CSS = '.chrono{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:.9rem;margin:0}' +
    '.chrono button{font:inherit;font-weight:600;border:1px solid currentColor;background:transparent;color:var(--pen,#2449d8);border-radius:999px;padding:3px 12px;cursor:pointer}' +
    '.chrono .t{font-variant-numeric:tabular-nums;font-weight:700}.chrono .ok{color:#0b7a46}.chrono .lent{color:#b45309}';
  function chronos() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    document.querySelectorAll('.lesson').forEach(function (lesson) {
      lesson.querySelectorAll('.exo').forEach(function (exo, i) {
        var q = exo.querySelector('.exo-q'); if (!q || exo.querySelector('.chrono')) return;
        var obj = (q.textContent.length > 170 ? 5 : 3) * 60;
        var p = document.createElement('p'); p.className = 'chrono';
        var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Me chronométrer (' + obj / 60 + ' min)';
        var t = document.createElement('span'); t.className = 't'; t.setAttribute('aria-live', 'off');
        p.appendChild(b); p.appendChild(t); q.parentNode.insertBefore(p, q.nextSibling);
        var t0 = 0, iv = null;
        b.addEventListener('click', function () {
          if (!iv) {
            t0 = Date.now(); t.className = 't'; t.textContent = '0 s'; b.textContent = 'J\'ai fini';
            iv = setInterval(function () { var s = Math.round((Date.now() - t0) / 1000); t.textContent = fmt(s); if (s > obj) t.className = 't lent'; }, 1000);
          } else {
            clearInterval(iv); iv = null;
            var s = Math.round((Date.now() - t0) / 1000);
            t.className = 't ' + (s <= obj ? 'ok' : 'lent');
            t.textContent = fmt(s) + (s <= obj ? ' : dans le temps, bravo !' : ' : objectif ' + obj / 60 + ' min, on y travaille.');
            b.textContent = 'Recommencer';
            if (user && role === 'eleve') sb.from('exo_chronos').insert({ user_id: user.id, parcours: parcours, step: lesson.id, exo: i + 1, secondes: s, objectif: obj }).then(function () {});
          }
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { lienEspace(); chronos(); });
  else { lienEspace(); chronos(); }

  // ----- lecture : on récupère la progression du compte -----
  sb.auth.getSession().then(function (res) {
    var s = res.data.session;
    if (!s) { location.replace('/connexion?suite=' + encodeURIComponent(location.pathname + location.hash)); return; }
    user = s.user;
    sb.from('profiles').select('prenom, role').eq('id', user.id).maybeSingle().then(function (p) {
      if (p.data) { prenom = p.data.prenom; role = p.data.role; }
      if (role !== 'eleve') return;
      sb.from('progress').select('step').eq('user_id', user.id).eq('parcours', parcours).then(function (r) {
        if (!r.data) return;
        var local = readDone(), changed = false, merged = {};
        r.data.forEach(function (row) { merged[row.step] = true; if (!local[row.step]) changed = true; });
        // étapes cochées hors connexion : on les envoie
        var missing = Object.keys(local).filter(function (k) { return local[k] && !merged[k] && k !== 'accueil'; });
        if (missing.length) sb.from('progress').upsert(missing.map(function (k) { return { user_id: user.id, parcours: parcours, step: k }; })).then(function () {});
        if (changed) {
          Object.keys(local).forEach(function (k) { if (local[k]) merged[k] = true; });
          setItem.call(localStorage, LSKEY, JSON.stringify(merged));
          if (!sessionStorage.getItem('sync-' + parcours)) { sessionStorage.setItem('sync-' + parcours, '1'); location.reload(); }
        }
      });
    });
  });
})();
