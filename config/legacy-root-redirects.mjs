const guideSlugs = [
  "how-prison-visits-work",
  "what-to-wear-to-a-prison-visit",
  "what-can-you-bring-to-prison",
  "what-happens-going-to-prison",
  "how-prison-sentences-work",
  "life-inside-prison",
  "prison-categories-explained",
  "rights-of-prisoners",
  "can-you-get-haircuts-in-prison",
  "can-you-send-pictures-in-prison-letters",
];

const articleSlugs = [
  "most-dangerous-prisons-world",
  "famous-prison-escapes",
  "prison-overcrowding-england-wales",
  "rehabilitation-reduces-reoffending",
  "history-supermax-prisons",
  "worst-prison-riots",
  "mental-health-in-prisons",
  "women-in-prison",
  "prison-systems-worldwide",
];

const prisonEntityRedirects = [
  {
    source: "/hmp-bullingdon",
    destination: "/prisons/uk/hmp-bullingdon",
    permanent: true,
  },
  {
    source: "/hmp-the-mount",
    destination: "/prisons/uk/hmp-the-mount",
    permanent: true,
  },
];

/**
 * Root-level legacy slugs that should consolidate into the canonical App Router paths.
 * Keep this list deliberate: only add entries when the canonical replacement is clear.
 */
export const legacyRootRedirects = [
  ...guideSlugs.map((slug) => ({
    source: `/${slug}`,
    destination: `/guides/${slug}`,
    permanent: true,
  })),
  ...articleSlugs.map((slug) => ({
    source: `/${slug}`,
    destination: `/articles/${slug}`,
    permanent: true,
  })),
  ...prisonEntityRedirects,
];
