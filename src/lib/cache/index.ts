import { InMemoryCache } from './memory'
import { InMemoryCircuitBreaker } from './breaker'
import { CacheAdapter, CircuitBreakerAdapter } from './types'

// Default to in-memory, can be swapped to Redis later seamlessly
export const cache: CacheAdapter = new InMemoryCache()
export const circuitBreaker: CircuitBreakerAdapter = new InMemoryCircuitBreaker()

// TTL Constants
export const TTL_2_HOURS = 2 * 60 * 60 * 1000
export const TTL_12_HOURS = 12 * 60 * 60 * 1000
export const TTL_5_MINS = 5 * 60 * 1000
