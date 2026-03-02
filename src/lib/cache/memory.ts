import { CacheAdapter } from './types'

interface CacheItem<T> {
    value: T
    expiresAt: number
}

export class InMemoryCache implements CacheAdapter {
    private store = new Map<string, CacheItem<any>>()

    async get<T>(key: string): Promise<T | null> {
        const item = this.store.get(key)
        if (!item) return null

        if (Date.now() > item.expiresAt) {
            this.store.delete(key)
            return null
        }

        return item.value as T
    }

    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        })
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key)
    }
}
