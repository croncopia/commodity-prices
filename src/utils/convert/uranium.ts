export function uraniumLbToTroyOz(pricePerLb: number): number {
    const LB_TO_TROY_OZ = 7000 / 480;
    return pricePerLb / LB_TO_TROY_OZ;
}