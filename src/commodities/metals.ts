import goldapiio from "../sources/goldapiio";
import goldapicom from "../sources/goldapicom";
import metalpriceapi from "../sources/metalpriceapi";

export default async function () {

    //const goldapiio_data = await goldapiio()
    //const goldapicom_data = goldapicom()
    const metalpriceapi_data = await metalpriceapi()

    return metalpriceapi_data

}
