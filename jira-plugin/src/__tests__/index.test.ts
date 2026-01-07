import { buildDependencyGraph, detectCycles, TopologicalSort, findBottlenecks } from '../services/dependency';
import { Issue, TeamCapacity } from '../models/types';
import { ConstraintSystemImpl, createDefaultConstraints } from '../models/constraint';
import { FeasibilityEngine } from '../services/feasibility';
import { ConflictCoreExtractor } from '../services/conflict-core';
import { RepairActionGenerator } from '../services/repair';
import { validateDataQuality, calculateTeamCapacities } from '../services/planning';

describe('Dependency Graph', () => {
  const mockIssues: Issue[] = [
    {
      id: '1', key: 'PROJ-1', summary: 'Task 1', issueType: 'Story',
      status: 'Open', priority: 'High', reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
      created: '2024-01-01', updated: '2024-01-01', linkedIssues: [],
      labels: [], components: []
    },
    {
      id: '2', key: 'PROJ-2', summary: 'Task 2', issueType: 'Story',
      status: 'Open', priority: 'High', reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
      created: '2024-01-01', updated: '2024-01-01',
      linkedIssues: [{ id: '1', key: 'PROJ-1', type: 'blocks', inward: false }],
      labels: [], components: []
    },
    {
      id: '3', key: 'PROJ-3', summary: 'Task 3', issueType: 'Story',
      status: 'Open', priority: 'Medium', reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
      created: '2024-01-01', updated: '2024-01-01',
      linkedIssues: [{ id: '2', key: 'PROJ-2', type: 'blocks', inward: false }],
      labels: [], components: []
    }
  ];

  test('builds dependency graph correctly', () => {
    const graph = buildDependencyGraph(mockIssues);
    
    expect(graph.nodes.size).toBe(3);
    // PROJ-1 blocks PROJ-2, so edge: 1 -> 2
    expect(graph.edges.get('1')).toContain('2');
    // PROJ-2 blocks PROJ-3, so edge: 2 -> 3
    expect(graph.edges.get('2')).toContain('3');
    // PROJ-3 blocks nothing
    expect(graph.edges.get('3')).toHaveLength(0);
  });

  test('detects no cycles in linear dependency', () => {
    const graph = buildDependencyGraph(mockIssues);
    const cycles = detectCycles(graph);
    
    expect(cycles).toHaveLength(0);
  });

  test('detects cycle in circular dependency', () => {
    const cyclicIssues: Issue[] = [
      { ...mockIssues[0], linkedIssues: [{ id: '2', key: 'PROJ-2', type: 'blocks', inward: false }] },
      { ...mockIssues[1], linkedIssues: [{ id: '3', key: 'PROJ-3', type: 'blocks', inward: false }] },
      { ...mockIssues[2], linkedIssues: [{ id: '1', key: 'PROJ-1', type: 'blocks', inward: false }] }
    ];
    
    const graph = buildDependencyGraph(cyclicIssues);
    const cycles = detectCycles(graph);
    
    expect(cycles.length).toBeGreaterThan(0);
  });

  test('returns valid topological order', () => {
    const graph = buildDependencyGraph(mockIssues);
    const order = TopologicalSort(graph);
    
    expect(order.length).toBe(3);
    // Topological sort ensures that if A blocks B, then A comes before B
    // PROJ-1 is blocked by nothing, PROJ-2 is blocked by PROJ-1, PROJ-3 is blocked by PROJ-2
    // So 1 must come before 2, and 2 must come before 3
    const idx1 = order.indexOf('1');
    const idx2 = order.indexOf('2');
    const idx3 = order.indexOf('3');
    expect(idx1).toBeLessThan(idx2);
    expect(idx2).toBeLessThan(idx3);
  });
});

describe('Constraint System', () => {
  let constraints: ConstraintSystemImpl;

  beforeEach(() => {
    constraints = createDefaultConstraints();
  });

  test('adds hard constraints', () => {
    expect(constraints.hardConstraints.length).toBeGreaterThan(0);
  });

  test('adds soft constraints', () => {
    expect(constraints.softConstraints.length).toBeGreaterThan(0);
  });

  test('removes constraints', () => {
    const initialCount = constraints.hardConstraints.length;
    constraints.removeConstraint('hard-capacity-001');
    expect(constraints.hardConstraints.length).toBe(initialCount - 1);
  });

  test('evaluates capacity constraint correctly', () => {
    const issue: Issue = {
      id: '1', key: 'PROJ-1', summary: 'Big Task', issueType: 'Story',
      status: 'Open', priority: 'Medium', estimate: 200,
      reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
      created: '2024-01-01', updated: '2024-01-01', linkedIssues: [],
      labels: [], components: []
    };

    const assignment = { issueId: '1', teamId: 'team-1', iteration: 1 };
    const violations = constraints.evaluateHardConstraints(issue, assignment);
    
    expect(violations.some(v => v.constraintId === 'hard-capacity-001')).toBe(true);
  });
});

describe('Feasibility Engine', () => {
  const mockTeams: TeamCapacity[] = [
    {
      teamId: 'team-1',
      teamName: 'Team A',
      iterations: [
        { iteration: 1, capacity: 80, planned: 0, available: 80, holidays: 0, absences: 0 },
        { iteration: 2, capacity: 80, planned: 0, available: 80, holidays: 0, absences: 0 }
      ]
    }
  ];

  const mockIssues: Issue[] = [
    {
      id: '1', key: 'PROJ-1', summary: 'Task 1', issueType: 'Story',
      status: 'Open', priority: 'Medium', estimate: 16,
      reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
      created: '2024-01-01', updated: '2024-01-01', linkedIssues: [],
      labels: [], components: []
    },
    {
      id: '2', key: 'PROJ-2', summary: 'Task 2', issueType: 'Story',
      status: 'Open', priority: 'Medium', estimate: 24,
      reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
      created: '2024-01-01', updated: '2024-01-01', linkedIssues: [],
      labels: [], components: []
    }
  ];

  test('returns feasible result for simple case', () => {
    const graph = buildDependencyGraph(mockIssues);
    const engine = new FeasibilityEngine(mockIssues, graph, mockTeams, createDefaultConstraints());
    const result = engine.analyze();
    
    expect(result.feasible).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('returns infeasible for capacity overflow', () => {
    // Create an issue that will be assigned but violates a capacity constraint
    const overloadedIssues: Issue[] = [
      {
        id: '1', key: 'PROJ-1', summary: 'Task 1', issueType: 'Story',
        status: 'Open', priority: 'Medium', estimate: 50,  // Will fit in 80 capacity
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [],
        labels: [], components: []
      }
    ];

    // Team with capacity that allows assignment
    const overloadedTeams: TeamCapacity[] = [
      {
        teamId: 'team-1',
        teamName: 'Team A',
        iterations: [
          { iteration: 1, capacity: 80, planned: 0, available: 80, holidays: 0, absences: 0 }
        ]
      }
    ];

    // Create constraints with maxCapacity of 40 (issue has estimate 50)
    const constraints = new ConstraintSystemImpl();
    constraints.addHardConstraint({
      id: 'hard-capacity-001',
      type: 'HARD',
      category: 'CAPACITY',
      description: 'Team capacity cannot be exceeded',
      enabled: true,
      parameters: { maxCapacity: 40 }  // Lower than issue estimate
    });

    const graph = buildDependencyGraph(overloadedIssues);
    const engine = new FeasibilityEngine(overloadedIssues, graph, overloadedTeams, constraints, { iterations: 1 });
    const result = engine.analyze();
    
    // Should be infeasible because issue estimate (50) exceeds maxCapacity (40)
    expect(result.feasible).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.constraintId === 'hard-capacity-001')).toBe(true);
  });
});

describe('Conflict Core Extractor', () => {
  test('extracts minimal conflict set', () => {
    const mockIssues: Issue[] = [
      { id: '1', key: 'PROJ-1', summary: 'Task 1', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 100,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [], labels: [], components: [] },
      { id: '2', key: 'PROJ-2', summary: 'Task 2', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 100,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [], labels: [], components: [] }
    ];

    const graph = buildDependencyGraph(mockIssues);
    const constraints = createDefaultConstraints();
    
    const violations = [
      {
        constraintId: 'hard-capacity-001',
        constraintType: 'HARD' as const,
        issueId: '1',
        issueKey: 'PROJ-1',
        message: 'Capacity exceeded',
        severity: 'HIGH' as const,
        affectedAssignments: ['team-1'],
        repairSuggestions: []
      },
      {
        constraintId: 'hard-capacity-001',
        constraintType: 'HARD' as const,
        issueId: '2',
        issueKey: 'PROJ-2',
        message: 'Capacity exceeded',
        severity: 'HIGH' as const,
        affectedAssignments: ['team-1'],
        repairSuggestions: []
      }
    ];

    const extractor = new ConflictCoreExtractor(mockIssues, graph, constraints, []);
    const conflicts = extractor.extract(violations);
    
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].minimalSet).toBe(true);
  });
});

describe('Repair Action Generator', () => {
  test('generates reschedule actions for capacity conflicts', () => {
    const mockIssues: Issue[] = [
      { id: '1', key: 'PROJ-1', summary: 'Task 1', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 100,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [], labels: [], components: [] }
    ];

    const graph = buildDependencyGraph(mockIssues);
    const constraints = createDefaultConstraints();
    
    const conflicts = [
      {
        id: 'conflict-1',
        type: 'CAPACITY' as const,
        issues: ['1'],
        message: 'Capacity exceeded',
        severity: 'HIGH' as const,
        affectedConstraints: ['hard-capacity-001'],
        minimalSet: true
      }
    ];

    const generator = new RepairActionGenerator(mockIssues, graph, constraints);
    const actions = generator.generate(conflicts);
    
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.type === 'RESCHEDULE')).toBe(true);
  });

  test('generates remove dependency for cycle conflicts', () => {
    const cyclicIssues: Issue[] = [
      { id: '1', key: 'PROJ-1', summary: 'Task 1', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 8,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01',
        linkedIssues: [{ id: '2', key: 'PROJ-2', type: 'blocks', inward: false }], labels: [], components: [] },
      { id: '2', key: 'PROJ-2', summary: 'Task 2', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 8,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01',
        linkedIssues: [{ id: '1', key: 'PROJ-1', type: 'blocks', inward: false }], labels: [], components: [] }
    ];

    const graph = buildDependencyGraph(cyclicIssues);
    const constraints = createDefaultConstraints();
    
    const conflicts = [
      {
        id: 'cycle-1',
        type: 'CYCLE' as const,
        issues: ['1', '2'],
        message: 'Dependency cycle detected',
        severity: 'CRITICAL' as const,
        affectedConstraints: ['hard-dependency-001'],
        minimalSet: true
      }
    ];

    const generator = new RepairActionGenerator(cyclicIssues, graph, constraints);
    const actions = generator.generate(conflicts);
    
    expect(actions.some(a => a.type === 'REMOVE_DEPENDENCY')).toBe(true);
  });
});

describe('Data Quality Validation', () => {
  test('identifies missing estimates', () => {
    const issues: Issue[] = [
      { id: '1', key: 'PROJ-1', summary: 'Task with estimate', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 8,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [], labels: [], components: [] },
      { id: '2', key: 'PROJ-2', summary: 'Task without estimate', issueType: 'Story', status: 'Open', priority: 'Medium',
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [], labels: [], components: [] }
    ];

    const report = validateDataQuality(issues);
    
    expect(report.issuesWithoutEstimate).toContain('2');
    expect(report.qualityScore).toBeLessThan(100);
  });

  test('calculates quality score correctly', () => {
    const issues: Issue[] = [
      { id: '1', key: 'PROJ-1', summary: 'Task', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 8,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [{ id: '2', key: 'PROJ-2', type: 'is blocked by', inward: true }], labels: ['label1'], components: ['comp1'],
        assignee: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 } },
      { id: '2', key: 'PROJ-2', summary: 'Task', issueType: 'Story', status: 'Open', priority: 'Medium', estimate: 8,
        reporter: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 },
        created: '2024-01-01', updated: '2024-01-01', linkedIssues: [{ id: '1', key: 'PROJ-1', type: 'blocks', inward: false }], labels: ['label1'], components: ['comp1'],
        assignee: { accountId: '1', displayName: 'User', teams: [], skills: [], capacity: 160 } }
    ];

    const report = validateDataQuality(issues);
    
    // Both issues have complete data and have dependency links
    // PROJ-1 has "is blocked by" link, PROJ-2 has "blocks" link
    expect(report.qualityScore).toBe(100);
  });
});

describe('Team Capacity Calculation', () => {
  test('calculates capacities for multiple teams', () => {
    const teams = calculateTeamCapacities(['Team A', 'Team B', 'Team C'], 6);
    
    expect(teams).toHaveLength(3);
    expect(teams[0].iterations).toHaveLength(6);
    expect(teams[0].iterations[0].capacity).toBe(160);
  });
});
