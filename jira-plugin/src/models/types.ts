// Core Type Definitions for Jira Planning Mate

export interface Issue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  issueType: string;
  status: string;
  priority: string;
  assignee?: User;
  reporter: User;
  created: string;
  updated: string;
  dueDate?: string;
  storyPoints?: number;
  estimate?: number; // in hours or days
  components?: string[];
  labels?: string[];
  fixVersion?: string;
  sprint?: Sprint;
  epic?: Epic;
  linkedIssues: LinkedIssue[];
  customFields?: Record<string, unknown>;
}

export interface User {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  avatarUrl?: string;
  teams: string[];
  skills: string[];
  capacity: number; // hours per iteration
}

export interface LinkedIssue {
  id: string;
  key: string;
  type: 'blocks' | 'is blocked by' | 'relates to' | 'duplicates' | 'is duplicated by' | 'clone';
  inward: boolean;
}

export interface Sprint {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string;
  endDate: string;
  goal?: string;
}

export interface Epic {
  id: string;
  key: string;
  summary: string;
  color?: string;
  customFields?: Record<string, unknown>;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  defaultAssignee?: User;
  velocity?: number;
  capacityPerIteration: number;
}

export interface TeamCapacity {
  teamId: string;
  teamName: string;
  iterations: IterationCapacity[];
}

export interface IterationCapacity {
  iteration: number;
  capacity: number; // available hours
  planned: number; // already committed
  available: number; // capacity - planned
  holidays: number;
  absences: number;
}

export interface Constraint {
  id: string;
  type: 'HARD' | 'SOFT';
  category: 'DEPENDENCY' | 'CAPACITY' | 'SKILL' | 'DEADLINE' | 'TEAM' | 'WORKLOAD';
  description: string;
  weight?: number; // for soft constraints
  enabled: boolean;
  parameters: Record<string, unknown>;
}

export interface ConstraintSystem {
  hardConstraints: Constraint[];
  softConstraints: Constraint[];
  
  addHardConstraint(constraint: Constraint): void;
  addSoftConstraint(constraint: Constraint): void;
  removeConstraint(id: string): void;
  getApplicableConstraints(issue: Issue): Constraint[];
  evaluateHardConstraints(issue: Issue, assignment: Assignment): Violation[];
  evaluateSoftConstraints(issue: Issue, assignment: Assignment): number;
}

export interface Assignment {
  issueId: string;
  teamId: string;
  iteration: number;
  startDate?: string;
  endDate?: string;
  confidence?: number;
}

export interface Violation {
  constraintId: string;
  constraintType: 'HARD' | 'SOFT';
  issueId: string;
  issueKey: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedAssignments: string[];
  repairSuggestions?: string[];
}

export interface FeasibilityResult {
  feasible: boolean;
  assignments?: Assignment[];
  violations: Violation[];
  conflictCore?: ConflictInfo[];
  repairActions?: RepairAction[];
  confidence: number;
  analysisTime: number;
  metadata: {
    totalIssues: number;
    assignedIssues: number;
    unassignedIssues: number;
    totalCapacity: number;
    usedCapacity: number;
    constraintViolations: number;
  };
}

export interface ConflictInfo {
  id: string;
  type: 'CYCLE' | 'CAPACITY' | 'DEADLINE' | 'DEPENDENCY' | 'SKILL' | 'WORKLOAD';
  issues: string[];
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedConstraints: string[];
  minimalSet?: boolean;
}

export interface RepairAction {
  id: string;
  type: 'RESCHEDULE' | 'REASSIGN' | 'SPLIT' | 'DROP' | 'ADD_DEPENDENCY' | 'REMOVE_DEPENDENCY' | 'ADJUST_ESTIMATE';
  description: string;
  targetIssue: string;
  sourceIssue?: string;
  parameters: {
    newTeam?: string;
    newIteration?: number;
    newEstimate?: number;
    newDependency?: string;
    removedDependency?: string;
  };
  expectedImpact: {
    violationsResolved: number;
    newViolations: number;
    feasibilityChange: 'IMPROVES' | 'NO_CHANGE' | 'DEGRADES';
  };
  priority: number;
  automated: boolean;
}

export interface PIPlan {
  id: string;
  name: string;
  projectKey: string;
  scope: Issue[];
  teams: TeamCapacity[];
  assignments: Assignment[];
  startDate: string;
  endDate: string;
  iterations: number;
  createdAt: string;
  createdBy: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'EXECUTING' | 'COMPLETED';
  constraints: ConstraintSystem;
  metadata: {
    version: string;
    snapshotId: string;
    jiraVersion: string;
    analysisVersion: string;
  };
}

export interface DataQualityMetrics {
  completeness: number; // 0-100
  consistency: number; // 0-100
  accuracy: number; // 0-100
  timeliness: number; // 0-100
  overall: number; // weighted average
  issues: {
    total: number;
    withEstimate: number;
    withAssignee: number;
    withDependencies: number;
    withComponents: number;
    withLabels: number;
  };
  blockers: DataQualityBlocker[];
}

export interface DataQualityBlocker {
  category: string;
  count: number;
  percentage: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedIssues: string[];
  recommendations: string[];
}

export interface OptimizationResult {
  solution: Assignment[];
  objectiveValue: number;
  runtime: number;
  iterations: number;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'TIMEOUT';
  gaps: {
    capacity: number;
    deadline: number;
    dependency: number;
    skill: number;
  };
}

export interface SolverConfig {
  timeout: number; // milliseconds
  maxIterations: number;
  warmStart: boolean;
  parallelism: boolean;
  heuristicLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  solverType: 'CP-SAT' | 'MIP' | 'CP' | 'HEURISTIC';
}

export interface PlanSnapshot {
  id: string;
  timestamp: string;
  projectKey: string;
  scopeIssues: string[];
  teamCapacities: TeamCapacity[];
  constraintSnapshot: {
    hardConstraints: string[];
    softConstraints: string[];
  };
  analysisResult: {
    feasible: boolean;
    violations: number;
    confidence: number;
  };
  metadata: {
    jiraBaseUrl: string;
    jiraVersion: string;
    pluginVersion: string;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ANALYZE' | 'EXPORT';
  userId: string;
  details: Record<string, unknown>;
  previousState?: string;
  newState?: string;
}

export interface JiraConfig {
  baseUrl: string;
  cloudId: string;
  authentication: {
    type: 'bearer' | 'jwt';
    credentials: Record<string, string>;
  };
  apiVersion: string;
  rateLimit: {
    requestsPerSecond: number;
    burstLimit: number;
  };
}

export interface PerformanceMetrics {
  queryTime: number;
  graphBuildTime: number;
  feasibilityAnalysisTime: number;
  optimizationTime: number;
  totalTime: number;
  memoryUsed: number;
}
