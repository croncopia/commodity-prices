import metals from "./commodities/metals"

import 'dotenv/config'

async function main() {

    const metal_data = await metals()
    console.log(metal_data)

}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
