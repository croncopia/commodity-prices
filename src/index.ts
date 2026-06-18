import 'dotenv/config'

import metals from "./commodities/metals"

async function main() {
    const results = await metals()
    console.log(results)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
