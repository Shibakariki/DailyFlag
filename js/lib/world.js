function config() {
  const url = window.DAILYFLAG_SUPABASE_URL || "";
  const key = window.DAILYFLAG_SUPABASE_ANON_KEY || "";
  return { url, key, ok: Boolean(url && key) };
}

function headers(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function req(path, { method = "GET", body, extraHeaders } = {}) {
  const c = config();
  if (!c.ok) throw new Error("Supabase non configuré");
  const res = await fetch(`${c.url}${path}`, {
    method,
    headers: headers(c.key, extraHeaders),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

export function isWorldConfigured() {
  return config().ok;
}

export async function upsertPlayerProfile(player) {
  await req("/rest/v1/players?on_conflict=id", {
    method: "POST",
    body: [{ id: player.id, name: player.name, avatar: player.avatar }],
    extraHeaders: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });
}

export async function loadRemotePlayer(playerId) {
  const rows = await req(`/rest/v1/players?id=eq.${playerId}&select=id,name,avatar,updated_at&limit=1`);
  return rows?.[0] || null;
}

export async function submitAndLoadWorld(dayKey, score, player) {
  await upsertPlayerProfile(player);
  await req("/rest/v1/daily_scores?on_conflict=day_key,player_id", {
    method: "POST",
    body: [{ day_key: dayKey, player_id: player.id, player_name: player.name, score }],
    extraHeaders: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });

  const rows = await req(`/rest/v1/daily_scores?day_key=eq.${dayKey}&select=player_id,player_name,score,created_at&order=score.desc,created_at.asc`);
  const leaderboard = rows.slice(0, 10).map((r, i) => ({ rank: i + 1, name: r.player_name, score: r.score }));
  const meIdx = rows.findIndex(r => r.player_id === player.id);
  const totalPlayers = rows.length;
  const avgScore = totalPlayers ? Math.round((rows.reduce((s, r) => s + r.score, 0) / totalPlayers) * 10) / 10 : 0;
  const bestScore = totalPlayers ? rows[0].score : 0;

  return {
    leaderboard,
    totalPlayers,
    avgScore,
    bestScore,
    myRank: meIdx >= 0 ? meIdx + 1 : null,
    myScore: score,
  };
}
