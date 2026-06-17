// 1 metric ton (mt) = 1,000,000 grams
// 1 troy oz = 31.1034768 grams
const MT_TO_TROY_OZ = 1_000_000 / 31.1034768; // ≈ 32,150.7465

/**
 * Generic converter: price per metric ton -> price per troy oz
 */
export function mtToTroyOz(pricePerMt: number): number {
    return pricePerMt / MT_TO_TROY_OZ;
}