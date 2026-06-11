"""Build docs/data/site-data.json from published Google Sheets CSV exports.

Expected environment variables:
  LEADERBOARD_CSV_URL - required, published CSV for the Leaderboard tab.
  FORM_URL - optional, public Google Form URL.
  AWARDS_CSV_URL - optional, published CSV for the Fun Awards tab.
  DASHBOARD_CSV_URL - optional, published CSV for the Dashboard tab.
  SCORING_CSV_URL - optional, published CSV for the Scoring tab.
  MATCHES_CSV_URL - optional, published CSV for the Matches tab.
"""

from __future__ import annotations

import csv
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "data" / "site-data.json"


def fetch_csv(url: str) -> list[dict[str, str]]:
    request = Request(url, headers={"User-Agent": "ramsey-lab-world-cup-updater"})
    with urlopen(request, timeout=30) as response:
        text = response.read().decode("utf-8-sig")
    return list(csv.DictReader(text.splitlines()))


def clean(value: object) -> str:
    return str(value or "").strip()


def to_int(value: object) -> int:
    text = clean(value).replace(",", "")
    if not text:
        return 0
    try:
      return int(float(text))
    except ValueError:
      return 0


def first(row: dict[str, str], *names: str) -> str:
    normalized = {key.strip().lower(): value for key, value in row.items()}
    for name in names:
        value = normalized.get(name.strip().lower())
        if value is not None:
            return clean(value)
    return ""


def leaderboard_from_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    players: list[dict[str, object]] = []
    for row in rows:
        participant = first(row, "Participant", "Name")
        if not participant:
            continue
        players.append(
            {
                "rank": to_int(first(row, "Rank")),
                "participant": participant,
                "totalPoints": to_int(first(row, "Total Points", "Total")),
                "correctPicks": to_int(first(row, "Correct Picks", "Correct")),
                "exactScores": to_int(first(row, "Exact Scores", "Exact")),
                "wrongPicks": to_int(first(row, "Wrong Picks", "Wrong")),
                "predictionsMade": to_int(first(row, "Predictions Made", "Made")),
                "latePicks": to_int(first(row, "Late Picks", "Late")),
                "title": first(row, "Title"),
            }
        )
    return sorted(players, key=lambda item: (to_int(item["rank"]) or 9999, -to_int(item["totalPoints"])))


def awards_from_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    awards: list[dict[str, str]] = []
    for row in rows:
        award = first(row, "Award")
        if not award:
            continue
        awards.append(
            {
                "award": award,
                "winner": first(row, "Winner") or "TBD",
                "description": first(row, "What it means", "Description"),
            }
        )
    return awards


def upcoming_matches_from_rows(rows: list[dict[str, str]], limit: int = 16) -> list[dict[str, str]]:
    matches: list[dict[str, str]] = []
    for row in rows:
        match_id = first(row, "Match ID")
        team_one = first(row, "Team 1 / Home", "Home", "Team 1")
        team_two = first(row, "Team 2 / Away", "Away", "Team 2")
        if not match_id or not team_one or not team_two:
            continue
        status = first(row, "Match Status", "Status")
        actual = first(row, "Actual Result")
        if status.lower() == "final" or actual:
            continue
        matches.append(
            {
                "matchId": match_id,
                "date": first(row, "Date"),
                "localTime": first(row, "Local Time", "Kickoff Local Timestamp", "Time"),
                "stage": first(row, "Stage"),
                "label": first(row, "Match Label") or f"{team_one} vs {team_two}",
                "status": status or "Awaiting result",
            }
        )
    return matches[:limit]


def stats_from_scoring(rows: list[dict[str, str]], leaderboard: list[dict[str, object]]) -> dict[str, int]:
    submitted = [row for row in rows if first(row, "Participant")]
    return {
        "totalSubmissions": len(submitted),
        "matchesFinal": 0,
        "onTimePicks": sum(1 for row in submitted if first(row, "Eligible?", "Eligible") == "Yes"),
        "latePicks": sum(1 for row in submitted if first(row, "Eligible?", "Eligible") == "Late"),
        "exactScores": sum(1 for row in submitted if to_int(first(row, "Exact Score Bonus")) > 0),
        "activePlayers": len(leaderboard),
    }


def stats_from_dashboard(rows: list[dict[str, str]], fallback: dict[str, int]) -> dict[str, int]:
    stats = dict(fallback)
    for row in rows:
        values = [clean(value) for value in row.values() if clean(value)]
        if len(values) < 2:
            continue
        label = values[0].lower()
        value = to_int(values[1])
        if "total submission" in label:
            stats["totalSubmissions"] = value
        elif "matches final" in label:
            stats["matchesFinal"] = value
        elif "on-time" in label:
            stats["onTimePicks"] = value
        elif "late" in label:
            stats["latePicks"] = value
        elif "exact" in label:
            stats["exactScores"] = value
        elif "active player" in label:
            stats["activePlayers"] = value
    return stats


def main() -> int:
    leaderboard_url = os.environ.get("LEADERBOARD_CSV_URL", "").strip()
    if not leaderboard_url:
        print("LEADERBOARD_CSV_URL is required", file=sys.stderr)
        return 2

    leaderboard = leaderboard_from_rows(fetch_csv(leaderboard_url))
    stats = {
        "totalSubmissions": sum(to_int(player.get("predictionsMade")) for player in leaderboard),
        "matchesFinal": 0,
        "onTimePicks": sum(to_int(player.get("predictionsMade")) for player in leaderboard),
        "latePicks": sum(to_int(player.get("latePicks")) for player in leaderboard),
        "exactScores": sum(to_int(player.get("exactScores")) for player in leaderboard),
        "activePlayers": len(leaderboard),
    }

    scoring_url = os.environ.get("SCORING_CSV_URL", "").strip()
    if scoring_url:
        stats = stats_from_scoring(fetch_csv(scoring_url), leaderboard)

    dashboard_url = os.environ.get("DASHBOARD_CSV_URL", "").strip()
    if dashboard_url:
        stats = stats_from_dashboard(fetch_csv(dashboard_url), stats)

    awards_url = os.environ.get("AWARDS_CSV_URL", "").strip()
    awards = awards_from_rows(fetch_csv(awards_url)) if awards_url else []

    matches_url = os.environ.get("MATCHES_CSV_URL", "").strip()
    upcoming_matches = upcoming_matches_from_rows(fetch_csv(matches_url)) if matches_url else []

    payload = {
        "meta": {
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "refreshCadence": os.environ.get(
                "REFRESH_CADENCE",
                "Daily at 11:55 PM UTC, plus manual workflow runs",
            ),
            "formUrl": os.environ.get("FORM_URL", "#").strip() or "#",
        },
        "stats": stats,
        "leaderboard": leaderboard,
        "upcomingMatches": upcoming_matches,
        "awards": awards,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}")
    print(f"Players: {len(leaderboard)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
