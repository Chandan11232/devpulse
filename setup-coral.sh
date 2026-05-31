#!/usr/bin/env bash
set -euo pipefail

echo "=== DevPulse: Coral Source Setup ==="

if ! command -v coral &>/dev/null; then
  echo "Installing Coral..."
  brew install withcoral/tap/coral
fi

echo ""
echo "Adding GitHub source..."
GITHUB_TOKEN=${GITHUB_TOKEN:-""} coral source add github --interactive

echo ""
echo "Adding Sentry source..."
SENTRY_ORG=${SENTRY_ORG:-""} SENTRY_TOKEN=${SENTRY_TOKEN:-""} coral source add sentry --interactive

echo ""
echo "Adding Slack source..."
SLACK_TOKEN=${SLACK_TOKEN:-""} coral source add slack --interactive

echo ""
echo "Verifying sources..."
coral source list

echo ""
echo "Running a quick schema-learn query to warm Coral's cache..."
coral sql "SELECT schema_name, table_name FROM coral.tables LIMIT 5"

echo ""
echo "=== Setup complete. Start the backend with: cd backend && npm install && npm run dev ==="
