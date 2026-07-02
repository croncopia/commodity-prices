import redactKey from '../../utils/redact'

const BASE_URL = "https://www.goldapi.io"
const BASE_CURRENCY = "USD"
export const METALS = {
    "gold": "XAU",
    "silver": "XAG",
    "platinum": "XPT",
    "palladium": "XPD",
}

export class GoldApiIoError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'GoldApiIoError'
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

    for (const [metal, symbol] of Object.entries(METALS)) {
        const API_URL = `${BASE_URL}/api/${symbol}/${BASE_CURRENCY}`

        const response = await fetch(API_URL, {
            headers: {
                'x-access-token': key,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new GoldApiIoError(`API request failed with status ${response.status}: ${errorText}`)
        }

        const data = await response.json()

        if (typeof data.price !== 'number') {
            throw new GoldApiIoError(`Unexpected API response format for ${metal}: ${JSON.stringify(data)}`)
        }

        prices[metal] = data.price

    }

    return prices

}

export default async function () {

    const keys = (process.env.GOLDAPIIO_KEY ?? '')
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean)

    if (keys.length === 0) {
        throw new GoldApiIoError('GOLDAPIIO_KEY is not set')
    }

    const failures: string[] = []

    for (const key of keys) {
        try {
            return await getLatestPrices(key)
        } catch (err) {
            const reason = describeError(err)
            failures.push(`${redactKey(key)}: ${reason}`)
            console.warn(`goldapiio: key ${redactKey(key)} failed (${reason}), trying next key`)
        }
    }

}
