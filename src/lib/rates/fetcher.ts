import { ProviderError, ProviderErrorCode } from './errors'
import { circuitBreaker } from '../cache'

interface FetchOptions extends RequestInit {
    timeoutMs?: number
    retries?: number
}

export async function fetchWithProviderHandling(
    url: string,
    providerName: string,
    requestId: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { timeoutMs = 8000, retries = 2, ...fetchOptions } = options

    // Circuit Breaker Fast-Fail Check
    const breakerState = await circuitBreaker.getState(providerName)
    if (breakerState.openUntil && Date.now() < breakerState.openUntil) {
        console.warn(`[${requestId}] ${providerName} fetch rejected. Circuit Breaker is OPEN.`)
        throw new ProviderError('Provider Circuit Breaker is OPEN', 'NETWORK', providerName)
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        const startTime = performance.now()

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal as RequestInit['signal']
            })

            clearTimeout(timeoutId)

            const durationMs = Math.round(performance.now() - startTime)

            // Handle HTTP errors structure
            if (!response.ok) {
                let code: ProviderErrorCode = 'NETWORK'
                if (response.status === 401 || response.status === 403) code = 'AUTH'
                else if (response.status === 429) code = 'RATE_LIMIT'
                else if (response.status >= 500) code = 'NETWORK'

                console.warn(`[${requestId}] ${providerName} (Attempt ${attempt + 1}) - HTTP ${response.status} in ${durationMs}ms`)

                if (attempt === retries) {
                    // Trip breaker on persistent 5xx server errors
                    if (response.status >= 500) await circuitBreaker.recordFailure(providerName, 60000, 3)
                    throw new ProviderError(`HTTP ${response.status} from ${url}`, code, providerName, response.status)
                }

                // Wait before retry with exponential backoff + jitter
                const delayMs = Math.min(500 * Math.pow(2, attempt), 5000) + Math.random() * 200
                await new Promise(resolve => setTimeout(resolve, delayMs))
                continue
            }

            // Success
            await circuitBreaker.recordSuccess(providerName)
            console.log(`[${requestId}] ${providerName} fetch successful in ${durationMs}ms`)
            return response

        } catch (error: any) {
            if (error instanceof ProviderError) throw error

            const durationMs = Math.round(performance.now() - startTime)
            console.warn(`[${requestId}] ${providerName} (Attempt ${attempt + 1}) failed in ${durationMs}ms:`, error.message || error)

            if (attempt === retries || error.name === 'AbortError') {
                let code: ProviderErrorCode = 'UNKNOWN'

                if (error.name === 'AbortError') code = 'TIMEOUT'
                else if (error?.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error?.cause?.code === 'CERT_HAS_EXPIRED') {
                    const hostname = new URL(url).hostname
                    console.error(`\n[TLS Error][${requestId}] Hostname: ${hostname}`)
                    console.error(`[TLS Error] Details: ${error.cause.message} (${error.cause.code})`)
                    console.error(`[TLS Error] Proposed Safe Fix: 1) Swap provider to an official structured API. 2) Provide a custom CA bundle for this domain.\n`)
                    code = 'NETWORK'
                } else if (error instanceof TypeError) {
                    code = 'NETWORK'
                }

                // Trip circuit breaker on persistent network timeouts/failures down to the metal
                await circuitBreaker.recordFailure(providerName, 60000, 3)

                throw new ProviderError(error.message || 'Fetch failed', code, providerName)
            }

            // Wait before retry with exponential backoff + jitter
            const delayMs = Math.min(500 * Math.pow(2, attempt), 5000) + Math.random() * 200
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
    }

    throw new ProviderError('Retries exhausted', 'NETWORK', providerName)
}
