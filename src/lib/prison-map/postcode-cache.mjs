/** A coordinate cache entry is usable only for the postcode that produced it. */
export function postcodeCoordinateMatches(row, postcode) {
  const normalize = value => String(value ?? "").replace(/\s/g, "").toUpperCase();
  return Boolean(row && normalize(postcode) && normalize(row.postcode) === normalize(postcode)
    && Number.isFinite(row.latitude) && Number.isFinite(row.longitude)
    && row.latitude >= 49 && row.latitude <= 61 && row.longitude >= -9 && row.longitude <= 3);
}
