# Daily Flag 🚩

Quiz quotidien : 10 drapeaux par jour (3 faciles, 3 moyens, 4 difficiles).
Site statique en JavaScript natif (modules ES) — aucune étape de build.
🔄 Vibe coded 🔄

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
js/lib/flags.js       Code pays → URL/HTML de drapeau SVG (+ fallback emoji)
js/lib/storage.js     Sauvegarde locale de la progression
js/lib/world.js       Envoi/récupération du classement mondial (Supabase REST)
js/ui/view.js         Affichage (DOM)
vercel.json           Config Vercel (en-têtes)
```

## Lancer en local

```bash
npm run dev      # http://localhost:3000
```

(Les modules ES nécessitent un serveur : ouvrir index.html directement ne marche pas.)

## Classement mondial (Supabase)

Le classement mondial est optionnel. S'il n'est pas configuré, l'app reste fonctionnelle en local.

1. Créez une base Supabase.
2. Exécutez ce SQL :

```sql
create table if not exists public.players (
  id text primary key,
  name text not null,
  avatar text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_scores (
  day_key text not null,
  player_id text not null,
  player_name text not null,
  score integer not null check (score between 0 and 10),
  created_at timestamptz not null default now(),
  primary key (day_key, player_id)
);

alter table public.players enable row level security;
alter table public.daily_scores enable row level security;

drop policy if exists "read players" on public.players;
create policy "read players" on public.players
for select to anon using (true);

drop policy if exists "write players" on public.players;
create policy "write players" on public.players
for insert to anon with check (true);

drop policy if exists "update players" on public.players;
create policy "update players" on public.players
for update to anon using (true) with check (true);

drop policy if exists "read scores" on public.daily_scores;
create policy "read scores" on public.daily_scores
for select to anon using (true);

drop policy if exists "write own day score" on public.daily_scores;
create policy "write own day score" on public.daily_scores
for insert to anon with check (true);

drop policy if exists "update own day score" on public.daily_scores;
create policy "update own day score" on public.daily_scores
for update to anon using (true) with check (true);
```

3. Dans [index.html](/Users/shibakariki/Documents/github/DailyFlag/index.html), renseignez :
   - `window.DAILYFLAG_SUPABASE_URL`
   - `window.DAILYFLAG_SUPABASE_ANON_KEY`

## Déployer sur Vercel

1. Poussez le dossier sur GitHub.
2. Sur vercel.com : **Add New → Project**, importez le dépôt.
3. **Framework Preset : Other**, Build Command et Output Directory vides. **Deploy**.

Ou en ligne de commande : `npx vercel` puis `npx vercel --prod`.
