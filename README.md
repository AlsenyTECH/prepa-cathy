# L'espace de Cathy

Application de suivi pour une élève de prépa ECG 1 : parcours de cours (vidéos, exercices), évaluations du jour, espace prof.

- Interface : React + Vite, hébergée sur Vercel.
- Données et comptes : Supabase (projet `prepa-cathy`).
- Les parcours (`public/parcours/`) sont importés du site GitHub Pages avec `python3 tools/import_parcours.py <dossier du site>` ; les vidéos restent hébergées sur GitHub Pages.

Développement : `npm install`, puis `npm run dev`.
