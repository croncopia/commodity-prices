import goldapiio from "../sources/goldapiio";
import goldapicom from "../sources/goldapicom";

export default async function () {

    //const goldapiio_data = await goldapiio()
    const goldapicom_data = goldapicom()

    return goldapicom_data

}
