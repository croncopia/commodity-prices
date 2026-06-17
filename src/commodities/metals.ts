import goldapiio from "../sources/goldapiio";
import goldapicom from "../sources/goldapicom";
import metalpriceapi from "../sources/metalpriceapi";
import dailymetalprice from "../sources/dailymetalprice";

export default async function () {

    // const goldapiio_data = await goldapiio()
    // console.log(goldapiio_data)
    // const goldapicom_data = await goldapicom()
    // console.log(goldapicom_data)
    // const metalpriceapi_data = await metalpriceapi()
    // console.log(metalpriceapi_data)
    const dailymetalprice_data = await dailymetalprice()
    console.log(dailymetalprice_data)

    return []

}
