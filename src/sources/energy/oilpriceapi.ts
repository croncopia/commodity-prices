import redactKey from '../../utils/redact'

const BASE_URL = "https://api.oilpriceapi.com"
const BASE_CURRENCY = "USD"

export const ENERGY = {
    // Crude oil
    brent_crude: "BRENT_CRUDE_USD",
    wti_crude: "WTI_USD",
    tapis_crude: "TAPIS_CRUDE_USD",
    
    // Refined products
    gasoline: "GASOLINE_USD",
    diesel: "DIESEL_USD",
    heating_oil: "HEATING_OIL_USD",
    jet_fuel: "JET_FUEL_USD",
    
    // Natural gas / LNG
    natural_gas_henry_hub: "NATURAL_GAS_USD",
    natural_gas_nbp: "NATURAL_GAS_GBP",
    natural_gas_ttf: "DUTCH_TTF_EUR",
    lng_jkm: "JKM_LNG_USD",
    
    // Coal
    coal_generic: "COAL_USD",
    coal_capp: "CAPP_COAL_USD",
    coal_newcastle: "NEWCASTLE_COAL_USD",
    coal_coking: "COKING_COAL_USD",
    coal_nymex_appalachian: "NYMEX_APPALACHIAN_USD",
    
    // Marine / bunker fuel
    marine_vlsfo: "VLSFO_USD",
    marine_mgo_05s: "MGO_05S_USD",
    marine_hfo_380: "HFO_380_USD",
    marine_hfo_180: "HFO_180_USD",
}

export class OilPriceApiError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'OilPriceApiError'
    }
}

function describeError(err: unknown): string {
    return err instanceof Error ? err.message : String(err)
}

async function getLatestPrices(key: string) {

    const prices = Object.keys(ENERGY). reduce((acc, energy) => {
            acc[energy] = 0
            return acc
        }, {} as Record<string, number>)

    const API_URL = new URL(`${BASE_URL}/v1/prices/latest`)
    API_URL.searchParams.set('by_code', Object.values(ENERGY).join(','))

    const response = await fetch(API_URL, {
        headers: {
            'Authorization': `Token ${key}`,
            'Content-Type': 'application/json',
        }
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new OilPriceApiError(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.status || data.status !== 'success') {
        throw new OilPriceApiError(`API request was not successful: ${JSON.stringify(data)}`)
    }

    data.data.prices.forEach((item: { code: string; price: number }) => {
        prices[Object.keys(ENERGY).find(key => ENERGY[key] === item.code) ?? ''] = item.price ?? 0
    })

    return prices

}

export default async function () {

    const keys = (process.env.OILPRICEAPI_KEY ?? '')
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean)

    if (keys.length === 0) {
        throw new OilPriceApiError('OILPRICEAPI_KEY is not set')
    }

    const failures: string[] = []

    for (const key of keys) {
        try {
            return await getLatestPrices(key)
        } catch (err) {
            const reason = describeError(err)
            failures.push(`${redactKey(key)}: ${reason}`)
            console.warn(`oilpriceapi: key ${redactKey(key)} failed (${reason}), trying next key`)
        }
    }

}
