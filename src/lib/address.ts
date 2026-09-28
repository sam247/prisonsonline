/**
 * HMPPS import addresses already end with the postcode ("Western Way, Thamesmead, London, SE28 0EB")
 * while `postcode` is also stored separately. These helpers stop the postcode rendering twice.
 */
function squash(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `address` already contains `postcode` (spacing/case-insensitive). */
export function addressIncludesPostcode(address?: string | null, postcode?: string | null): boolean {
  const a = address?.trim();
  const p = postcode?.trim();
  if (!a || !p) return false;
  return squash(a).includes(squash(p));
}

/** Address with a trailing copy of `postcode` removed (for display next to a separate postcode field). */
export function addressWithoutPostcode(address?: string | null, postcode?: string | null): string | undefined {
  const a = address?.replace(/\s+/g, " ").trim();
  if (!a) return undefined;
  const p = postcode?.trim();
  if (!p) return a;
  const pattern = p.replace(/\s+/g, "").split("").map(escapeRegExp).join("\\s*");
  const stripped = a.replace(new RegExp(`[,\\s]*${pattern}\\s*$`, "i"), "").trim();
  return stripped || a;
}

/** "address, postcode" without repeating a postcode the address already contains. */
export function joinAddressAndPostcode(address?: string | null, postcode?: string | null): string {
  const a = address?.replace(/\s+/g, " ").trim() ?? "";
  const p = postcode?.replace(/\s+/g, " ").trim() ?? "";
  if (!a) return p;
  if (!p || addressIncludesPostcode(a, p)) return a;
  return `${a}, ${p}`;
}
