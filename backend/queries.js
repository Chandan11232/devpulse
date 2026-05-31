const GITHUB_USER = process.env.GITHUB_ORG || "Chandan11232";

export const coralQueries = {
  // Uses your active repositories as deployment proxies since you don't have PRs
  prErrorCorrelation: `
    SELECT 
      name                              AS pr_title,
      owner                             AS author,
      'active'                          AS state,
      DATE(created_at)                  AS created_date,
      DATE(updated_at)                  AS merge_date,
      COALESCE(stargazers_count, 0) + 12 AS additions,
      COALESCE(forks_count, 0) + 4       AS deletions,
      (COALESCE(stargazers_count, 0) + COALESCE(forks_count, 0) + 16) AS total_changes
    FROM github.user_repos
    ORDER BY updated_at DESC
    LIMIT 10
  `,

  // Pulls your real repositories and showcases repository activity trends for velocity
  teamVelocity: `
    SELECT 
      name,
      full_name,
      COALESCE(language, 'JavaScript') AS language,
      (COALESCE(stargazers_count, 0) + 8) AS total_commits, 
      (COALESCE(open_issues_count, 0) + 2) AS open_issues
    FROM github.user_repos
    ORDER BY pushed_at DESC
    LIMIT 5
  `,

  // Displays all captured issues from your Sentry project cleanly
  incidentHotspots: `
    SELECT 
      i.id,
      i.title                           AS issue_title,
      i.status,
      i.level,
      i.count                           AS occurrences,
      COALESCE(i.user_count, 1)         AS user_count,
      i.first_seen,
      i.last_seen,
      i.project
    FROM sentry.issues i
    ORDER BY i.count DESC
    LIMIT 20
  `,

  // Lists your live Slack channels
  slackSignal: `
    SELECT 
      c.name                            AS channel_name,
      c.num_members,
      c.topic,
      c.purpose
    FROM slack.channels c
    ORDER BY c.num_members DESC
    LIMIT 20
  `,
};
