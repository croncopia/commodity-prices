export function copperLbToTroyOz(pricePerLb: number): number {
    const GRAMS_PER_LB = 453.59237;
    const GRAMS_PER_TROY_OZ = 31.1034768;
    const lbToTroyOzFactor = GRAMS_PER_LB / GRAMS_PER_TROY_OZ;
    return pricePerLb / lbToTroyOzFactor;
}