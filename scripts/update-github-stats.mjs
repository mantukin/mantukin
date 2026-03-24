import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const USERNAME = process.env.GITHUB_STATS_USER || "mantukin";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_STATS_TOKEN || process.env.GH_TOKEN || "";
const OUTPUT_DIR = path.resolve(process.cwd(), "repo_icons", "github-stats");
const SNAPSHOT_FILE = path.join(OUTPUT_DIR, "snapshot.json");
const STATS_FILE = path.join(OUTPUT_DIR, "stats.svg");
const LANGUAGES_FILE = path.join(OUTPUT_DIR, "languages.svg");
const STREAK_FILE = path.join(OUTPUT_DIR, "streak.svg");

const STATS_CARD_ICON_PATHS = Object.freeze([
  {
    fillRule: "evenodd",
    path: "M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z",
  },
  {
    fillRule: "evenodd",
    path: "M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z",
  },
  {
    fillRule: "evenodd",
    path: "M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z",
  },
  {
    fillRule: "evenodd",
    path: "M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z",
  },
  {
    fillRule: "evenodd",
    path: "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z",
  },
]);

const STATS_GITHUB_MARK_PATH =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";

const STREAK_FIRE_PATH =
  "M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z";

if (!TOKEN) {
  throw new Error("Missing GITHUB_TOKEN or GITHUB_STATS_TOKEN for GitHub stats generation.");
}

async function githubGraphQL(query, variables = {}) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "github-profile-readme-stats-generator",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((entry) => entry.message).join("; "));
  }

  return payload.data;
}

async function fetchPublicContributionYear(login, year) {
  const url = new URL(`https://github.com/users/${login}/contributions`);
  url.searchParams.set("from", `${year}-01-01`);
  url.searchParams.set("to", `${year}-12-31`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "github-profile-readme-stats-generator",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub contributions page request failed with ${response.status}`);
  }

  const html = await response.text();
  const days = [];
  const dayPattern =
    /data-date="([^"]+)" id="([^"]+)"[^>]*><\/td>\s*<tool-tip[^>]* for="\2"[^>]*>([^<]+)<\/tool-tip>/g;

  for (const match of html.matchAll(dayPattern)) {
    const [, date, , tooltip] = match;
    const trimmedTooltip = tooltip.trim();
    const countMatch = trimmedTooltip.match(/^([\d,]+)\s+contributions?/i);
    const contributionCount = /^No contributions?/i.test(trimmedTooltip)
      ? 0
      : countMatch
        ? Number(countMatch[1].replace(/,/g, ""))
        : 0;

    days.push({
      date,
      contributionCount,
    });
  }

  if (!days.length) {
    throw new Error(`Could not parse public contribution graph for ${year}.`);
  }

  return {
    totalContributions: days.reduce((sum, day) => sum + day.contributionCount, 0),
    contributionDays: days,
  };
}

async function fetchUserOverview(login) {
  const data = await githubGraphQL(
    `
      query UserOverview($login: String!) {
        user(login: $login) {
          createdAt
          pullRequests(first: 1) {
            totalCount
          }
          issues(first: 1) {
            totalCount
          }
          repositoriesContributedTo(
            first: 1
            includeUserRepositories: true
            privacy: PUBLIC
            contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
          ) {
            totalCount
          }
          contributionsCollection {
            contributionYears
          }
        }
      }
    `,
    { login }
  );

  return data.user;
}

async function fetchOwnedRepositories(login) {
  const repositories = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const data = await githubGraphQL(
      `
        query OwnedRepositories($login: String!, $after: String) {
          user(login: $login) {
            repositories(
              first: 100
              after: $after
              ownerAffiliations: OWNER
              isFork: false
            ) {
              nodes {
                stargazerCount
                isPrivate
                primaryLanguage {
                  name
                  color
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
      { login, after: endCursor }
    );

    const batch = data.user.repositories.nodes || [];
    repositories.push(...batch);
    hasNextPage = Boolean(data.user.repositories.pageInfo?.hasNextPage);
    endCursor = data.user.repositories.pageInfo?.endCursor || null;
  }

  return repositories;
}

async function fetchCommitContributionYear(login, year) {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const data = await githubGraphQL(
    `
      query ContributionYear($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
          }
        }
      }
    `,
    { login, from, to }
  );

  return data.user.contributionsCollection;
}

function diffDays(left, right) {
  const leftDate = new Date(`${left}T00:00:00Z`);
  const rightDate = new Date(`${right}T00:00:00Z`);
  return Math.round((rightDate.getTime() - leftDate.getTime()) / 86400000);
}

function calculateStreaks(contributionDays) {
  const activeDays = Array.from(contributionDays.entries())
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort((left, right) => left.localeCompare(right));

  if (!activeDays.length) {
    return {
      current: { length: 0, start: "", end: "" },
      longest: { length: 0, start: "", end: "" },
      total: 0,
    };
  }

  let runStart = activeDays[0];
  let runLength = 1;
  let previousDay = activeDays[0];
  let longest = { length: 1, start: activeDays[0], end: activeDays[0] };

  for (let index = 1; index < activeDays.length; index += 1) {
    const day = activeDays[index];
    if (diffDays(previousDay, day) === 1) {
      runLength += 1;
    } else {
      if (runLength > longest.length) {
        longest = { length: runLength, start: runStart, end: previousDay };
      }
      runStart = day;
      runLength = 1;
    }

    previousDay = day;
  }

  if (runLength > longest.length) {
    longest = { length: runLength, start: runStart, end: previousDay };
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakEnd = contributionDays.get(today) > 0 ? today : contributionDays.get(yesterday) > 0 ? yesterday : "";

  if (!streakEnd) {
    return {
      current: { length: 0, start: "", end: "" },
      longest,
      total: activeDays.length,
    };
  }

  let currentStart = streakEnd;
  let cursor = streakEnd;
  while (true) {
    const previous = new Date(new Date(`${cursor}T00:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10);
    if ((contributionDays.get(previous) || 0) <= 0) {
      break;
    }
    currentStart = previous;
    cursor = previous;
  }

  return {
    current: {
      length: diffDays(currentStart, streakEnd) + 1,
      start: currentStart,
      end: streakEnd,
    },
    longest,
    total: activeDays.length,
  };
}

function buildLanguageBreakdown(repositories) {
  const counts = new Map();

  for (const repository of repositories) {
    const language = repository.primaryLanguage;
    if (!language?.name) {
      continue;
    }

    if (counts.has(language.name)) {
      counts.get(language.name).count += 1;
    } else {
      counts.set(language.name, {
        name: language.name,
        count: 1,
        color: language.color || "#59f0ff",
      });
    }
  }

  return Array.from(counts.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function escapeSvgText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatStatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function polarToPoint(radius, angleDeg) {
  const radians = (angleDeg * Math.PI) / 180;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;
  return `${x},${y}`;
}

function getCirclePoint(cx, cy, radius, angleDeg) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function describeOpenCircleArc(cx, cy, radius, startAngleDeg, endAngleDeg) {
  const start = getCirclePoint(cx, cy, radius, startAngleDeg);
  const end = getCirclePoint(cx, cy, radius, endAngleDeg);
  let sweep = endAngleDeg - startAngleDeg;
  while (sweep <= 0) {
    sweep += 360;
  }

  const largeArc = sweep > 180 ? 1 : 0;
  return `M${start.x.toFixed(3)} ${start.y.toFixed(3)} A${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

function describeDonutSegment(startAngleDeg, endAngleDeg, outerRadius, innerRadius) {
  const sweep = Math.max(0.0001, endAngleDeg - startAngleDeg);
  const largeArc = sweep > 180 ? 1 : 0;
  const outerStart = polarToPoint(outerRadius, startAngleDeg);
  const outerEnd = polarToPoint(outerRadius, endAngleDeg);
  const innerEnd = polarToPoint(innerRadius, endAngleDeg);
  const innerStart = polarToPoint(innerRadius, startAngleDeg);

  return `M${outerStart}A${outerRadius},${outerRadius},0,${largeArc},1,${outerEnd}L${innerEnd}A${innerRadius},${innerRadius},0,${largeArc},0,${innerStart}Z`;
}

function parseDateKey(dateKey) {
  const parsed = new Date(`${dateKey}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShortDate(dateKey) {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function formatLongDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatDateRange(start, end) {
  if (!start || !end) {
    return "No run yet";
  }

  if (start === end) {
    return formatShortDate(start);
  }

  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

async function generateSnapshot() {
  const overview = await fetchUserOverview(USERNAME);
  const repositories = await fetchOwnedRepositories(USERNAME);
  const contributionYears = [...(overview.contributionsCollection?.contributionYears || [])]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => right - left);

  if (!contributionYears.length) {
    throw new Error("No contribution years returned from GitHub.");
  }

  const contributionDays = new Map();
  let totalContributions = 0;
  let yearCommits = 0;

  for (const year of contributionYears) {
    const [commitContributionYear, publicContributionYear] = await Promise.all([
      fetchCommitContributionYear(USERNAME, year),
      fetchPublicContributionYear(USERNAME, year),
    ]);

    if (year === contributionYears[0]) {
      yearCommits = commitContributionYear.totalCommitContributions || 0;
    }

    totalContributions += publicContributionYear.totalContributions || 0;

    for (const day of publicContributionYear.contributionDays || []) {
      contributionDays.set(day.date, day.contributionCount);
    }
  }

  const publicRepositories = repositories.filter((repository) => !repository.isPrivate);
  const totalStars = publicRepositories.reduce((sum, repository) => sum + (repository.stargazerCount || 0), 0);
  const streaks = calculateStreaks(contributionDays);

  return {
    year: contributionYears[0],
    stats: {
      totalStars,
      yearCommits,
      totalPrs: overview.pullRequests?.totalCount || 0,
      totalIssues: overview.issues?.totalCount || 0,
      contributedTo: overview.repositoriesContributedTo?.totalCount || 0,
    },
    languages: buildLanguageBreakdown(repositories),
    commits: {
      total: totalContributions,
      current: streaks.current,
      longest: streaks.longest,
      since: overview.createdAt,
    },
  };
}

function buildStatsOverviewSvg(snapshot) {
  const rows = [
    { label: "Total Stars:", value: formatStatNumber(snapshot.stats.totalStars) },
    { label: `${snapshot.year} Commits:`, value: formatStatNumber(snapshot.stats.yearCommits) },
    { label: "Total PRs:", value: formatStatNumber(snapshot.stats.totalPrs) },
    { label: "Total Issues:", value: formatStatNumber(snapshot.stats.totalIssues) },
    { label: "Contributed to:", value: formatStatNumber(snapshot.stats.contributedTo) },
  ];
  const iconMarkup = STATS_CARD_ICON_PATHS.map((icon, index) => {
    const offset = (index * 25.2).toFixed(1).replace(/\.0$/, "");
    return `<g transform="translate(0,${offset})" width="14" height="14" fill="#bf91f3"><path fill-rule="${icon.fillRule}" d="${icon.path}"></path></g>`;
  }).join("");
  const labelMarkup = rows
    .map((row, index) => {
      const y = 14 + index * 25.2;
      return `<text x="21" y="${y}" style="fill: #38bdae; font-size: 14px;">${escapeSvgText(row.label)}</text>`;
    })
    .join("");
  const valueMarkup = rows
    .map((row, index) => {
      const y = 14 + index * 25.2;
      return `<text x="130" y="${y}" style="fill: #38bdae; font-size: 14px;">${escapeSvgText(row.value)}</text>`;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="200" viewBox="0 0 340 200" role="img" aria-label="GitHub stats overview" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
  <rect x="1" y="1" rx="5" ry="5" height="99%" width="99.41176470588235%" stroke="#1a1b27" stroke-width="1" fill="#1a1b27" stroke-opacity="1"></rect>
  <text x="30" y="40" style="font-size: 22px; fill: #70a5fd;">Stats</text>
  <g transform="translate(0,40)">
    <g transform="translate(30,20)">
      ${iconMarkup}
      ${labelMarkup}
      ${valueMarkup}
    </g>
    <g transform="translate(220,20)">
      <g transform="scale(6)" style="fill: #bf91f3;">
        <path fill-rule="evenodd" d="${STATS_GITHUB_MARK_PATH}"></path>
      </g>
    </g>
  </g>
</svg>`.trim();
}

function buildLanguageCardSvg(snapshot) {
  const languages = snapshot.languages.slice(0, 5);
  const displayLanguages = languages.length
    ? languages
    : [{ name: "Unavailable", count: 1, color: "#3b4f67" }];
  const displayTotal = displayLanguages.reduce((sum, language) => sum + Math.max(language.count, 0), 0) || 1;
  let currentAngle = -90;

  const legendMarkup = displayLanguages
    .map((language, index) => {
      const offset = index * 25.2;
      const labelY = 30 + index * 25.2;
      return `<rect y="${18 + offset}" width="14" height="14" fill="${escapeSvgText(language.color)}" stroke="#1a1b27" style="stroke-width: 1px;"></rect><text x="16.8" y="${labelY}" style="fill: #38bdae; font-size: 14px;">${escapeSvgText(language.name)}</text>`;
    })
    .join("");

  const arcMarkup = displayLanguages
    .map((language, index) => {
      const share =
        index === displayLanguages.length - 1
          ? Math.max(0, (270 - currentAngle) / 360)
          : Math.max(language.count / displayTotal, 0);
      const safeShare = displayLanguages.length === 1 ? 0.999999 : share;
      const startAngle = currentAngle;
      const endAngle = startAngle + safeShare * 360;
      currentAngle = endAngle;
      return `<g class="arc"><path d="${describeDonutSegment(startAngle, endAngle, 60, 35)}" style="fill: ${escapeSvgText(language.color)}; stroke-width: 2px;" stroke="#1a1b27"></path></g>`;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="200" viewBox="0 0 340 200" role="img" aria-label="GitHub languages overview" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
  <rect x="1" y="1" rx="5" ry="5" height="99%" width="99.41176470588235%" stroke="#1a1b27" stroke-width="1" fill="#1a1b27" stroke-opacity="1"></rect>
  <text x="30" y="40" style="font-size: 22px; fill: #70a5fd;">Top Languages by Repo</text>
  <g transform="translate(0,40)">
    <g transform="translate(40,0)">
      ${legendMarkup}
    </g>
    <g transform="translate(230,80)">
      ${arcMarkup}
    </g>
  </g>
</svg>`.trim();
}

function buildCommitRunSvg(snapshot) {
  const totalCommits = formatStatNumber(snapshot.commits.total);
  const totalRange = snapshot.commits.since
    ? `${formatLongDate(snapshot.commits.since)} - Present`
    : "All indexed commits";
  const currentRange = formatDateRange(snapshot.commits.current.start, snapshot.commits.current.end);
  const longestRange = formatDateRange(snapshot.commits.longest.start, snapshot.commits.longest.end);
  const streakRingPath = describeOpenCircleArc(247.5, 71, 40, -69, 249);

  return `
<svg xmlns="http://www.w3.org/2000/svg" style="isolation: isolate; font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;" viewBox="0 0 495 195" width="495" height="195" direction="ltr" role="img" aria-label="GitHub streak overview">
  <g>
    <g style="isolation: isolate">
      <rect stroke="#000000" stroke-opacity="0" fill="#1a1b27" rx="4.5" x="0.5" y="0.5" width="494" height="194"></rect>
    </g>
    <g style="isolation: isolate">
      <line x1="165" y1="28" x2="165" y2="170" vector-effect="non-scaling-stroke" stroke-width="1" stroke="#E4E2E2" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"></line>
      <line x1="330" y1="28" x2="330" y2="170" vector-effect="non-scaling-stroke" stroke-width="1" stroke="#E4E2E2" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"></line>
    </g>
    <g style="isolation: isolate">
      <g transform="translate(82.5, 48)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#70A5FD" stroke="none" font-weight="700" font-size="28px" font-style="normal">${escapeSvgText(totalCommits)}</text>
      </g>
      <g transform="translate(82.5, 84)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#70A5FD" stroke="none" font-weight="400" font-size="14px" font-style="normal">Total Contributions</text>
      </g>
      <g transform="translate(82.5, 114)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#38BDAE" stroke="none" font-weight="400" font-size="12px" font-style="normal">${escapeSvgText(totalRange)}</text>
      </g>
    </g>
    <g style="isolation: isolate">
      <g transform="translate(247.5, 108)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#BF91F3" stroke="none" font-weight="700" font-size="14px" font-style="normal">Current Streak</text>
      </g>
      <g transform="translate(247.5, 145)">
        <text x="0" y="21" stroke-width="0" text-anchor="middle" fill="#38BDAE" stroke="none" font-weight="400" font-size="12px" font-style="normal">${escapeSvgText(currentRange)}</text>
      </g>
      <path d="${streakRingPath}" fill="none" stroke="#70A5FD" stroke-width="5" stroke-linecap="round"></path>
      <g transform="translate(247.5, 19.5)" stroke-opacity="0">
        <path d="M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z" fill="none"></path>
        <path d="${STREAK_FIRE_PATH}" fill="#70A5FD" stroke-opacity="0"></path>
      </g>
      <g transform="translate(247.5, 48)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#BF91F3" stroke="none" font-weight="700" font-size="28px" font-style="normal">${escapeSvgText(snapshot.commits.current.length)}</text>
      </g>
    </g>
    <g style="isolation: isolate">
      <g transform="translate(412.5, 48)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#70A5FD" stroke="none" font-weight="700" font-size="28px" font-style="normal">${escapeSvgText(snapshot.commits.longest.length)}</text>
      </g>
      <g transform="translate(412.5, 84)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#70A5FD" stroke="none" font-weight="400" font-size="14px" font-style="normal">Longest Streak</text>
      </g>
      <g transform="translate(412.5, 114)">
        <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="#38BDAE" stroke="none" font-weight="400" font-size="12px" font-style="normal">${escapeSvgText(longestRange)}</text>
      </g>
    </g>
  </g>
</svg>`.trim();
}

async function main() {
  const snapshot = await generateSnapshot();
  const payload = {
    generatedAt: new Date().toISOString(),
    source: "github-public-graph+graphql",
    data: snapshot,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(SNAPSHOT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8"),
    writeFile(STATS_FILE, buildStatsOverviewSvg(snapshot) + "\n", "utf8"),
    writeFile(LANGUAGES_FILE, buildLanguageCardSvg(snapshot) + "\n", "utf8"),
    writeFile(STREAK_FILE, buildCommitRunSvg(snapshot) + "\n", "utf8"),
  ]);

  console.log(`Updated ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
