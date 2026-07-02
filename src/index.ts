import 'dotenv/config'

import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

import metals from "./commodities/metals"
import energy from "./commodities/energy"

const OUT_DIR = join(process.cwd(), "out")

async function main() {

    const [metalsResults, energyResults] = await Promise.all([
        metals().catch((e) => {
            console.warn("metals failed:", e.message)
            return undefined
        }),
        energy().catch((e) => {
            console.warn("energy failed:", e.message)
            return undefined
        })
    ])

    const index: Record<string, Record<string, string>> = {}

    for (const [category, results] of Object.entries({
        metals: metalsResults,
        energy: energyResults,
    })) {
        if (!results) continue
        index[category] = {}
        for (const name of Object.keys(results)) {
            index[category][name] = `/latest/${category}/${name}.json`
        }
    }

    mkdirSync(OUT_DIR, { recursive: true })
    writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2))

}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
