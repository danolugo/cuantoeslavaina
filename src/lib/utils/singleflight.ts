/**
 * A utility that ensures only one execution of a given function runs at a time for a specific key.
 * Concurrent callers requesting the same key will receive the same shared Promise.
 */
export class Singleflight {
    private inFlight = new Map<string, Promise<any>>()

    /**
     * Execute the given function or return the existing in-flight promise for the key.
     */
    async do<T>(key: string, fn: () => Promise<T>): Promise<T> {
        if (this.inFlight.has(key)) {
            return this.inFlight.get(key) as Promise<T>
        }

        const promise = fn().finally(() => {
            this.inFlight.delete(key)
        })

        this.inFlight.set(key, promise)
        return promise
    }
}

// Global singleton instance
export const singleflight = new Singleflight()
