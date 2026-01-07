import React from 'react';

export function ScopeSelector({ onScopeSelected }: { onScopeSelected: (jql: string, iterations: number, teams: string[]) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onScopeSelected(
      formData.get('jql') as string || 'type IN (Story, Bug)',
      parseInt(formData.get('iterations') as string, 10) || 6,
      (formData.get('teams') as string || 'Team A').split(',').map(t => t.trim())
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>PI Planning Scope</p>
      <div>
        <label>Project Key *</label>
        <input name="projectKey" placeholder="e.g., PROJ" required />
      </div>
      <div>
        <label>JQL Query</label>
        <input name="jql" defaultValue="type IN (Epic, Story, Bug, Task) AND status NOT IN (Done, Closed)" />
      </div>
      <div>
        <label>Iterations</label>
        <select name="iterations" defaultValue="6">
          <option value="3">3 iterations</option>
          <option value="4">4 iterations</option>
          <option value="5">5 iterations</option>
          <option value="6">6 iterations</option>
          <option value="8">8 iterations</option>
        </select>
      </div>
      <div>
        <label>Teams</label>
        <input name="teams" defaultValue="Team A, Team B, Team C" />
      </div>
      <button type="submit">Analyze Scope</button>
    </form>
  );
}

export function DataQualityReport({ report }: { report: any }) {
  return (
    <div>
      <p>Data Quality Report</p>
      <p>Quality Score: {report.qualityScore}%</p>
      <p>Total Issues: {report.totalIssues}</p>
    </div>
  );
}

export function FeasibilityResult({ result }: { result: any }) {
  return (
    <div>
      <p>Feasibility Analysis Result</p>
      <p>{result.feasible ? 'Feasible' : 'Not Feasible'} - {result.violations?.length || 0} violations</p>
      <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>
    </div>
  );
}

export function ConflictResolver({ conflicts, repairActions, onActionSelected, onRefresh }: any) {
  return (
    <div>
      <p>Conflict Resolution Center</p>
      <p>Found {conflicts.length} conflict(s) with {repairActions.length} action(s)</p>
      <button onClick={onRefresh}>Refresh Analysis</button>
    </div>
  );
}
