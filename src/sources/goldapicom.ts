const BASE_URL = "https://api.gold-api.com"
const BASE_CURRENCY = "USD"
export const METALS = {
    "gold": "XAU",
    "silver": "XAG",
    "platinum": "XPT",
    "palladium": "XPD",
    "copper": "HG"
}

export class GoldApiComError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'GoldApiComError'
    }
}

async function getLatestPrices() {

    const prices = Object.keys(METALS). reduce((acc, metal) => {
        acc[metal] = 0 // Placeholder value, replace with actual API call
        return acc
    }, {} as Record<string, number>)

    for (const [metal, symbol] of Object.entries(METALS)) {
        const API_URL = `${BASE_URL}/price/${symbol}/${BASE_CURRENCY}`

        const response = await fetch(API_URL)

        if (!response.ok) {
            const errorText = await response.text()
            throw new GoldApiComError(`API request failed with status ${response.status}: ${errorText}`)
        }

        const data = await response.json()

        if (typeof data.price !== 'number') {
            throw new GoldApiComError(`Unexpected API response format for ${metal}: ${JSON.stringify(data)}`)
        }

        prices[metal] = data.price

        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return prices

}

export default async function () {
    return await getLatestPrices()
}
