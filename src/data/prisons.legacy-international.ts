import type { Prison } from "@/types/prison";

/** Manual narrative profiles for non-UK prisons (articles and URLs depend on these slugs). */
export const legacyInternationalPrisons: Prison[] = [
  {
    name: "San Quentin State Prison",
    slug: "san-quentin",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "California",
    regionSlug: "california",
    city: "San Quentin",
    securityLevel: "Maximum",
    capacity: 3082,
    operator: "California Department of Corrections and Rehabilitation",
    openedYear: 1852,
    latitude: 37.9396,
    longitude: -122.4862,
    type: "Male Adult",
    overview:
      "San Quentin State Prison is California's oldest correctional institution, located on the shore of San Francisco Bay in Marin County. It formerly housed the state's only male death row.",
    history:
      "Opened in 1852, San Quentin is the oldest prison in California. Built aboard the prison ship Waban, it has a rich and complex history spanning over 170 years. In 2023, Governor Newsom announced plans to transform the facility into a rehabilitation centre.",
    prisonLife:
      "San Quentin is known for its numerous rehabilitation programmes including the San Quentin News newspaper, coding bootcamps, college degree programmes, and various arts initiatives.",
    visitingInfo:
      "Visiting hours are on weekends and holidays. Visitors must be on the prisoner's approved visitor list and must present valid photo identification. Dress code requirements apply.",
    notableInmates:
      "San Quentin has housed many notable inmates including Charles Manson, Sirhan Sirhan, Scott Peterson, and Richard Ramirez. The prison's death row held some of California's most infamous criminals.",
    institutionalId: "legacy:san-quentin",
    dataProvenance: "manual",
  },
  {
    name: "ADX Florence",
    slug: "adx-florence",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "Colorado",
    regionSlug: "colorado",
    city: "Florence",
    securityLevel: "Supermax",
    capacity: 490,
    operator: "Federal Bureau of Prisons",
    openedYear: 1994,
    latitude: 38.3586,
    longitude: -105.0977,
    type: "Male Adult",
    overview:
      "ADX Florence, also known as the 'Alcatraz of the Rockies', is the most secure federal prison in the United States. It houses inmates deemed too dangerous or high-profile for other facilities.",
    history:
      "ADX Florence was opened in 1994 following a series of violent incidents at other federal prisons. It was designed to house the most dangerous, high-profile, and escape-prone inmates in the federal prison system.",
    prisonLife:
      "Inmates spend approximately 23 hours per day in solitary confinement in 7×12 foot concrete cells. Limited human interaction and strict security protocols define daily existence at ADX Florence.",
    visitingInfo:
      "Visits are extremely restricted and must be approved well in advance. All visits are non-contact and conducted through glass barriers. Background checks are required for all visitors.",
    notableInmates:
      "ADX Florence houses some of America's most dangerous criminals including Ted Kaczynski (the Unabomber), Dzhokhar Tsarnaev (Boston Marathon bomber), Joaquín 'El Chapo' Guzmán, and Robert Hanssen (FBI spy).",
    institutionalId: "legacy:adx-florence",
    dataProvenance: "manual",
  },
  {
    name: "Rikers Island",
    slug: "rikers-island",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "New York",
    regionSlug: "new-york",
    city: "New York City",
    securityLevel: "Multi",
    capacity: 10000,
    operator: "New York City Department of Correction",
    openedYear: 1932,
    latitude: 40.7931,
    longitude: -73.886,
    type: "Male / Female / Juvenile",
    overview:
      "Rikers Island is New York City's main jail complex, consisting of ten jail facilities on a 413-acre island in the East River. It is one of the largest correctional institutions in the world.",
    history:
      "Named after Abraham Rycken, the island has served as a jail complex since 1932. In 2019, the New York City Council voted to close the complex by 2026 and replace it with smaller, borough-based facilities.",
    prisonLife:
      "Rikers houses mainly pretrial detainees and those serving short sentences. The complex has faced significant criticism regarding violence, neglect, and conditions. Reform efforts have been ongoing.",
    visitingInfo:
      "Visitors can visit seven days a week. Walk-in visits are available but booking is recommended. Valid photo ID is required, and visitors must pass through metal detectors.",
    institutionalId: "legacy:rikers-island",
    dataProvenance: "manual",
  },
  {
    name: "Alcatraz Federal Penitentiary",
    slug: "alcatraz",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "California",
    regionSlug: "california",
    city: "San Francisco",
    securityLevel: "Maximum",
    capacity: 336,
    operator: "Federal Bureau of Prisons (Closed)",
    openedYear: 1934,
    latitude: 37.8267,
    longitude: -122.4233,
    type: "Historical / Museum",
    overview:
      "Alcatraz Federal Penitentiary, located on Alcatraz Island in San Francisco Bay, was a maximum-security federal prison from 1934 to 1963. Now a historic site, it remains one of the most iconic prisons in history.",
    history:
      "Originally a military fortification, Alcatraz became a federal penitentiary in 1934. It housed notorious criminals including Al Capone, Robert Stroud (the 'Birdman of Alcatraz'), and George 'Machine Gun' Kelly. It closed in 1963 due to high operating costs.",
    prisonLife:
      "During its operation, inmates followed a strict daily schedule. Cells measured 5×9 feet. Despite its reputation, the prison offered privileges including a library and recreational yard time for compliant inmates.",
    visitingInfo:
      "Alcatraz is now a National Historic Landmark operated by the National Park Service. It is open to visitors who can take ferry rides to the island and explore the former prison through guided and self-guided tours.",
    notableInmates:
      "Alcatraz housed some of the most famous criminals in American history including Al Capone, Robert Stroud (the 'Birdman of Alcatraz'), George 'Machine Gun' Kelly, Mickey Cohen, and Whitey Bulger.",
    institutionalId: "legacy:alcatraz",
    dataProvenance: "manual",
  },
  {
    name: "USP Leavenworth",
    slug: "usp-leavenworth",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "Kansas",
    regionSlug: "kansas",
    city: "Leavenworth",
    securityLevel: "Medium",
    capacity: 1170,
    operator: "Federal Bureau of Prisons",
    openedYear: 1903,
    latitude: 39.3112,
    longitude: -94.9203,
    type: "Male Adult",
    overview:
      "USP Leavenworth is a medium-security United States penitentiary in Leavenworth, Kansas. Known as the 'Big House' and 'Hot House', it was the largest maximum-security federal prison in the US for many years.",
    history:
      "Construction began in 1897 using inmate labor. The prison was completed in 1903 and designed to be a model institution. It was the first federal penitentiary and has housed many notable inmates throughout its history.",
    prisonLife:
      "The facility offers various programmes including UNICOR industries, education, and vocational training. The iconic domed building remains in use, though the prison has been reclassified to medium security.",
    visitingInfo:
      "Visits are held on weekends and federal holidays. Visitors must be on the approved visiting list. Photo identification is required and all visitors are subject to security screening.",
    institutionalId: "legacy:usp-leavenworth",
    dataProvenance: "manual",
  },
  {
    name: "Sing Sing Correctional Facility",
    slug: "sing-sing",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "New York",
    regionSlug: "new-york",
    city: "Ossining",
    securityLevel: "Maximum",
    capacity: 1700,
    operator: "New York State Department of Corrections",
    openedYear: 1826,
    latitude: 41.1545,
    longitude: -73.8685,
    type: "Male Adult",
    overview:
      "Sing Sing Correctional Facility is a maximum-security state prison in Ossining, New York. One of the most well-known prisons in the United States, the phrase 'sent up the river' originates from its location on the Hudson River.",
    history:
      "Built in 1826, Sing Sing is one of the oldest prisons in the United States. It was the site of hundreds of executions by electric chair. The prison's name comes from the Sintsink Native American tribe.",
    prisonLife:
      "The prison offers extensive rehabilitation programmes including college education through the Hudson Link programme, vocational training, and therapeutic community programmes.",
    visitingInfo:
      "Visits are scheduled on specific days. Visitors must be on the approved visitor list and present valid photo identification. Processing times can vary.",
    institutionalId: "legacy:sing-sing",
    dataProvenance: "manual",
  },
  {
    name: "Louisiana State Penitentiary",
    slug: "angola",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "Louisiana",
    regionSlug: "louisiana",
    city: "Angola",
    securityLevel: "Maximum",
    capacity: 6300,
    operator: "Louisiana Department of Public Safety",
    openedYear: 1901,
    latitude: 30.9559,
    longitude: -91.5571,
    type: "Male Adult",
    overview:
      "Louisiana State Penitentiary, commonly known as Angola, is the largest maximum-security prison in the United States. Situated on 18,000 acres of former plantation land, it is sometimes called 'The Farm'.",
    history:
      "The prison sits on land that was once the Angola Plantation, named after the homeland of enslaved people who worked there. It became a state prison in 1901. The facility has a complex and troubled history intertwined with the legacy of slavery.",
    prisonLife:
      "Angola operates its own radio station (KLSP) and hosts an annual rodeo open to the public. The prison has extensive agricultural operations and various educational and vocational programmes.",
    visitingInfo:
      "Visiting hours are on weekends. Visitors must be approved in advance. The remote location requires significant travel for most visitors. Photo ID and background checks are required.",
    institutionalId: "legacy:angola",
    dataProvenance: "manual",
  },
  {
    name: "FCI Terminal Island",
    slug: "fci-terminal-island",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "California",
    regionSlug: "california",
    city: "San Pedro",
    securityLevel: "Low",
    capacity: 1030,
    operator: "Federal Bureau of Prisons",
    openedYear: 1938,
    latitude: 33.7375,
    longitude: -118.2714,
    type: "Male Adult",
    overview:
      "FCI Terminal Island is a low-security federal correctional institution located in San Pedro, Los Angeles. It sits on Terminal Island in Los Angeles Harbor.",
    history:
      "The facility was established in 1938 and was originally used as a detention center. During World War II, it housed Japanese-American detainees. It has served various functions within the federal prison system over the decades.",
    prisonLife:
      "As a low-security facility, inmates have more freedom of movement. The prison offers various work assignments including UNICOR operations. Its coastal location provides a unique setting among federal prisons.",
    visitingInfo:
      "Visits are held on weekends and federal holidays. Visitors must be on the approved visiting list and present valid identification. The facility is accessible via public transportation.",
    institutionalId: "legacy:fci-terminal-island",
    dataProvenance: "manual",
  },
  {
    name: "Folsom State Prison",
    slug: "folsom-state-prison",
    country: "United States",
    countrySlug: "united-states",
    stateOrRegion: "California",
    regionSlug: "california",
    city: "Represa",
    securityLevel: "Medium",
    capacity: 2469,
    operator: "California Department of Corrections and Rehabilitation",
    openedYear: 1880,
    latitude: 38.6757,
    longitude: -121.1778,
    type: "Male Adult",
    overview:
      "Folsom State Prison is a state prison in Represa, California. Made famous by Johnny Cash's live album recorded there in 1968, it is the second-oldest prison in California.",
    history:
      "Opened in 1880, Folsom was the first prison in the world to have electricity. The granite-walled prison was built largely by inmate labor. Johnny Cash's legendary 1968 concert brought the prison international fame.",
    prisonLife:
      "Folsom offers various educational and vocational programmes. The prison has a museum open to the public and maintains historical artefacts from its long history.",
    visitingInfo:
      "Visits are conducted on weekends. Visitors must be on the approved visitor list and comply with the facility's dress code. Processing can take up to an hour on busy days.",
    institutionalId: "legacy:folsom-state-prison",
    dataProvenance: "manual",
  },
];
