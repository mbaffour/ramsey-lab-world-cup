const DATA_URL = "./data/site-data.json";

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const text = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatUpdated = (iso) => {
  if (!iso) return "Not updated yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const podiumCard = (player, index) => {
  const rank = text(player?.rank, index + 1);
  const name = text(player?.participant, "Open spot");
  const total = number(player?.totalPoints);
  return `
    <article class="podium-card">
      <span class="rank">#${rank}</span>
      <div class="name">${name}</div>
      <div class="points">${total} points</div>
    </article>
  `;
};

const leaderboardRow = (player) => `
  <tr>
    <td class="numeric">${text(player.rank)}</td>
    <td>${text(player.participant)}</td>
    <td class="numeric">${number(player.totalPoints)}</td>
    <td class="numeric">${number(player.correctPicks)}</td>
    <td class="numeric">${number(player.wrongPicks)}</td>
    <td class="numeric">${number(player.predictionsMade)}</td>
    <td class="numeric">${number(player.latePicks)}</td>
    <td>${text(player.title, "Contender")}</td>
  </tr>
`;

const awardCard = (award) => `
  <article class="award">
    <span>${text(award.award, "Award")}</span>
    <strong>${text(award.winner, "TBD")}</strong>
    <p>${text(award.description)}</p>
  </article>
`;

const upcomingRow = (match) => `
  <tr>
    <td>${text(match.date)}</td>
    <td>${text(match.localTime)}</td>
    <td>${text(match.stage)}</td>
    <td>${text(match.label)}</td>
    <td>${text(match.status, "Awaiting result")}</td>
  </tr>
`;

async function loadData() {
  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
  return response.json();
}

function render(data) {
  const meta = data.meta || {};
  const stats = data.stats || {};
  const leaderboard = data.leaderboard || [];
  const awards = data.awards || [];
  const groupMatches = data.groupMatches || data.upcomingMatches || [];

  document.getElementById("submitLink").href = meta.formUrl || "#";
  document.getElementById("lastUpdated").textContent = formatUpdated(meta.updatedAt);
  document.getElementById("refreshCadence").textContent = text(meta.refreshCadence, "Daily");
  document.getElementById("totalSubmissions").textContent = number(stats.totalSubmissions);
  document.getElementById("matchesFinal").textContent = number(stats.matchesFinal);
  document.getElementById("onTimePicks").textContent = number(stats.onTimePicks);
  document.getElementById("latePicks").textContent = number(stats.latePicks);
  document.getElementById("activePlayers").textContent = number(stats.activePlayers || leaderboard.length);

  const topThree = leaderboard.slice(0, 3);
  while (topThree.length < 3) topThree.push(null);
  document.getElementById("podium").innerHTML = topThree.map(podiumCard).join("");

  const rows = leaderboard.length
    ? leaderboard.map(leaderboardRow).join("")
    : `<tr class="empty-row"><td colspan="8">No submissions yet. The table will populate after the first daily refresh.</td></tr>`;
  document.getElementById("leaderboardRows").innerHTML = rows;

  const awardRows = awards.length
    ? awards.map(awardCard).join("")
    : awardCard({ award: "Current Champion", winner: "TBD", description: "No eligible picks yet." });
  document.getElementById("awards").innerHTML = awardRows;

  const groupRows = groupMatches.length
    ? groupMatches.map(upcomingRow).join("")
    : `<tr class="empty-row"><td colspan="5">Group-stage games are loading. Open the live sheet if this does not populate.</td></tr>`;
  document.getElementById("groupMatchRows").innerHTML = groupRows;
}

loadData()
  .then(render)
  .catch((error) => {
    console.error(error);
    render({
      meta: { updatedAt: "", refreshCadence: "Daily" },
      stats: {},
      leaderboard: [],
      awards: [{ award: "Data unavailable", winner: "Check setup", description: "The site-data.json file could not be loaded." }],
    });
  });
