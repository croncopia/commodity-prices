import redactKey from '../../utils/redact'

const BASE_URL = "https://api.metalpriceapi.com"
const BASE_CURRENCY = "USD"
export const METALS = {
    "silver": "XAG",
    "gold": "XAU",
    "platinum": "XPT",
    "palladium": "XPD",
}

export class MetalPriceApiError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MetalPriceApiError'
    }
}

function describeError(err: unknown): string {
    return err instanceof Error ? err.message : String(err)
}

async function getLatestPrices(key: string) {

    const prices = Object.keys(METALS). reduce((acc, metal) => {
        acc[metal] = 0
        return acc
    }, {} as Record<string, number>)

    const API_URL = new URL(`${BASE_URL}/v1/latest`)
    API_URL.searchParams.set('api_key', key)
    API_URL.searchParams.set('base', BASE_CURRENCY)
    API_URL.searchParams.set('currencies', Object.values(METALS).join(','))

    const response = await fetch(API_URL)

    if (!response.ok) {
        const errorText = await response.text()
        throw new MetalPriceApiError(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new MetalPriceApiError(`API request was not successful: ${JSON.stringify(data)}`)
    }

    const rates = data.rates

    prices["silver"] = rates.USDXAG || 0
    prices["gold"] = rates.USDXAU || 0
    prices["platinum"] = rates.USDXPT || 0
    prices["palladium"] = rates.USDXPD || 0

    return prices

}

export default async function () {

    const keys = (process.env.METALPRICEAPI_KEY ?? '')
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean)

    if (keys.length === 0) {
        throw new MetalPriceApiError('METALPRICEAPI_KEY is not set')
    }

    const failures: string[] = []

    for (const key of keys) {
        try {
            return await getLatestPrices(key)
        } catch (err) {
            const reason = describeError(err)
            failures.push(`${redactKey(key)}: ${reason}`)
            console.warn(`metalpriceapi: key ${redactKey(key)} failed (${reason}), trying next key`)
        }
    }

}
