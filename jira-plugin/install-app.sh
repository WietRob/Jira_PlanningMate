#!/bin/bash
export FORGE_EMAIL="robertoschmidt2706@gmail.com"
export FORGE_API_TOKEN="ATATT3xFfGF0oaVbuwB950ewdl7ndJDuQ7KzNlb1_SCybFdy6iIf1Yx39fwLuWtXuExeB3eAu5-1AJoZ8tN9y-ZnT6NaENfW0AJOwwvhbCaF46nWxq6DPseOiv4-6bIxFPYv5Y_u14YVSX2mpVyt7NhxLguP3RnafdPMmT9ygday0y7WLYEXYxo=9BA1B6F1"
cd /home/roberto_schmidt/projects/Jira_PlanningMate/jira-plugin
echo "y" | forge install -s robertoschmidt.atlassian.net -p jira --confirm-scopes
