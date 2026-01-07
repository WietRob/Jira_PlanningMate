interface UseJiraQueryOptions<T> {
    autoFetch?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    variables?: Record<string, unknown>;
}
export declare function useJiraQuery<T>(queryKey: string, options?: UseJiraQueryOptions<T>): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<T>;
};
export declare function useProjectScope(projectKey: string, jql?: string): {
    data: any[] | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<any[]>;
};
export declare function useDependencyAnalysis(projectKey: string, jql?: string): {
    data: any;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<any>;
};
export declare function useFeasibilityCheck(projectKey: string, jql: string, iterations: number, teams: string[], constraints: any): {
    data: any;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<any>;
};
export declare function useDataQualityReport(projectKey: string, jql: string): {
    data: any;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<any>;
};
export declare function useRepairActions(conflictCoreJson: string, projectKey: string, jql: string): {
    data: any[] | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<any[]>;
};
export {};
//# sourceMappingURL=useJira.d.ts.map