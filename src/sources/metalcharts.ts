import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { browser_args } from '../utils/pupeteer';

import { copperLbToTroyOz } from "../utils/convert/copper";
import { uraniumLbToTroyOz } from "../utils/convert/uranium";
import { mtToTroyOz } from "../utils/convert/generic";

const BASE_URL = "https://metalcharts.org"
export const METALS = {
    "gold": "XAU",
    "silver": "XAG",
    "platinum": "XPT",
    "palladium": "XPD",
    "copper": "HG",
    "aluminum": "AL",
    "nickel": "NI",
    "zinc": "ZN",
    "lead": "PB",
    "tin": "SN",
    "steal": "JBP",
    "lithium": "LI",
    "uranium": "UXA",
}

export class MetalChartsError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MetalChartsError'
    }
}

async function getLatestPrices() {

    const prices = Object.keys(METALS). reduce((acc, metal) => {
        acc[metal] = 0
        return acc
    }, {} as Record<string, number>)

    const browser = await puppeteer.launch({
        headless: true,
        args: [...browser_args, `--proxy-server=${process.env.PROXY_SERVER ?? ''}`],
    });

    const page = await browser.newPage();

    await page.authenticate({
        username: process.env.PROXY_USERNAME ?? '',
        password: process.env.PROXY_PASSWORD ?? '',
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('body');

    const content = await page.content();
    const $ = cheerio.load(content);
    await browser.close();

    prices.gold = parseFloat( $('main a[href="/metals/xau"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '')) || 0
    prices.silver = parseFloat( $('main a[href="/metals/xag"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '')) || 0
    prices.platinum = parseFloat( $('main a[href="/metals/xpt"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '')) || 0
    prices.palladium = parseFloat( $('main a[href="/metals/xpd"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '')) || 0
    prices.copper = copperLbToTroyOz( parseFloat( $('main a[href="/metals/hg"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.aluminum = mtToTroyOz( parseFloat( $('main a[href="/metals/ali"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.nickel = mtToTroyOz( parseFloat( $('main a[href="/metals/ni"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.zinc = mtToTroyOz( parseFloat( $('main a[href="/metals/zn"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.lead = mtToTroyOz( parseFloat( $('main a[href="/metals/pb"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.tin = mtToTroyOz( parseFloat( $('main a[href="/metals/sn"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.steal = mtToTroyOz( parseFloat( $('main a[href="/metals/jbp"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.lithium = mtToTroyOz( parseFloat( $('main a[href="/metals/lc"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)
    prices.uranium = uraniumLbToTroyOz( parseFloat( $('main a[href="/metals/uxa"] div span.font-mono.font-semibold').text().trim().replace(/[$,]/g, '') ) || 0)

    return prices

}

export default async function () {

    return await getLatestPrices()

}

