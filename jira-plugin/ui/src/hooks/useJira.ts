import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@forge/bridge';

interface UseJiraQueryOptions<T> {
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  variables?: Record<string, unknown>;
}

export function useJiraQuery<T>(
  queryKey: string,
  options: UseJiraQueryOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(options.autoFetch ?? true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await invoke(queryKey, ...args);
      const typedResult = result as T;
      setData(typedResult);
      options.onSuccess?.(typedResult);
      return typedResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [queryKey, options]);

  useEffect(() => {
    if (options.autoFetch) {
      execute();
    }
  }, [options.autoFetch]);

  return { data, loading, error, execute };
}

export function useProjectScope(projectKey: string, jql?: string) {
  return useJiraQuery<any[]>('fetchProjectScope', {
    autoFetch: !!projectKey,
    variables: { projectKey, jql }
  });
}

export function useDependencyAnalysis(projectKey: string, jql?: string) {
  return useJiraQuery<any>('analyzeDependencies', {
    autoFetch: !!projectKey,
    variables: { projectKey, jql }
  });
}

export function useFeasibilityCheck(
  projectKey: string,
  jql: string,
  iterations: number,
  teams: string[],
  constraints: any
) {
  return useJiraQuery<any>('checkFeasibility', {
    autoFetch: false,
    variables: {
      projectKey,
      jql,
      iterations,
      teamsJson: JSON.stringify(teams),
      constraintsJson: JSON.stringify(constraints)
    }
  });
}

export function useDataQualityReport(projectKey: string, jql: string) {
  return useJiraQuery<any>('getDataQualityReport', {
    autoFetch: false,
    variables: { projectKey, jql }
  });
}

export function useRepairActions(
  conflictCoreJson: string,
  projectKey: string,
  jql: string
) {
  return useJiraQuery<any[]>('getRepairActions', {
    autoFetch: false,
    variables: { conflictCoreJson, projectKey, jql }
  });
}
