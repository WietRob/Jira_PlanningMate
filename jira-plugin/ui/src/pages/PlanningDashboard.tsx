import React, { useState } from 'react';
import Button from '@atlaskit/button';
import Heading from '@atlaskit/heading';
import Page, { Grid, GridColumn } from '@atlaskit/page';
import { ScopeSelector, DataQualityReport, FeasibilityResult, ConflictResolver } from '../components';

export function PlanningDashboard() {
  const [currentStep, setCurrentStep] = useState<'scope' | 'quality' | 'feasibility' | 'conflicts'>('scope');
  const [selectedScope, setSelectedScope] = useState<{ jql: string; iterations: number; teams: string[] } | null>(null);
  const [feasibilityResult, setFeasibilityResult] = useState<any>(null);
  const [dataQualityReport, setDataQualityReport] = useState<any>(null);

  const handleScopeSelected = (jql: string, iterations: number, teams: string[]) => {
    setSelectedScope({ jql, iterations, teams });
    setCurrentStep('quality');
    // Simulated data quality report
    setDataQualityReport({
      totalIssues: 25,
      qualityScore: 78,
      blockers: [
        { category: 'Missing Estimates', count: 5, percentage: 20 },
        { category: 'Unassigned Issues', count: 3, percentage: 12 }
      ]
    });
  };

  const handleCheckFeasibility = () => {
    // Simulated feasibility check
    setFeasibilityResult({
      feasible: true,
      confidence: 0.85,
      analysisTime: 1250,
      violations: [],
      metadata: {
        totalIssues: 25,
        assignedIssues: 22,
        unassignedIssues: 3,
        totalCapacity: 480,
        usedCapacity: 412
      }
    });
    setCurrentStep('feasibility');
  };

  const handleResolveConflicts = () => {
    setCurrentStep('conflicts');
  };

  return (
    <Page>
      <Grid>
        <GridColumn medium={12}>
          <div style={{ padding: '20px' }}>
            <Heading level="h700">Jira Planning Mate</Heading>
            <p>AI-powered PI Planning with Feasibility Certificate</p>
            
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #DFE1E5', borderRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Button 
                  appearance={currentStep === 'scope' ? 'primary' : 'default'}
                  onClick={() => setCurrentStep('scope')}
                >
                  1. Scope
                </Button>
                <Button 
                  appearance={currentStep === 'quality' ? 'primary' : 'default'}
                  onClick={() => setCurrentStep('quality')}
                >
                  2. Quality
                </Button>
                <Button 
                  appearance={currentStep === 'feasibility' ? 'primary' : 'default'}
                  onClick={() => setCurrentStep('feasibility')}
                >
                  3. Feasibility
                </Button>
                <Button 
                  appearance={currentStep === 'conflicts' ? 'primary' : 'default'}
                  onClick={() => setCurrentStep('conflicts')}
                >
                  4. Conflicts
                </Button>
              </div>
              
              <div style={{ marginTop: '24px' }}>
                {currentStep === 'scope' && (
                  <div>
                    <ScopeSelector onScopeSelected={handleScopeSelected} />
                  </div>
                )}
                
                {currentStep === 'quality' && dataQualityReport && (
                  <div>
                    <DataQualityReport report={dataQualityReport} />
                    <div style={{ marginTop: '20px' }}>
                      <Button appearance="primary" onClick={handleCheckFeasibility}>
                        Check Feasibility
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentStep === 'feasibility' && feasibilityResult && (
                  <div>
                    <FeasibilityResult result={feasibilityResult} />
                  </div>
                )}
                
                {currentStep === 'conflicts' && (
                  <div>
                    <ConflictResolver
                      conflicts={feasibilityResult?.conflictCore || []}
                      repairActions={feasibilityResult?.repairActions || []}
                      onActionSelected={(id: string) => console.log('Selected:', id)}
                      onRefresh={handleCheckFeasibility}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </GridColumn>
      </Grid>
    </Page>
  );
}
