export function trimmedMean(values: number[], trimPercent: number = 0.10): number {
    const valid = values.filter(v => v > 0);
    if (valid.length === 0) return 0;
    if (valid.length === 1) return valid[0];

    const sorted = [...valid].sort((a, b) => a - b);
    const trimCount = Math.round(sorted.length * trimPercent);
    const trimmed = trimCount * 2 >= sorted.length
        ? sorted
        : sorted.slice(trimCount, sorted.length - trimCount);

    return trimmed.reduce((sum, v) => sum + v, 0) / trimmed.length;
}
