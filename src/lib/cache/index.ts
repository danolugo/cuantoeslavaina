import { InMemoryCache } from './memory'
import { CacheAdapter } from './types'

// Default to in-memory, can be swapped to Redis later seamlessly
export const cache: CacheAdapter = new InMemoryCache()

// TTL Constants
export const TTL_2_HOURS = 2 * 60 * 60 * 1000
export const TTL_12_HOURS = 12 * 60 * 60 * 1000
