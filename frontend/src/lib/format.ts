function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatSignedWeight(changeKg: number): string {
  const sign = changeKg > 0 ? "+" : "";
  return `${sign}${changeKg.toFixed(1)} kg`;
}

export { formatDate, formatSignedWeight };
