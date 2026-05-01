export function formatPKR(amountPaisa: number | bigint | null | undefined) {
  const paisa = Number(amountPaisa ?? 0);
  const rupees = Math.round(paisa / 100);
  const absolute = Math.abs(rupees);
  const sign = rupees < 0 ? "-" : "";

  if (absolute >= 10_000_000) {
    return `${sign}PKR ${(absolute / 10_000_000).toFixed(2)} Cr`;
  }

  if (absolute >= 100_000) {
    return `${sign}PKR ${(absolute / 100_000).toFixed(2)} L`;
  }

  return `${sign}PKR ${new Intl.NumberFormat("en-PK").format(absolute)}`;
}

export function rupeesToPaisa(rupees: number) {
  return Math.round(rupees * 100);
}

export function paisaToRupees(paisa: number | bigint | null | undefined) {
  return Math.round(Number(paisa ?? 0) / 100);
}
