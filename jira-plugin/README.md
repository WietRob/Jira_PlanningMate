# Jira Planning Mate

AI-powered PI (Program Increment) Planning plugin for Jira Cloud with Feasibility Certificate and Conflict Resolution.

## Overview

Jira Planning Mate extends the principles from the CuraOps patent to Jira PI Planning, providing:

- **Feasibility Certificate**: Deterministic "go/no-go" planning with issue-level explanations
- **Conflict Core Extraction**: Minimal set of issues causing planning conflicts
- **Repair Action Generation**: Concrete, prioritized suggestions to resolve conflicts
- **Constraint-based Planning**: Hard and soft constraint evaluation
- **Audit Trail**: Complete planning history for enterprise compliance

## Features

### 1. Scope Selection
- JQL-based issue selection
- Iteration planning (3-8 iterations)
- Multi-team capacity planning

### 2. Data Quality Check
- Validates estimates, assignees, dependencies, and components
- Quality score calculation
- Actionable recommendations

### 3. Feasibility Analysis
- Dependency graph building with cycle detection
- Capacity constraint evaluation
- Deadline and skill matching
- Confidence scoring

### 4. Conflict Resolution
- Minimal conflict core identification
- Prioritized repair actions
- Impact analysis for each action

## Architecture

```
jira-plugin/
├── manifest.yml           # Forge app manifest
├── src/
│   ├── index.ts           # GraphQL resolver
│   ├── models/
│   │   ├── types.ts       # Core type definitions
│   │   ├── constraint.ts  # Constraint system
│   │   └── audit.ts       # Audit trail
│   ├── services/
│   │   ├── jira.ts        # Jira API integration
│   │   ├── dependency.ts  # Dependency graph
│   │   ├── feasibility.ts # Core feasibility engine
│   │   ├── conflict-core.ts # Conflict extraction
│   │   ├── repair.ts      # Repair action generation
│   │   ├── planning.ts    # Planning utilities
│   │   └── solver.ts      # External solver integration
│   └── utils/
│       └── index.ts       # Utility functions
└── ui/
    └── src/
        ├── index.tsx      # UI entry point
        ├── hooks/
        │   └── useJira.ts # React hooks
        ├── components/
        │   ├── ScopeSelector.tsx
        │   ├── DataQualityReport.tsx
        │   ├── FeasibilityResult.tsx
        │   └── ConflictResolver.tsx
        └── pages/
            └── PlanningDashboard.tsx
```

## Installation

### Prerequisites
- Node.js 18+
- npm 9+
- Atlassian Forge CLI

### Setup

```bash
# Install dependencies
npm install

# Install UI dependencies
cd ui && npm install && cd ..

# Build the plugin
npm run build

# Deploy to Atlassian
forge deploy
```

## Configuration

### Constraint Configuration

```typescript
const constraints = {
  hardConstraints: [
    {
      id: 'hard-capacity-001',
      type: 'HARD',
      category: 'CAPACITY',
      description: 'Team capacity cannot be exceeded',
      enabled: true,
      parameters: { maxCapacity: 160 }
    },
    {
      id: 'hard-dependency-001',
      type: 'HARD',
      category: 'DEPENDENCY',
      description: 'Dependency cycles are not allowed',
      enabled: true,
      parameters: { blockTypes: ['blocks', 'is blocked by'] }
    }
  ],
  softConstraints: [
    {
      id: 'soft-skill-001',
      type: 'SOFT',
      category: 'SKILL',
      description: 'Prefer teams with matching skills',
      weight: 2,
      enabled: true,
      parameters: { skillField: 'components' }
    }
  ]
};
```

### Team Capacity Configuration

```typescript
const teams = [
  {
    teamId: 'team-1',
    teamName: 'Frontend Team',
    iterations: [
      { iteration: 1, capacity: 160, planned: 0, available: 160, holidays: 8, absences: 0 }
    ]
  }
];
```

## API Reference

### GraphQL Queries

#### fetchProjectScope
Fetches issues matching a JQL query.

```graphql
query FetchProjectScope($projectKey: String!, $jql: String) {
  fetchProjectScope(projectKey: $projectKey, jql: $jql) {
    id
    key
    summary
    issueType
    status
    priority
    estimate
    storyPoints
    components
    labels
    linkedIssues {
      id
      key
      type
    }
  }
}
```

#### analyzeDependencies
Analyzes dependency structure and detects cycles.

```graphql
query AnalyzeDependencies($projectKey: String!, $jql: String) {
  analyzeDependencies(projectKey: $projectKey, jql: $jql) {
    hasCycles
    cycles
    topologicalOrder
  }
}
```

#### checkFeasibility
Runs feasibility analysis and returns conflicts.

```graphql
query CheckFeasibility(
  $projectKey: String!
  $jql: String!
  $iterations: Int!
  $teamsJson: String!
  $constraintsJson: String!
) {
  checkFeasibility(
    projectKey: $projectKey
    jql: $jql
    iterations: $iterations
    teamsJson: $teamsJson
    constraintsJson: $constraintsJson
  ) {
    feasible
    confidence
    analysisTime
    violations {
      issueKey
      message
      severity
    }
    conflictCore {
      type
      issues
      message
      severity
    }
    repairActions {
      type
      description
      expectedImpact {
        feasibilityChange
      }
    }
  }
}
```

## Usage Flow

### 1. Create Planning Session
1. Select project and JQL scope
2. Configure number of iterations
3. Define team capacities

### 2. Run Data Quality Check
Review issues missing:
- Estimates
- Assignees
- Dependencies
- Components

### 3. Check Feasibility
- Get Feasibility Certificate (go/no-go)
- Review constraint violations
- Identify conflict core

### 4. Resolve Conflicts
- Apply repair actions
- Re-analyze feasibility
- Iterate until feasible

## Development

### Running Tests

```bash
npm test
```

### Building UI

```bash
cd ui && npm run build
```

### Local Development

```bash
forge tunnel
```

## Patent Background

This plugin extends the CuraOps patent principles from mobile workforce optimization to software planning:

- **Filter A (Skills/Qualifications)**: Skill-based issue-team matching
- **Filter B (Time Constraints)**: SLA/deadline enforcement
- **Filter C (Availability)**: Team capacity and iteration planning
- **Deterministic Pre-filtering**: Eliminates infeasible states before optimization

## Marketplace Listing

For Atlassian Marketplace:
- **Category**: Planning & Tracking
- **Pricing**: Free tier + Premium features
- **Support**: Email + Documentation

## Security & Compliance

- Read-only mode by default
- No data leaves Jira Cloud (optional external solver)
- Audit trail for enterprise compliance
- GDPR compliant data handling

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact support.
