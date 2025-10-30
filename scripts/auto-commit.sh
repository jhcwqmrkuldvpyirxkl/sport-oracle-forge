#!/bin/bash

# Auto-commit script for SportOracle project
# Reads author information from .env file and commits all changes

set -e  # Exit on error

# Get project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in project root"
    exit 1
fi

# Load environment variables from .env file
export $(grep -v '^#' .env | grep -E '^(GITHUB_USERNAME|GITHUB_EMAIL|GITHUB_PAT)=' | xargs)

# Verify required variables are set
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_EMAIL" ] || [ -z "$GITHUB_PAT" ]; then
    echo "❌ Error: Missing required environment variables in .env file"
    echo "   Required: GITHUB_USERNAME, GITHUB_EMAIL, GITHUB_PAT"
    exit 1
fi

echo "📝 Auto-commit script starting..."
echo "👤 Author: $GITHUB_USERNAME <$GITHUB_EMAIL>"

# Configure git user (local configuration)
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show status
echo ""
echo "📊 Changes to be committed:"
git status --short

# Add all changes
echo ""
echo "⏳ Adding all changes..."
git add -A

# Generate commit message with timestamp
COMMIT_MSG="${1:-Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')}"

# Create commit
echo "⏳ Creating commit..."
git commit -m "$COMMIT_MSG"

# Get remote URL
REMOTE_URL="https://${GITHUB_USERNAME}:${GITHUB_PAT}@github.com/${GITHUB_USERNAME}/sport-oracle-forge.git"

# Push to GitHub
echo "⏳ Pushing to GitHub..."
git push "$REMOTE_URL" main

echo ""
echo "✅ Auto-commit complete!"
echo "🔗 Repository: https://github.com/${GITHUB_USERNAME}/sport-oracle-forge"
