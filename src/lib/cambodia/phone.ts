/**
 * Cambodian phone numbers: a leading 0 (or +855 / 855) followed by 8 or 9 digits,
 * e.g. 012 345 678, 097 123 4567, +855 12 345 678.
 */

/** Returns the number in local form ("012345678") or null if it is not a valid Cambodian number. */
export function normalizeCambodianPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  let local: string;
  if (digits.startsWith("+855")) local = "0" + digits.slice(4);
  else if (digits.startsWith("855")) local = "0" + digits.slice(3);
  else local = digits;
  return /^0\d{8,9}$/.test(local) ? local : null;
}

export function isCambodianPhone(input: string): boolean {
  return normalizeCambodianPhone(input) !== null;
}

/** "012345678" → "012 345 678", "0971234567" → "097 123 4567". Leaves invalid input unchanged. */
export function formatCambodianPhone(input: string): string {
  const local = normalizeCambodianPhone(input);
  if (!local) return input;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}
