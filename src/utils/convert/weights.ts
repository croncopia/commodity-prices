const GRAMS_PER_TROY_OZ = 31.1034768;
const GRAMS_PER_OZ = 28.3495231;
const GRAMS_PER_LB = 453.59237;
const GRAMS_PER_KG = 1_000;
const GRAMS_PER_MT = 1_000_000;

export function troyOzToWeights(pricePerTroyOz: number): Record<string, number> {
    const pricePerGram = pricePerTroyOz / GRAMS_PER_TROY_OZ;
    return {
        troy_ounce: pricePerTroyOz,
        gram: pricePerGram,
        kilogram: pricePerGram * GRAMS_PER_KG,
        ounce: pricePerGram * GRAMS_PER_OZ,
        pound: pricePerGram * GRAMS_PER_LB,
        metric_ton: pricePerGram * GRAMS_PER_MT,
    };
}
