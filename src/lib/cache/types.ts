export interface CacheAdapter {
    get<T>(key: string): Promise<T | null>
    set<T>(key: string, value: T, ttlMs: number): Promise<void>
    delete(key: string): Promise<void>
}

export interface CircuitBreakerState {
    failures: number
    openUntil: number | null
}

export interface CircuitBreakerAdapter {
    getState(key: string): Promise<CircuitBreakerState>
    recordFailure(key: string, openDurationMs: number, threshold: number): Promise<void>
    recordSuccess(key: string): Promise<void>
}
