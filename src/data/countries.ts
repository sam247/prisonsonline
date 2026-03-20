export interface Country {
  name: string;
  slug: string;
  region: string;
  prisonCount: number;
  prisonPopulation: number;
  description: string;
  securitySystemDescription: string;
}

export const countriesData: Country[] = [
  {
    name: "United Kingdom",
    slug: "uk",
    region: "Europe",
    prisonCount: 123,
    prisonPopulation: 87000,
    description: "The United Kingdom operates a prison system across England, Wales, Scotland, and Northern Ireland. HM Prison Service manages prisons in England and Wales, while Scotland and Northern Ireland have separate systems. The system uses a category-based classification from Category A (highest security) to Category D (open prisons).",
    securitySystemDescription: "Prisons are classified into four categories: Category A (maximum security for prisoners whose escape would be highly dangerous), Category B (prisoners who do not need maximum security but for whom escape must be made very difficult), Category C (training prisons where prisoners cannot be trusted in open conditions), and Category D (open prisons for prisoners who present a low risk).",
  },
  {
    name: "United States (Federal)",
    slug: "us",
    region: "North America",
    prisonCount: 143,
    prisonPopulation: 0,
    description:
      "This directory slice lists federal Bureau of Prisons facilities from the site’s BOP-derived import. It does not include state prison systems, county jails, or ICE detention unless they appear elsewhere in the dataset. Counts update when the import is refreshed.",
    securitySystemDescription:
      "Facility-type codes in the import (for example FCI, USP, FPC) are administrative labels for browsing. Official designations and security levels are published by the Federal Bureau of Prisons.",
  },
  {
    name: "United States",
    slug: "united-states",
    region: "North America",
    prisonCount: 1566,
    prisonPopulation: 1900000,
    description: "The United States has the largest prison population in the world. The federal Bureau of Prisons operates over 120 facilities, while each state runs its own prison system. County jails, operated by local governments, hold pre-trial detainees and those serving short sentences.",
    securitySystemDescription: "Federal prisons are classified from Minimum to Administrative Maximum (ADX). State systems vary but generally use Minimum, Medium, Maximum, and Supermax designations. The federal system also includes Administrative facilities for specialised functions.",
  },
  {
    name: "Canada",
    slug: "canada",
    region: "North America",
    prisonCount: 43,
    prisonPopulation: 39000,
    description: "Canada's correctional system is divided between federal and provincial jurisdictions. The Correctional Service of Canada manages federal penitentiaries for offenders sentenced to two years or more. Provincial and territorial systems handle shorter sentences and remand.",
    securitySystemDescription: "Federal institutions are classified as Minimum, Medium, or Maximum security. Multi-level facilities combine different security levels within one institution. Healing lodges serve Indigenous offenders.",
  },
  {
    name: "Australia",
    slug: "australia",
    region: "Oceania",
    prisonCount: 101,
    prisonPopulation: 42000,
    description: "Australia's prison system is managed by individual states and territories. Each jurisdiction operates its own correctional service. The country has faced ongoing challenges with Indigenous overrepresentation in the prison population.",
    securitySystemDescription: "Most states use a classification system ranging from Minimum to Maximum security. Some jurisdictions use numerical ratings. Open and closed prison categories are common across states.",
  },
  {
    name: "France",
    slug: "france",
    region: "Europe",
    prisonCount: 187,
    prisonPopulation: 73000,
    description: "France operates its prison system through the Direction de l'administration pénitentiaire (DAP). The system includes maisons d'arrêt (remand prisons), centres de détention (detention centres for sentenced prisoners), and maisons centrales (high-security prisons).",
    securitySystemDescription: "French prisons are categorised by function rather than a strict security level. Maisons centrales are the highest security. Centres de semi-liberté allow semi-open conditions for prisoners nearing release.",
  },
  {
    name: "Germany",
    slug: "germany",
    region: "Europe",
    prisonCount: 179,
    prisonPopulation: 56000,
    description: "Germany's prison system is managed by individual federal states (Länder). The system places a strong emphasis on rehabilitation and reintegration. German prisons generally offer better conditions than many other countries, with a focus on preparing inmates for return to society.",
    securitySystemDescription: "Prisons are classified as open (offene Vollzugsanstalten) or closed (geschlossene Vollzugsanstalten). Open prisons allow inmates more freedom and are used for lower-risk prisoners. High-security wings exist within closed prisons.",
  },
  {
    name: "Japan",
    slug: "japan",
    region: "Asia",
    prisonCount: 77,
    prisonPopulation: 45000,
    description: "Japan's correctional system is operated by the Ministry of Justice. The country has one of the lowest incarceration rates among developed nations. Japanese prisons are known for their strict discipline and structured routines.",
    securitySystemDescription: "Prisons are classified by the type of inmates they hold: Class A for those needing maximum supervision, Class B for those needing moderate supervision. Facilities are also divided by gender, age, and sentence length.",
  },
];

export const getCountry = (slug: string) => countriesData.find(c => c.slug === slug);
