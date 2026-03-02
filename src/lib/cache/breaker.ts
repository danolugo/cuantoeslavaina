import { CircuitBreakerAdapter, CircuitBreakerState } from './types'

export class InMemoryCircuitBreaker implements CircuitBreakerAdapter {
    private failures = new Map<string, number>()
    private openUntil = new Map<string, number>()

    async getState(key: string): Promise<CircuitBreakerState> {
        const f = this.failures.get(key) || 0
        const u = this.openUntil.get(key) || null

        // If time passed, clear open status implicitly returned
        if (u && Date.now() > u) {
            this.openUntil.delete(key)
            return { failures: f, openUntil: null }
        }

        return { failures: f, openUntil: u }
    }

    async recordFailure(key: string, openDurationMs: number, threshold: number): Promise<void> {
        const currentFailures = (this.failures.get(key) || 0) + 1
        this.failures.set(key, currentFailures)

        if (currentFailures >= threshold) {
            this.openUntil.set(key, Date.now() + openDurationMs)
        }
    }

    async recordSuccess(key: string): Promise<void> {
        this.failures.delete(key)
        this.openUntil.delete(key)
    }
}
