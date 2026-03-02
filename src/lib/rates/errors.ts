export type ProviderErrorCode = 'AUTH' | 'RATE_LIMIT' | 'TIMEOUT' | 'NETWORK' | 'PARSE' | 'UNKNOWN'

export class ProviderError extends Error {
    public code: ProviderErrorCode
    public provider: string
    public status?: number

    constructor(message: string, code: ProviderErrorCode, provider: string, status?: number) {
        super(message)
        this.name = 'ProviderError'
        this.code = code
        this.provider = provider
        this.status = status
    }
}
