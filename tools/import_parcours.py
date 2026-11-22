"""Copie les parcours du site GitHub Pages dans l'application.
Les vidéos restent hébergées sur GitHub Pages (URL absolue) pour ne pas alourdir le déploiement."""
import os, re, shutil, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/parcours-algebre-lineaire'
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'parcours')
VIDEOS = 'https://alsenytech.github.io/parcours-algebre-lineaire/videos/'
FILES = ['suites-fonctions.html', 'algebre-lineaire.html', 'limites.html']
os.makedirs(DST, exist_ok=True)
# sous-titres : servis par l'application (même origine que la page, sinon le navigateur les refuse)
os.makedirs(os.path.join(DST, 'videos'), exist_ok=True)
for v in os.listdir(os.path.join(SRC, 'videos')):
    if v.endswith('.vtt'): shutil.copy(os.path.join(SRC, 'videos', v), os.path.join(DST, 'videos', v))
for f in FILES:
    s = open(os.path.join(SRC, f), encoding='utf8').read()
    s = re.sub(r'src="videos/([^"]+\.mp4)"', lambda m: 'src="' + VIDEOS + m.group(1) + '"', s)
    s = s.replace('<a href="index.html">← Tous les parcours</a>', '<a href="/">← Mon espace</a>')
    s = s.replace('href="algebre-lineaire.html"', 'href="/parcours/algebre-lineaire.html"')
    # synchronisation avec le compte (chargée avant le script de la page)
    s = s.replace('</head>', '<script src="/parcours/supabase.js"></script>\n<script src="/parcours/sync.js"></script>\n</head>', 1)
    open(os.path.join(DST, f), 'w', encoding='utf8').write(s)
if os.path.exists(os.path.join(DST, 'assets')): shutil.rmtree(os.path.join(DST, 'assets'))
shutil.copytree(os.path.join(SRC, 'assets'), os.path.join(DST, 'assets'))
shutil.copy(os.path.join(os.path.dirname(DST), '..', 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js'), os.path.join(DST, 'supabase.js'))
print('ok', FILES)

# liste des étapes de chaque parcours, pour l'application
import json, html as H
out = []
for f, pid, chap, title in [('suites-fonctions.html','suites-fonctions','II','Suites et fonctions'),
                            ('algebre-lineaire.html','algebre-lineaire','III','Algèbre linéaire'),
                            ('limites.html','limites','IV','Limites de suites')]:
    s = open(os.path.join(SRC, f), encoding='utf8').read()
    steps = [dict(id=i, part=H.unescape(p), title=H.unescape(t)) for i, p, t in
             re.findall(r'<section class="lesson" id="([^"]+)" data-part="([^"]*)" data-title="([^"]*)"', s) if i != 'accueil']
    out.append(dict(id=pid, file=f, chap=chap, title=title, steps=steps,
                    videos=len(set(re.findall(r'src="videos/([^"]+\.mp4)"', s)))))
json.dump(out, open(os.path.join(DST, '..', '..', 'src', 'parcours.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('parcours.json', [(p['id'], len(p['steps'])) for p in out])
