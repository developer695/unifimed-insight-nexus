export function formatBudget(micros: number): string {
    return `$${(micros / 1000000).toFixed(2)}`;
}