import * as cheerio from 'cheerio';

const BASE_URL = "https://www.dailymetalprice.com"
const BASE_CURRENCY = "USD"

export const METALS = {
    "aluminum": "al",
    "colbalt": "co",
    "copper": "cu",
    "gallium": "ga",
    "gold": "au",
    "indium": "in",
    "iridium": "ir",
    "iron": "fe",
    "lead": "pb",
    "lithium": "li",
    "molybdenum": "mo",
    "neodymium": "nd",
    "nickel": "ni",
    "palladium": "pd",
    "platinum": "pt",
    "rhodium": "rh",
    "ruthenium": "ru",
    "silver": "ag",
    "tellurium": "te",
    "tin": "sn",
    "uranium": "u",
    "zinc": "zn"
}

export class DailyMetalPriceError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'DailyMetalPriceError'
    }
}

async function getLatestPrices() {

    const prices = Object.keys(METALS). reduce((acc, metal) => {
        acc[metal] = 0
        return acc
    }, {} as Record<string, number>)

    for (const [metal, symbol] of Object.entries(METALS)) {
        const API_URL = new URL(`${BASE_URL}/metalprices.php`)
        API_URL.searchParams.set('c', symbol)
        API_URL.searchParams.set('u', 'oz')
        API_URL.searchParams.set('d', '2')
        API_URL.searchParams.set('x', BASE_CURRENCY)

        const response = await fetch(API_URL)

        if (!response.ok) {
            const errorText = await response.text()
            throw new DailyMetalPriceError(`API request failed with status ${response.status}: ${errorText}`)
        }

        const $ = cheerio.load(await response.text());
        const text = $('.table:first > tbody:nth-child(2) > tr:nth-child(1) td:first').text()

        if (!text) {
            console.warn(`dailymetalprice: no price found for ${metal} (${symbol})`)
            continue;
        }

        if (!text.startsWith('$')) {
            console.warn(`dailymetalprice: unexpected price format for ${metal} (${symbol}): ${text}`)
            continue;
        }

        const price = parseFloat(text.replace('$', '').replace(',', ''))

        if (isNaN(price)) {
            console.warn(`dailymetalprice: failed to parse price for ${metal} (${symbol}): ${text}`)
            continue;
        }

        prices[metal] = price

    }

    return prices

}

export default async function () {

    return await getLatestPrices()

}
