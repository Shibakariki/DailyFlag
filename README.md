# Daily Flag 🚩

Quiz quotidien : 10 drapeaux par jour (3 faciles, 3 moyens, 4 difficiles).
Site statique en JavaScript natif (modules ES) — aucune étape de build.

## Structure

```
index.html            Page unique
css/style.css         Thème clair/sombre, mise en page responsive
js/main.js            Point d'entrée : orchestre la partie
js/data/countries.js  197 pays (code ISO + nom français)
js/data/difficulty.js Niveaux de difficulté et composition du défi
js/data/similar.js    Familles de drapeaux ressemblants (mauvaises réponses)
js/game/quiz.js       Génération du quiz du jour
js/lib/random.js      Aléatoire déterministe (graine = date)
js/lib/date.js        Date, numéro du jour, compte à rebours
js/lib/flags.js       Code pays → emoji drapeau
js/lib/storage.js     Sauvegarde locale de la progression
js/ui/view.js         Affichage (DOM)
vercel.json           Config Vercel (en-têtes)
```

## Lancer en local

```bash
npm run dev      # http://localhost:3000
```

(Les modules ES nécessitent un serveur : ouvrir index.html directement ne marche pas.)

## Déployer sur Vercel

1. Poussez le dossier sur GitHub.
2. Sur vercel.com : **Add New → Project**, importez le dépôt.
3. **Framework Preset : Other**, Build Command et Output Directory vides. **Deploy**.

Ou en ligne de commande : `npx vercel` puis `npx vercel --prod`.
