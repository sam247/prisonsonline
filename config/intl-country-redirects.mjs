/**
 * Permanent redirects from legacy country-name URLs to official-source country directories.
 * Add a country here in the same PR that adds its data.
 */
const intlCountryAliases = {
  ca: ["canada"],
  ie: ["ireland"],
  nz: ["new-zealand"],
  au: ["australia"],
};

export const intlCountryRedirects = Object.entries(intlCountryAliases).flatMap(([cc, names]) =>
  names.flatMap((name) => [
    { source: `/countries/${name}`, destination: `/prisons/${cc}`, permanent: true },
    { source: `/prisons/${name}`, destination: `/prisons/${cc}`, permanent: true },
    { source: `/prisons/${name}/:path*`, destination: `/prisons/${cc}/:path*`, permanent: true },
  ]),
);
