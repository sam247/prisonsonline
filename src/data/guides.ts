import type { EditorialImage } from "@/types/media";

export interface Faq {
  question: string;
  answer: string;
}

export interface Guide {
  title: string;
  slug: string;
  excerpt: string;
  icon: string;
  content: string;
  faqs: Faq[];
  /** Optional thematic cover (editorial only). */
  coverImage?: EditorialImage;
}

export const guides: Guide[] = [
  {
    title: "How Prison Visits Work",
    slug: "how-prison-visits-work",
    excerpt: "A complete guide to visiting someone in prison, including booking, rules, and what to expect.",
    icon: "Users",
    content: "Visiting someone in prison can feel daunting, especially the first time. This guide explains the usual steps for social visits, with England and Wales covered first. Rules differ by prison and by country, so always check the establishment’s own instructions before you travel.\n\n## England and Wales: the short path\n\nFor most social visits in England and Wales you need to:\n\n- Be on the prisoner’s approved visitor list (the prisoner requests this; it can take up to about two weeks)\n- Book the visit in advance\n- Bring acceptable photo ID (and follow that prison’s dress and property rules)\n\nHTML:Book social visits for prisons in England and Wales through the official <a href=\"https://www.gov.uk/prison-visits\">GOV.UK prison visits service</a>. Scotland and Northern Ireland use different booking routes.\n\nFacility-specific visiting days and times belong on each prison’s profile and on its GOV.UK prison page. Use this guide for the process; use the directory for the particular establishment.\n\nHTML:Find the prison in the <a href=\"/prisons\">Prison Finder</a>, then open its profile for contact and local visiting information.\n\n## Getting on the Approved Visitor List\n\nBefore you can book, the prisoner usually has to add you to their visitor list. They submit your details (typically full name, date of birth, and address). A background check may follow. Start early—approval is not instant.\n\nIn England and Wales this is handled through the prison’s visitor-list process linked to the prisoner’s request. In the US, procedures vary by state Department of Corrections and by federal facility; most still require the prisoner to submit a visitor application.\n\n## Booking a Visit\n\nMost prisons require advance booking. In England and Wales, approved visitors commonly book online via GOV.UK, or sometimes by phone where the prison still offers that route. Popular slots, especially weekends, fill quickly.\n\nLegal visits, first reception visits, double sessions, and special family days often cannot be booked through the standard social-visits service—contact the prison for those.\n\nIn the US, booking is usually through the facility or the DOC/BOP process that applies there. Do not assume a UK booking method works for a US prison.\n\n## What to Wear and What to Bring\n\nDress codes and property rules are a common reason visits are refused at the gate. Plan modest clothing, closed-toe shoes, and minimal jewellery, and leave phones and other banned items out of the visits hall.\n\nHTML:See <a href=\"/guides/what-to-wear-to-a-prison-visit\">what to wear to a prison visit</a> and <a href=\"/guides/what-can-you-bring-to-prison\">what you can bring</a> for practical detail. Always re-check the prison’s own visitor leaflet.\n\nYou will need valid photo identification. England and Wales prisons publish lists of acceptable ID. Some sites also expect a second document. Bring only what the prison allows for vending (coins or a local payment card where used).\n\n## Arriving and Security Screening\n\nArrive early—often at least 30 minutes before the booked time. Late arrivals may be turned away. You will check in, prove identity against the booking, and may need to store belongings in a locker.\n\nScreening can include metal detectors, searches, and drug-detection measures. A positive indication from a drug dog may mean a closed (screened) visit or a cancelled visit, depending on local rules.\n\n## During the Visit\n\nMost social visits take place in a supervised visits hall. Physical contact is usually limited (often a brief embrace at the start and end). Session length varies by prison and by the prisoner’s regime status.\n\nPrisoners on enhanced status may receive longer or more frequent visits as a privilege. Closed visits (no physical contact, often through a partition) can apply after rule breaches or for security reasons.\n\n## Visiting with Children\n\nMany prisons offer child-friendly arrangements, play areas, or family days. Children normally attend with an approved adult. Prepare children for searches and the visits environment in an age-appropriate way.\n\n## US visits (high level)\n\nUS visitation is not one system. State DOCs and the Federal Bureau of Prisons each set their own approval, scheduling, dress, and ID rules. If your search is for a US facility, use that prison’s profile and the official DOC/BOP visitor pages rather than England and Wales booking advice.\n\nHTML:Start from the <a href=\"/prisons\">Prison Finder</a> to reach the right establishment page.",
    faqs: [
      { question: "How do I book a prison visit in England and Wales?", answer: "Be on the prisoner’s approved visitor list first, then book in advance—usually through the GOV.UK prison visits service, or by phone if that prison still offers telephone booking. Scotland and Northern Ireland use different processes. Always check the prison’s own page for local cut-off times." },
      { question: "How long does it take to get on a visitor list?", answer: "It varies by prison. In England and Wales, GOV.UK notes that being added to a prisoner’s visitor list can take up to about two weeks. Start the process early and do not assume you can book the same day you apply." },
      { question: "What ID do I need for a prison visit?", answer: "You need acceptable photo identification. England and Wales prisons follow published lists of accepted ID documents; some visits need documents from more than one list. Children under 16 are usually covered by different rules when accompanied. Check the prison’s visitor guidance before you travel." },
      { question: "Can children visit someone in prison?", answer: "Yes, children can usually visit when the prison’s rules allow it and an approved adult accompanies them. Many prisons have family sessions or play areas. Prepare children for security checks and the visits hall in an age-appropriate way." },
      { question: "What happens if I am late for a prison visit?", answer: "Many prisons will not admit late arrivals. Build in time for travel, parking, and screening. Arriving around 30 minutes early is a common recommendation, but follow the booking confirmation for that prison." },
      { question: "Can I bring food or gifts into a prison visit?", answer: "Usually you cannot hand property directly to a prisoner during a social visit. Some halls have vending machines for visitors. Property and parcels follow a separate process. See our guide on what you can bring, and confirm with the prison." },
      { question: "Where do I find visiting times for a specific prison?", answer: "Visiting days and times are local. Use the prison’s profile on this site and the official GOV.UK (or DOC/BOP) page for that establishment. This guide covers the booking process, not each prison’s timetable." },
    ]
  },
  {
    title: "What to Wear to a Prison Visit",
    slug: "what-to-wear-to-a-prison-visit",
    excerpt:
      "Practical guidance on dress codes, footwear, and accessories so you are not turned away at the gate before a visit.",
    icon: "Shirt",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for visitor guidance — not a photograph of a facility.",
    },
    content:
      "What you wear to a prison visit can decide whether you are admitted or turned away at the gate. Although wording differs between countries and individual sites, most visitor codes share the same goals: safety, dignity, and making it harder to conceal banned items. Plain, modest clothing, closed-toe shoes, and minimal jewellery are usually the safest baseline. Avoid slogans, colours, or accessories that staff in your region have flagged as problematic, and skip anything that could hide objects in linings or deep pockets. Some sites offer lockers; others simply refuse entry if your outfit breaches the rules. Always read the establishment’s published visitor pack or booking confirmation before you travel—this article is general orientation only, not a substitute for official instructions. If you need the right phone number or region first, start from our directory and work outward to the operator’s own pages.\n\n## Common expectations\n\nHats, hoods that obscure the face, and beach-style or overly revealing outfits are widely restricted. Staff may ask you to remove outer layers for search procedures, so plan layers you can manage discreetly.\n\n## Before you travel\n\nCheck footwear, belts, and metal fixtures if you know screening is strict. Leave unnecessary valuables at home.\n\nHTML:<a href=\"/prisons\">Prison Finder</a> lists facilities so you can reach official visitor guidance for the site you plan to attend.",
    faqs: [
      {
        question: "Are jeans acceptable for a prison visit?",
        answer:
          "Often yes, but cuts, rips, and very light colours can be refused at some sites. Choose plain, neat jeans without offensive prints and confirm the specific prison’s dress code.",
      },
      {
        question: "Can I wear jewellery?",
        answer:
          "Small wedding rings are often allowed; large chains, hoop earrings, and watches may need to be removed or left behind. Check the visitor rules for the facility you are attending.",
      },
    ],
  },
  {
    title: "What Can You Bring to a Prison Visit",
    slug: "what-can-you-bring-to-prison",
    excerpt:
      "What to bring to a prison visit in England and Wales: the accepted ID list, what goes in the locker, banned items, and food, gift and money rules.",
    icon: "Package",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for visitor belongings — not a photograph of a facility.",
    },
    content:
      "For a prison visit in England and Wales, bring accepted ID and very little else. Every visitor aged 16 or over must prove their identity before entry, and most other belongings — phones, bags, food, gifts, and usually cash — go in a locker or stay in the car. Exact rules are set by each prison, so check its visiting page before you travel. This guide is general orientation, not one prison’s rulebook.\n\nUnited States jails and prisons set their own visitor rules through the state DOC, county, or federal Bureau of Prisons. Do not treat England and Wales visit rules as a US rulebook.\n\nHTML:The national ID list is HMPPS’s <a href=\"https://www.gov.uk/government/publications/management-of-security-at-visits-policy-framework-closed-estate/acceptable-forms-of-identification-id-when-visiting-a-prison-in-england-and-wales-annex-a\">Acceptable forms of ID when visiting a prison (Annex A)</a>. GOV.UK’s <a href=\"https://www.gov.uk/staying-in-touch-with-someone-in-prison/banned-items\">banned items</a> page explains what you must never pass to a prisoner. Find the right establishment and its visiting page in the <a href=\"/prisons\">Prison Finder</a>.\n\n## What ID do I need for a prison visit?\n\nAll visitors, apart from children under 16 who are with an adult, must prove who they are. HMPPS accepts one document from its List A — for example a passport, a UK photocard driving licence, an EU or EEA identity card or driving licence, a PASS proof-of-age card with a unique reference number (including the Citizen ID card), an armed forces ID card, or a UK biometric residence permit. If you have none of those, you can usually combine one document from List B (such as an older person’s bus pass or Freedom Pass) with one from List C (such as a birth certificate, marriage certificate, signed tenancy agreement, or a bank card in your name). Without accepted ID you are likely to be turned away unless the prison agreed an exception in advance.\n\n## What you can usually take in\n\nYour ID, your booking confirmation if you were sent one, and a locker key or token. Many prisons let you take a small amount of money or a card for the visits-hall café or vending, but the amount and method are local. Essential medication should be in its original packaging, and it is safest to tell the prison before the visit. Baby items for a young child are often allowed in limited amounts — ask when you book.\n\n## What stays in the locker or car\n\nMobile phones, smartwatches, cameras and other electronic devices, bags, coats in some prisons, food and drink from outside, cigarettes and vapes, and anything you meant to give the prisoner. Lockers are common in visitors’ centres; some prisons ask you to leave pushchairs and car seats too. If you are unsure, assume an item will not be allowed into the hall.\n\n## Items that are banned or illegal to pass on\n\nGOV.UK says it is a criminal offence to send or give a prisoner illegal drugs, alcohol, weapons, a camera, or a mobile phone. You also must not pass anything that is indecent, written in code, or a threat to security. Visitors can expect searches: rub-down searches (including of children) and drug dogs are used at many prisons, and breaking the rules can end a visit or lead to a visiting ban.\n\n## Can you bring food or gifts?\n\nUsually not. Food and drink from outside are normally refused in the visits hall; where refreshments are available they are bought inside, often from a café run by the prison or a charity in the visitors’ centre. Gifts, clothes, and books for the prisoner do not go across the table — they go through the prison’s own property process, which differs between establishments. Money for a prisoner is sent online by debit card rather than handed over on a visit.\n\n## What to wear\n\nHTML:Prisons apply family-friendly dress codes and can turn you away for clothing they consider inappropriate. See <a href=\"/guides/what-to-wear-to-a-prison-visit\">what to wear to a prison visit</a>, and for booking steps and visit allowances see <a href=\"/guides/how-prison-visits-work\">how prison visits work</a>.\n\n## What can prisoners have in their cells?\n\nHTML:That is a separate question from visitor property. In-cell items depend on the prison’s local facilities list and the incentives level the prisoner is on. For daily routine and privileges, see <a href=\"/guides/life-inside-prison\">life inside prison</a> and <a href=\"/guides/rights-of-prisoners\">rights of prisoners</a>.\n\n## Help with visit costs\n\nHTML:If you get certain benefits or have an NHS health certificate, you may be able to get help with travel and other visit costs through GOV.UK’s <a href=\"https://www.gov.uk/help-with-prison-visits\">help with prison visits</a> scheme.\n\n## US visits (high level only)\n\nUS facilities publish their own ID, dress, and property rules, and some require visitors to be pre-approved. Check the facility’s official visiting page.\n\nHTML:Locate the facility via the <a href=\"/prisons\">Prison Finder</a> before relying on general advice.",
    faqs: [
      {
        question: "What ID do I need to visit someone in prison?",
        answer:
          "In England and Wales every visitor aged 16 or over needs accepted ID — one List A document such as a passport or UK photocard driving licence, or one List B plus one List C document from the HMPPS list. Children under 16 must be with an adult who meets the ID rules.",
      },
      {
        question: "Can I bring a bag into the visits hall?",
        answer:
          "Usually not. Most prisons ask you to leave bags in a locker or your car, allowing only essentials such as ID, a locker key, and any pre-agreed medication or baby items.",
      },
      {
        question: "Is cash allowed?",
        answer:
          "Some visits halls let you bring a small amount of money or a card for the café or vending; others do not. You cannot hand money to a prisoner — send it online by debit card instead.",
      },
      {
        question: "Can you bring food to a prison visit?",
        answer:
          "Food and drink from outside are normally not allowed. Many visits halls or visitors’ centres sell refreshments instead; check the prison’s visiting page.",
      },
      {
        question: "Can I give the prisoner a gift during the visit?",
        answer:
          "No. Passing items across the table is not allowed, and giving a prisoner drugs, alcohol, weapons, a camera, or a mobile phone is a criminal offence. Gifts and property go through the prison’s own property process.",
      },
      {
        question: "Can I take my phone into a prison visit?",
        answer:
          "No. Mobile phones and other electronic devices must be left in a locker or your car before you go through security.",
      },
    ],
  },
  {
    title: "Can You Get Haircuts in Prison?",
    slug: "can-you-get-haircuts-in-prison",
    excerpt:
      "Yes — people in prison can usually get haircuts. How barbers, booking, and frequency work in England and Wales (US systems differ).",
    icon: "FileText",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for prison grooming guidance - not a photograph of a facility.",
    },
    content:
      "Yes — people in prison can usually get haircuts. In England and Wales this is normally arranged through the prison’s own regime: a prisoner barber, a supervised workshop, or a scheduled wing session rather than a community salon. Exact booking, frequency, and payment rules are local, so treat this as general orientation and confirm with the establishment if you need a definitive answer for one person.\n\nUnited States prisons are not one system. State Departments of Corrections and federal Bureau of Prisons facilities each set their own grooming and barber rules. Do not mix England and Wales guidance with a US search result.\n\nHTML:If you need the establishment first, start with the <a href=\"/prisons\">Prison Finder</a>. For the wider reception journey, see <a href=\"/guides/what-happens-going-to-prison\">what happens when someone goes to prison</a>.\n\n## Are there barbers in prison?\n\nOften yes, but not always as a staffed high-street barbershop. Many prisons train and approve prisoners to cut hair under supervision. Others run limited sessions on a wing list. Some sites pause or slow the service during restricted regimes, staff shortages, or when tool control makes sessions impractical. “Barber” in custody usually means a controlled, supervised service — not free choice of stylist or appointment time.\n\n## How do prison haircuts work?\n\nHaircuts are usually part of day-to-day regime activity. Prisoners typically book through wing staff, unit orderlies, or a routine list rather than walking in. Waiting times vary widely between a busy local or reception prison and a training or open prison. Clippers, scissors, and other sharp tools are controlled items, so sessions can be delayed if staffing or security procedures change.\n\n## Do you have to cut your hair in prison?\n\nNo universal rule forces every prisoner to cut their hair on arrival or to a single length. Some people keep longer hair or a beard; others choose a short cut for practicality. Local rules can still limit styles, dyes, specialist products, or personal grooming kit kept in cells. Religious practice, cultural needs, and medical advice may affect how a request is handled, but those decisions still sit within local policy and security rules. Do not assume online anecdotes match the current rule at a named prison.\n\n## Frequency and payment\n\nThere is no single timetable that applies everywhere. Frequency depends on demand, staffing, lockdown conditions, and the prisoner’s location (for example first-night, segregation, or healthcare observation can change access). Basic haircuts may be provided through the regime in some prisons; others may take a small charge through prison accounts or canteen-style systems. Treat payment and how often someone can book as local facts to confirm, not as fixed national rules.\n\n## Related practical guides\n\nHaircuts sit alongside other everyday custody questions about appearance and property.\n\nHTML:See also <a href=\"/guides/can-you-have-piercings-in-prison\">piercings in prison</a>, <a href=\"/guides/can-you-wear-glasses-in-prison\">glasses in prison</a>, and the broader overview of <a href=\"/guides/life-inside-prison\">life inside prison</a>.\n\n## US grooming (high level only)\n\nIn the US, whether barbers are available, whether hair must be cut, and what styles are allowed depend on the facility and the DOC or BOP policy that applies there. Use the prison’s profile and official facility rules rather than England and Wales practice.\n\nHTML:Locate the facility via the <a href=\"/prisons\">Prison Finder</a> before relying on informal advice.\n\n## Asking on someone’s behalf\n\nIf you are a family member asking whether someone can get a haircut, the useful answer is almost always local. Staffing and regime change week to week. Use the prison’s published contact route rather than social media threads. This site’s Prison Finder helps you identify the right establishment; it does not publish a live barber timetable for each site.",
    faqs: [
      {
        question: "Are there barbers in prison?",
        answer:
          "Often yes, but usually as a supervised prisoner-barber or scheduled wing service rather than a community salon. Availability depends on the prison, staffing, and the current regime.",
      },
      {
        question: "Do you have to cut your hair in prison?",
        answer:
          "There is no single universal rule that everyone must cut their hair. Local style limits, religious practice, medical needs, and security rules can still affect what is allowed at a particular prison.",
      },
      {
        question: "Do prisoners have to pay for haircuts?",
        answer:
          "That depends on the prison system and local arrangement. Some prisons provide basic haircuts through the regime, while others may charge a small amount through prison accounts or canteen-style systems.",
      },
      {
        question: "Can prisoners choose any hairstyle they want?",
        answer:
          "Usually not. Style choices can be limited by local rules, available equipment, hygiene controls, and staff decisions about what is practical or acceptable in custody.",
      },
      {
        question: "Can prisoners keep their beard or shave their head?",
        answer:
          "Often yes, but local rules still apply. Religious practice, healthcare needs, and security considerations can all affect what is allowed and how grooming requests are handled.",
      },
      {
        question: "How often can a prisoner get a haircut?",
        answer:
          "There is no fixed universal timetable. Frequency varies by prison, staffing, lockdown conditions, and demand from other prisoners on the wing or unit.",
      },
    ],
  },
  {
    title: "Can You Have Piercings in Prison?",
    slug: "can-you-have-piercings-in-prison",
    excerpt:
      "General guidance on piercings in prison, jewellery restrictions, searches, healthcare issues, and why local rules matter.",
    icon: "FileText",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for prison jewellery guidance - not a photograph of a facility.",
    },
    content:
      "Sometimes yes, but whether a prisoner can keep or wear piercings depends on the prison, the security regime, healthcare concerns, and local rules about jewellery. A piercing itself is not always the issue; the practical question is often whether the jewellery is safe, removable, easy to search, or likely to create conflict, concealment, or injury risks. Some prisons allow simple retained piercings, while others may require jewellery to be removed, stored, or replaced with safer alternatives if healthcare agrees. This guide is general orientation only. Always treat the individual prison's own rules and staff instructions as the final word.\n\n## Why prisons care about piercings\n\nJewellery can raise security and safety issues in custody. Metal items can affect search procedures, be used in fights, create self-harm risks, or cause medical problems if they are not kept clean. In some settings, staff are mainly concerned with practical management rather than the piercing itself. That is why one prison may be more restrictive than another, especially during reception, segregation, healthcare observation, or transfer.\n\n## Existing piercings versus new piercings\n\nA prisoner who already has a piercing when they arrive may be treated differently from someone asking to get a new piercing in custody. Existing piercings may be reviewed as part of reception, healthcare checks, and property decisions. Getting a new piercing in prison is usually far less likely and may not be permitted at all unless there is a very unusual local arrangement.\n\n## What rules can affect\n\nRules may affect facial piercings, body jewellery, retainers, sleeping with jewellery in place, and whether an item has to be removed for searching, work, education, healthcare, or court appearances. Medical advice, faith practice, and individual risk factors can all matter, but prisons still balance those points against security and safety.\n\n## What to do if you need clarity\n\nIf you are asking for yourself or on behalf of someone in prison, do not assume that social media or old forum posts reflect the current rule. Check the prison's own contact guidance first. If the issue is linked to medical treatment, healing, or a healthcare need, the safest route is to ask the prison directly how those cases are handled rather than relying on general advice.\n\nHTML:Use the <a href=\"/prisons\">Prison Finder</a> to find the establishment first, then confirm the current visitor, property, or healthcare guidance with the prison directly.",
    faqs: [
      {
        question: "Can prisoners keep earrings or facial piercings?",
        answer:
          "Sometimes, but it depends on the prison's local safety and security rules. Some items may be allowed, while others may need to be removed or replaced with a safer option if staff or healthcare require it.",
      },
      {
        question: "Can someone get a new piercing while in prison?",
        answer:
          "Usually not. New piercings are far less likely to be permitted in custody because of hygiene, infection, supervision, and security concerns.",
      },
      {
        question: "What if removing a piercing is difficult or unsafe?",
        answer:
          "That should be raised with prison staff and healthcare. Medical advice may be needed if removal could cause injury, infection, or another health issue.",
      },
      {
        question: "Do prisons allow plastic retainers instead of metal jewellery?",
        answer:
          "Sometimes, but not everywhere. Some prisons may accept a safer alternative if healthcare or local policy supports it, while others may still restrict it.",
      },
    ],
  },
  {
    title: "What Happens When Someone Goes to Prison",
    slug: "what-happens-going-to-prison",
    excerpt: "England and Wales reception and first days: intake, first night, induction — and how US systems differ.",
    icon: "Building2",
    coverImage: {
      type: "editorial",
      src: "/images/guides/what-happens-going-to-prison.svg",
      alt: "Abstract illustration for reception into custody — not a photograph of a facility.",
    },
    content: "When someone goes to prison in England and Wales, the first days are usually spent in a local reception prison: identity and property are recorded, health and risk are screened, a prisoner number is issued, and induction begins. Exact steps vary by establishment and by whether the person is newly sentenced, on remand, or returning after recall. This guide is general orientation — not a substitute for the prison’s own instructions or official GOV.UK advice.\n\nUnited States intake is separate. State Departments of Corrections and the Federal Bureau of Prisons each run their own reception processes. Do not treat England and Wales reception practice as a US rulebook.\n\nHTML:Official high-level orientation is on GOV.UK’s <a href=\"https://www.gov.uk/life-in-prison\">Prison life: arriving at prison</a> page. HMPPS staff guidance on reception, first night, and induction is summarised in the <a href=\"https://www.gov.uk/government/publications/early-days-in-custody-psi-072015-pi-062015\">Early days in custody</a> prison service instruction. Find a specific establishment in the <a href=\"/prisons\">Prison Finder</a>.\n\n## From court to the prison gate\n\nAfter a custodial sentence (or when remanded in custody), people are usually taken by secure transport to a reception prison that serves the court area. The journey can take time if the van makes several stops. Which prison someone goes to often depends on gender, age, sentence or remand status, security considerations, and available spaces — not only on the court postcode.\n\nHTML:How long someone may stay, and what category they may move to later, links to <a href=\"/guides/how-prison-sentences-work\">how prison sentences work</a> and <a href=\"/guides/prison-categories-explained\">prison categories explained</a>.\n\n## Reception (intake)\n\nOn arrival, staff usually run a reception process. In general terms that often includes identity checks, searches, recording personal details and next of kin, cataloguing property for safekeeping, issuing a prisoner number, and an initial health and wellbeing screen. Photographing and other biometric steps are common in many systems, but exact methods are local — treat lists you read online as typical, not universal.\n\nPrison-issue clothing or bedding may be provided where needed. Whether someone can wear their own clothes later depends on the prison and their status; do not assume one national clothing rule.\n\nHTML:Day-to-day life after reception is covered in <a href=\"/guides/life-inside-prison\">life inside prison</a>, including routines such as <a href=\"/guides/can-you-get-haircuts-in-prison\">haircuts in prison</a>.\n\n## First night\n\nThe first night is often the hardest period. Many prisons use a first-night centre or similar arrangement so new arrivals can be monitored and given basic information. People should usually be able to make a phone call to let family or a legal adviser know where they are, and should receive essentials such as bedding and toiletries. Hot food and a shower are typically arranged where practical, including after a late arrival — local practice still decides the detail.\n\nAnxiety, withdrawal, and mental-health risk are taken seriously in early custody. Tell healthcare staff about medicines, substance use, and any fear of self-harm. Family members looking for location or contact routes should use official channels and this site’s directory rather than informal tip-offs.\n\n## Induction\n\nInduction explains prison rules, rights, healthcare access, complaints, visits, meals, work and education, and how to get help. In England and Wales, public guidance expects new prisoners to receive structured early information; local programmes may run over several days. Previous time in custody can change how much induction someone needs, but everyone should still understand the establishment they are in.\n\nSecurity categorisation and later moves to a longer-term prison can follow once assessments are complete. Remand and sentenced prisoners may experience different regimes even in the same building.\n\n## Contact with family in the first days\n\nLetters, phone calls, and visits are the main contact routes. Social visits usually need the prisoner to put visitors on an approved list and for visits to be booked in advance.\n\nHTML:See <a href=\"/guides/how-prison-visits-work\">how prison visits work</a> for England and Wales booking steps, and use the <a href=\"/prisons\">Prison Finder</a> for the right profile and contact details.\n\n## US intake (high level only)\n\nUS jail and prison intake differs by county, state DOC, and federal BOP facility. Booking, property, medical screening, and housing decisions follow that facility’s rules. Use the establishment’s official pages and profile on this site rather than England and Wales reception descriptions.\n\nHTML:Start from the <a href=\"/prisons\">Prison Finder</a> if you need the correct US or UK facility page.",
    faqs: [
      { question: "Where will someone go after being sentenced at court?", answer: "In England and Wales they are usually taken by secure transport to a local reception prison that serves the court area. The destination also depends on factors such as gender, age, status, security considerations, and space. Exact placement is an operational decision." },
      { question: "What happens during prison reception?", answer: "Reception usually covers identity and property recording, searches, a prisoner number, and initial health and risk screening. Photographing and similar steps are common, but the exact checklist is local. GOV.UK’s prison-life guidance summarises the official overview." },
      { question: "Can prisoners make phone calls on their first day?", answer: "New arrivals in England and Wales should usually be able to make a phone call to inform family or a legal adviser of their location. After that, phone access follows the prison’s normal regime and account arrangements." },
      { question: "What happens to a prisoner's belongings?", answer: "Personal belongings are usually catalogued and stored securely. Some items may later be allowed in possession under local property rules; others stay in storage until release or transfer. Prohibited items are not returned for in-possession use." },
      { question: "How long does the prison induction process take?", answer: "It varies by prison and by whether the person has been in custody before. Expect structured information over the first days rather than a single fixed national timetable. Ask wing staff if something important was missed." },
    ],
  },
  {
    title: "How Prison Sentences Work",
    slug: "how-prison-sentences-work",
    excerpt:
      "England and Wales sentence types — determinate, EDS, life/IPP — and why automatic release points depend on the rules that apply to that sentence.",
    icon: "Scale",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for sentencing guidance — not a photograph of a facility.",
    },
    content:
      "Prison sentences in England and Wales are not one simple “serve half” rule. Fixed (determinate) sentences, extended determinate sentences, and indeterminate sentences each work differently, and automatic release points for many standard determinate sentences have changed more than once. This guide is general orientation for families and the public — not legal advice, and not a personal release-date calculator.\n\nUnited States federal and state sentencing systems are separate. Do not mix England and Wales release rules with a US result.\n\nHTML:Official victim-facing explanation of current release-arrangement changes is on GOV.UK’s <a href=\"https://www.gov.uk/government/publications/a-guide-for-victims-about-the-changes-to-prison-release-arrangements/progression-model-changes-to-prison-release-arrangements\">Progression model: changes to prison release arrangements</a>. For offence-level sentencing guidance, see the <a href=\"https://www.sentencingcouncil.org.uk/\">Sentencing Council</a>. Find an establishment in the <a href=\"/prisons\">Prison Finder</a>.\n\n## Determinate sentences (including SDS)\n\nA determinate sentence has a fixed length set by the court. Part is served in custody; the rest is normally served in the community on licence, with conditions and a risk of recall if those conditions are broken.\n\nA standard determinate sentence (SDS) is the most common fixed sentence. How much of an SDS is served in custody before automatic release is set by legislation and can depend on the offence, when the sentence was imposed, and which release rules are in force. Recent years have seen temporary and then longer-term changes to those points (including measures often discussed as SDS40, and the Progression Model under the Sentencing Act 2026). Treat any “halfway” or “two-thirds” figure you read online as historical unless it matches the current official rule for that case.\n\nHTML:After release on licence, contact with probation and restrictions can feel as important as the time inside. For day-to-day custody before release, see <a href=\"/guides/life-inside-prison\">life inside prison</a>. Reception and the first days are covered in <a href=\"/guides/what-happens-going-to-prison\">what happens when someone goes to prison</a>.\n\n## Extended determinate sentences (EDS)\n\nExtended determinate sentences are used for certain serious violent or sexual offences where the court decides an extended period of supervision is needed after custody. They combine a custodial term with an extended licence. Release from the custodial term is not the same as SDS automatic release: parole consideration and the length of the custodial term matter. EDS cases are among the sentence types GOV.UK lists as outside the Progression Model’s SDS release changes.\n\n## Indeterminate sentences and life\n\nLife sentences and other indeterminate sentences have no fixed “end date” in the way an SDS does. The court sets a minimum tariff that must be served before the Parole Board can consider release. If released, people on life licence can be recalled for the rest of their life if risk cannot be managed in the community.\n\nImprisonment for Public Protection (IPP) was abolished for new sentences in 2012, but people already serving IPP remain under that indeterminate framework until the Parole Board is satisfied they can be safely released. Exact numbers in custody change over time — use official MoJ statistics rather than informal totals.\n\n## Licence, recall, HDC, and ROTL\n\nLicence conditions can include where someone must live, who they must not contact, reporting to probation, and other restrictions. Breach can lead to recall to custody. Home Detention Curfew (electronic tagging before the automatic release point) and Release on Temporary Licence (ROTL) are separate schemes with their own eligibility rules; neither applies to every prisoner or every offence.\n\n## Remand and categorisation\n\nTime spent in custody on remand before sentence is normally credited against the sentence. Security category (and later moves between prisons) is a separate process from the sentence type itself.\n\nHTML:See <a href=\"/guides/prison-categories-explained\">prison categories explained</a> for Category A–D definitions, and use the <a href=\"/prisons\">Prison Finder</a> for a named establishment.\n\n## US sentencing (high level only)\n\nUS jail, state DOC, and federal BOP sentences follow different statutes, guidelines, and good-time rules. Use the facility’s official pages and this site’s profiles rather than England and Wales release percentages.\n\nHTML:Start from the <a href=\"/prisons\">Prison Finder</a> if you need the correct US or UK facility page.",
    faqs: [
      {
        question: "How much of a prison sentence do you actually serve?",
        answer:
          "For many England and Wales determinate sentences, part of the term is served in custody and the rest on licence — but the custody share is set by the release rules that apply to that sentence and offence. It is not safe to assume a universal halfway point. Check official GOV.UK guidance for the current arrangements.",
      },
      {
        question: "What is a standard determinate sentence (SDS)?",
        answer:
          "An SDS is a fixed-length prison sentence with a definite end date. Time is split between custody and supervision on licence. Automatic release points for SDS have been changed by legislation; EDS, life, IPP, and some other sentence types follow different rules.",
      },
      {
        question: "What is an extended determinate sentence (EDS)?",
        answer:
          "An EDS combines a custodial term with an extended licence for certain serious offences where longer post-release supervision is needed. Release from the custodial term is not the same as ordinary SDS automatic release.",
      },
      {
        question: "What is a life sentence?",
        answer:
          "A life sentence keeps the person subject to the sentence for life. They must serve a minimum tariff before the Parole Board can consider release. If released, they remain on licence and can be recalled.",
      },
      {
        question: "What happens if someone breaches their licence conditions?",
        answer:
          "Probation can recall them to prison. After recall, re-release depends on the sentence type and the relevant review process (often involving the Parole Board for more serious or indeterminate cases).",
      },
      {
        question: "Does time on remand count towards the sentence?",
        answer:
          "Yes. Time spent in custody before sentencing is normally credited against the sentence. Prisons calculate that credit as part of sentence administration.",
      },
    ],
  },
  {
    title: "Life Inside Prison",
    slug: "life-inside-prison",
    excerpt:
      "What people in England and Wales prisons typically do all day — regime, work, education, meals, and association — and how US systems differ.",
    icon: "Clock",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for daily life in custody — not a photograph of a facility.",
    },
    content:
      "Daily life in prison is built around a local regime: unlock, meals, work or education, exercise or association, and lock-up. Exact times and how much of the day is spent out of cell vary by prison, security category, staffing, and whether the site is a busy local reception prison or a training or open prison. This guide is England and Wales orientation for “what do prisoners do all day” questions — not a timetable for one named establishment.\n\nUnited States jail and prison daily life follows state DOC or federal BOP rules. Do not treat England and Wales regimes as a US rulebook.\n\nHTML:GOV.UK’s <a href=\"https://www.gov.uk/life-in-prison\">Prison life</a> overview covers arrival, categories, and related topics. Education and work are summarised on <a href=\"https://www.gov.uk/life-in-prison/education-and-work-in-prison\">Education and work in prison</a>. Find a specific site in the <a href=\"/prisons\">Prison Finder</a>.\n\n## A typical weekday shape\n\nMany closed prisons start the day with unlock in the morning, a roll check, and breakfast, then move people to work, education, healthcare, or other appointments. Midday usually brings a meal and another movement period. Afternoons often repeat the same pattern. Evenings may include association — time to use phones, shower, exercise, or socialise on the wing — before final lock-up. Weekends and bank holidays often have fewer workshops and more wing-based time. Treat clock times you see online as examples; ask for the local wing timetable during induction.\n\nHTML:The first days after arrival are covered in <a href=\"/guides/what-happens-going-to-prison\">what happens when someone goes to prison</a>. Security category shapes which prisons someone can move to — see <a href=\"/guides/prison-categories-explained\">prison categories explained</a>.\n\n## Work and education\n\nMost sentenced prisoners are expected to do purposeful activity when places exist: kitchen or servery work, cleaning, laundry, workshops, gardens, or orderly roles, alongside literacy, numeracy, vocational training, or distance learning. Availability depends on the prison, sentence plan, risk, and waiting lists. Pay for prison work is low compared with community wages; published figures change, so do not rely on an old average as a current rate.\n\nHTML:Practical day-to-day topics such as <a href=\"/guides/can-you-get-haircuts-in-prison\">haircuts in prison</a> sit inside the same regime.\n\n## Food, healthcare, and money\n\nPrisons provide meals and should offer routes for dietary and faith needs. Many sites use a pre-order menu and a prison shop (canteen) for extras bought from the prisoner’s account. Healthcare — GP, mental health, dental, substance-misuse support — is meant to be available, though waiting times can be longer than in the community. In England, prison healthcare is commissioned through NHS arrangements; local delivery still varies.\n\n## Contact with family\n\nLetters, phone calls, and social visits are the main contact routes. Calls are usually from wing phones on a prisoner account and are monitored except for privileged legal calls. Visit booking and dress or property rules are separate processes.\n\nHTML:See <a href=\"/guides/how-prison-visits-work\">how prison visits work</a>, <a href=\"/guides/what-to-wear-to-a-prison-visit\">what to wear to a prison visit</a>, and <a href=\"/guides/what-can-you-bring-to-prison\">what you can bring on a visit</a>.\n\n## Privileges and behaviour\n\nIn England and Wales, incentives schemes affect access to things such as extra visits, private cash, or in-cell items. Levels and labels can change with national policy; the practical point for families is that behaviour and regime compliance influence day-to-day privileges, not only the sentence length.\n\nHTML:How long someone may stay, and what licence means later, links to <a href=\"/guides/how-prison-sentences-work\">how prison sentences work</a>.\n\n## US daily life (high level only)\n\nUS facilities set their own schedules, work assignments, commissary rules, and recreation. Use the establishment’s official pages and this site’s profile rather than England and Wales regime descriptions.\n\nHTML:Locate the facility via the <a href=\"/prisons\">Prison Finder</a> before relying on informal advice.",
    faqs: [
      {
        question: "What do prisoners do all day?",
        answer:
          "In England and Wales, a typical day is built around the local regime: unlock, meals, work or education where available, exercise or association, and lock-up. Exact times and how much of the day is spent out of cell vary by prison and circumstances.",
      },
      {
        question: "What time do prisoners wake up?",
        answer:
          "Many closed prisons unlock in the morning for breakfast and movement to activities, but there is no single national clock time. Open prisons and weekends often run a different pattern. The wing timetable given at induction is the reliable source.",
      },
      {
        question: "Do prisoners get paid for work?",
        answer:
          "Prison work is usually paid, but rates are low compared with community wages and differ by job and prison. Published averages go out of date — treat pay as local and limited.",
      },
      {
        question: "Can prisoners use the internet?",
        answer:
          "Direct open internet access is generally not available. Some prisons offer controlled access for education or approved digital messaging. Ordinary social media use from a wing phone or personal device should not be assumed.",
      },
      {
        question: "What happens if a prisoner refuses to work?",
        answer:
          "Refusing allocated activity can lead to disciplinary action and loss of privileges under the prison’s incentives rules. Exact outcomes depend on the establishment and the person’s circumstances.",
      },
    ],
  },
  {
    title: "Prison Categories Explained",
    slug: "prison-categories-explained",
    excerpt: "Understanding the different security categories and what they mean for prisoners.",
    icon: "Shield",
    coverImage: {
      type: "editorial",
      src: "/images/guides/prison-categories-explained.svg",
      alt: "Abstract illustration for prison categories — not a photograph of a facility.",
    },
    content: "Prisons are categorised by security level to match the risk posed by different prisoners. Understanding these categories helps explain why prisoners are held where they are.\n\n## UK Prison Categories\n\nIn England and Wales, adult male prisoners are assigned a security category so they are held in the lowest suitable conditions that still manage the risks they present. HMPPS sets this out in its security categorisation policy framework: categorisation looks at escape risk, the harm that could follow an escape, and control issues inside custody.\n\nMale prisons are organised into four categories:\n\n- **Category A**: Highest security for prisoners whose escape would be highly dangerous to the public, the police, or national security. Establishments in this band include HMP Belmarsh, HMP Wakefield, and HMP Manchester (Strangeways). Within Category A, prisoners may be further classed as Standard, High, or Exceptional risk.\n\n- **Category B**: High security for prisoners who do not need Category A conditions, but for whom escape must still be made very difficult. Category B sites include local prisons that receive people from court and training prisons. Examples include HMP Pentonville and HMP Wandsworth.\n\n- **Category C**: Closed training and resettlement prisons for prisoners who cannot be trusted in open conditions but are not assessed as making a determined escape attempt. These prisons usually focus on education, work, and rehabilitation. Most sentenced adult men in England and Wales are held at Category C.\n\n- **Category D**: Open prisons for prisoners who present a low risk and can reasonably be trusted in open conditions. Physical security is limited, and eligible prisoners may leave the establishment on licence for work, education, or other resettlement activity. Examples include HMP North Sea Camp and HMP Sudbury.\n\nHTML:<a href=\"/prisons/uk/category/category-a\">Browse Category A prisons</a> · <a href=\"/prisons/uk/category/category-b\">Category B prisons</a> · <a href=\"/prisons/uk/category/category-c\">Category C prisons</a> · <a href=\"/prisons/uk/category/category-d\">Category D (open) prisons</a>. Lists of establishments live in the directory hubs; this guide explains the definitions only.\n\n## How Categorisation Works\n\nNew prisoners are assessed and categorised during reception and early sentence planning. Reviews continue during the sentence. As risk falls, prisoners may move to lower-security conditions; if risk rises, they can be moved the other way. Official HMPPS guidance on security categorisation is the authoritative source for how staff apply the rules.\n\nHTML:Read the current <a href=\"https://www.gov.uk/government/publications/security-categorisation-policy-framework\">HMPPS security categorisation policy framework on GOV.UK</a> for the formal process. For a plain-language overview of Categories A–D, see the <a href=\"https://prisonjobs.blog.gov.uk/your-a-d-guide-on-prison-categories/\">HMPPS prison jobs explainer</a>.\n\n## Women's Prisons\n\nWomen's prisons in England and Wales are not formally categorised with the male Category A–D labels. They are generally described as closed or open. Restricted Status is used where a woman's escape would present a serious risk and designated secure accommodation is required. Most women's prisons operate at a level roughly comparable to closed conditions for men.\n\n## US Federal Security Levels\n\n- **Minimum**: Camp-style facilities with limited or no fencing. Inmates are typically non-violent offenders serving shorter sentences. Work assignments often involve community service.\n\n- **Low**: Double-fenced perimeters with dormitory housing. Greater staff supervision than minimum facilities.\n\n- **Medium**: Strengthened perimeters with cell-type housing. Internal security measures are more rigorous.\n\n- **High**: Highly secure with reinforced fencing and close staff supervision. Movement is highly controlled. USP Leavenworth is an example.\n\n- **Administrative/Supermax**: The most restrictive, including ADX Florence. These facilities house inmates who pose the greatest threat to safety and security.\n\n## State Prison Systems\n\nEach US state operates its own classification system, which may use different terminology. Most states use some variation of Minimum, Medium, Maximum, and Supermax designations, but the specific criteria for each level vary.",
    faqs: [
      { question: "What is a Category A prison?", answer: "Category A is the highest security classification for adult men in England and Wales. These prisons hold people whose escape would be highly dangerous to the public, police, or national security. Examples include HMP Belmarsh and HMP Wakefield. Official HMPPS categorisation guidance is on GOV.UK." },
      { question: "What is the difference between Category B and Category C?", answer: "Category B is used where escape must still be made very difficult, including many local and training prisons. Category C is closed custody for prisoners who are not suitable for open conditions but are not assessed as making a determined escape attempt. For current lists of establishments in each band, use the Category B and Category C directory hubs on this site." },
      { question: "What is a Category D prison?", answer: "Category D means open conditions in England and Wales. Prisoners placed there present a low risk and can reasonably be trusted with much lower physical security, including temporary release for resettlement activity when eligible. See the Category D directory hub for the current list of open prisons." },
      { question: "Can prisoners move to lower security categories?", answer: "Yes. Security category is reviewed during the sentence. Good behaviour, completed programmes, and lower assessed risk can support progression to less secure conditions; rising risk can lead to a higher category. Decisions follow HMPPS categorisation policy, not a fixed timetable alone." },
      { question: "How are women's prisons categorised in England and Wales?", answer: "Women's prisons are not labelled Category A–D in the same way as the male estate. They are generally closed or open, with Restricted Status used where escape would present a serious risk. Most women's prisons operate as closed conditions roughly comparable to mid-range male closed custody." },
      { question: "What is the difference between a supermax and maximum security prison?", answer: "In the US federal system, administrative maximum / supermax facilities such as ADX Florence are the most restrictive, with very tight controls on movement and contact. High or maximum security prisons are still highly secure but usually allow more structured regime activity than a supermax." },
    ]
  },
  {
    title: "Rights of Prisoners",
    slug: "rights-of-prisoners",
    excerpt:
      "What rights prisoners keep in England and Wales — human rights, healthcare, legal contact, voting rules — what they lose, and how to complain.",
    icon: "FileText",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for legal rights in custody — not a photograph of a facility.",
    },
    content:
      "People in prison lose their liberty, but they do not lose every right. In England and Wales, prisoners keep core legal protections — including protection from inhuman treatment, access to healthcare, contact with a lawyer, and routes to complain — while some rights, such as voting in most elections, are restricted by law. This guide is general orientation for families and the public, not legal advice.\n\nUnited States prisoner rights follow the US Constitution, federal law, and state rules. Do not treat England and Wales rights as a US rulebook.\n\nHTML:GOV.UK summarises the basics on <a href=\"https://www.gov.uk/life-in-prison/prisoner-privileges-and-rights\">Prisoner privileges and rights</a>. Day-to-day rules come from the <a href=\"https://www.legislation.gov.uk/uksi/1999/728/contents/made\">Prison Rules 1999</a> and HMPPS policy. Find a specific establishment in the <a href=\"/prisons\">Prison Finder</a>.\n\n## What rights do prisoners keep?\n\nThe starting principle is that imprisonment takes away liberty, not humanity. Rights that are not necessarily removed by being in custody continue, although prisons can limit how they are exercised for security, safety, and good order. GOV.UK lists protection from bullying and racial harassment, being able to contact a solicitor, and healthcare (including support for mental health) among prisoners’ rights, and says prisoners should be able to spend between 30 minutes and an hour outside in the open air each day.\n\n## Human rights in prison\n\nThe Human Rights Act 1998 applies to prisons in the UK, so European Convention on Human Rights protections reach people in custody. In practice the most relevant are the right to life (Article 2), which requires authorities to take reasonable steps to protect prisoners, including from self-harm; the ban on torture and inhuman or degrading treatment (Article 3), which sets minimum standards for conditions; the right to respect for private and family life and correspondence (Article 8); and freedom of religion (Article 9). Courts weigh many of these rights against legitimate prison needs, so “a right” in custody is often a protection against unjustified restriction rather than an unlimited entitlement.\n\nHTML:Internationally, the United Nations <a href=\"https://www.unodc.org/unodc/en/justice-and-prison-reform/nelsonmandelarules.html\">Nelson Mandela Rules</a> set out minimum standards for the treatment of prisoners. They are guidance rather than directly enforceable UK law.\n\n## What rights do prisoners lose?\n\nLiberty is the obvious loss. Freedom of movement, free choice of association, and private possessions are limited by prison rules. Contact is controlled: letters can be checked, most phone calls can be listened to and recorded, and visitors must be on an approved list. Breaking prison rules can lead to punishments — GOV.UK says these can include being kept in cell for up to 21 days, up to 42 extra days added to the sentence, or loss of privileges.\n\n## Can prisoners vote?\n\nHTML:Under <a href=\"https://www.legislation.gov.uk/ukpga/1983/2/section/3\">section 3 of the Representation of the People Act 1983</a>, a convicted person detained in prison under their sentence cannot vote in UK parliamentary or local government elections. People held on remand who have not been convicted are not covered by that ban. Scotland has made an exception for local elections where the sentence is 12 months or less, so rules can differ by election and nation.\n\nThe European Court of Human Rights ruled in Hirst v United Kingdom (No. 2) that a blanket ban breached the Convention; the UK’s response was a limited change rather than general prisoner voting. In the US, voting rules for people in prison and after release vary by state.\n\n## Legal advice and confidential correspondence\n\nPrisoners can contact and be visited by legal advisers, and can challenge decisions through the courts, including by judicial review. Prisons cannot open letters from solicitors and courts except in special cases — for example if staff suspect a letter is not really from a legal adviser. Calls to a legal adviser are among the calls that are not monitored.\n\n## Family contact\n\nContact with family is protected but controlled. Letters, prison phone calls, video calls in some prisons, and social visits are the main routes. GOV.UK says a convicted prisoner is usually allowed at least two 1-hour visits every 4 weeks, and a prisoner on remand three 1-hour visits a week; incentives schemes can add more, and visits can be restricted for security reasons.\n\nHTML:For booking steps, see <a href=\"/guides/how-prison-visits-work\">how prison visits work</a> and <a href=\"/guides/what-can-you-bring-to-prison\">what you can bring on a visit</a>. Daily routine and privileges are covered in <a href=\"/guides/life-inside-prison\">life inside prison</a>.\n\n## Healthcare\n\nGOV.UK says prisoners are entitled to the same standard of healthcare and treatment as anyone outside prison. Treatment is free but must be approved by the prison’s healthcare team, and serious cases can be referred to an outside hospital. In England prison healthcare is commissioned through the NHS; in Wales it is the responsibility of local health boards. Waiting times and local services still vary.\n\n## Religion, education, and work\n\nPrisoners can practise their faith, with access to chaplaincy, religious texts, and faith-based diets where practicable. Most prisoners get an individual learning plan and can access courses from basic skills to distance learning, and many are expected to work. Places and pay depend on the prison.\n\n## Complaints and independent oversight\n\nA prisoner who thinks their rights have not been respected should normally use the prison’s internal complaints system first. If that does not resolve it, many complaints can go to the independent Prisons and Probation Ombudsman. Each prison also has an Independent Monitoring Board of unpaid volunteers, and HM Inspectorate of Prisons inspects and publishes reports on conditions.\n\nHTML:Official routes: the <a href=\"https://www.ppo.gov.uk/\">Prisons and Probation Ombudsman</a>, <a href=\"https://imb.org.uk/\">Independent Monitoring Boards</a>, and <a href=\"https://www.justiceinspectorates.gov.uk/hmiprisons/\">HM Inspectorate of Prisons</a>. If you are worried about someone’s safety now, tell staff or contact the prison’s Safer Custody team — find the right establishment first in the <a href=\"/prisons\">Prison Finder</a>.\n\n## Sentences and categories\n\nHTML:What rights look like day to day can change with security category and sentence stage. See <a href=\"/guides/prison-categories-explained\">prison categories explained</a> and <a href=\"/guides/how-prison-sentences-work\">how prison sentences work</a>.\n\n## US prisoner rights (high level only)\n\nIn the US, prisoner rights come mainly from the Constitution (for example the Eighth Amendment ban on cruel and unusual punishment), federal statutes, and state DOC or federal Bureau of Prisons policy. Grievance procedures and voting rules differ by system and state.\n\nHTML:Locate the facility via the <a href=\"/prisons\">Prison Finder</a> before relying on general advice.",
    faqs: [
      {
        question: "What rights do prisoners have in the UK?",
        answer:
          "Prisoners keep core protections including safety from inhuman or degrading treatment, healthcare to the same standard as outside, contact with a solicitor, family contact through controlled routes, religious practice, and the right to complain. GOV.UK also says prisoners should normally get between 30 minutes and an hour outside in the open air each day.",
      },
      {
        question: "What rights do prisoners lose?",
        answer:
          "Liberty and free movement, plus restrictions on contact, possessions, and association set by prison rules. Convicted prisoners serving their sentence also lose the right to vote in UK parliamentary and most local elections.",
      },
      {
        question: "Can prisoners vote in the UK?",
        answer:
          "Convicted prisoners detained under their sentence cannot vote in UK parliamentary or local government elections (Representation of the People Act 1983, section 3). Unconvicted remand prisoners are not covered by that ban, and Scotland allows some short-sentence prisoners to vote in local elections. In the US, rules vary by state.",
      },
      {
        question: "Does the Human Rights Act apply to prisoners?",
        answer:
          "Yes. The Human Rights Act 1998 applies in prisons, so Convention rights such as the right to life, the ban on inhuman or degrading treatment, and respect for private and family life apply — though many can be lawfully limited for security and good order.",
      },
      {
        question: "Are prisoners entitled to healthcare?",
        answer:
          "Yes. GOV.UK says prisoners are entitled to the same standard of healthcare and treatment as anyone outside prison. In England it is commissioned through the NHS and in Wales by local health boards; treatment is approved by the prison healthcare team.",
      },
      {
        question: "How do prisoners complain if their rights are breached?",
        answer:
          "Use the prison’s internal complaints system first. Many unresolved complaints can then go to the independent Prisons and Probation Ombudsman. Independent Monitoring Boards and HM Inspectorate of Prisons provide further oversight.",
      },
    ],
  },
  {
    title: "Can You Send Pictures in Prison Letters?",
    slug: "can-you-send-pictures-in-prison-letters",
    excerpt:
      "General guidance on sending photographs in prison mail, common restrictions, and why every prison's mailroom rules should be checked first.",
    icon: "Package",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for prison mail guidance - not a photograph of a facility.",
    },
    content:
      "Sometimes yes, but whether you can send pictures in prison letters depends on the prison, the mail provider, and the rules that apply to the person receiving them. Some prisons allow printed photographs in ordinary post; others restrict the number, size, paper type, or subject matter. Certain establishments prefer approved digital messaging systems instead of loose photographs in envelopes. Because mail is searched and rules change, the safest assumption is that pictures may be allowed only under specific conditions rather than automatically. This guide gives general orientation only and does not replace the prison's own mail policy.\n\n## Why prisons restrict pictures\n\nPhotographs can raise security, safeguarding, and decency issues. A prison may refuse images if they contain nudity, coded content, gang references, hidden layers, inappropriate messages, or anything staff believe could disrupt order or place someone at risk. Rules may also limit laminated prints, Polaroids, or thick photo paper if those formats are harder to search or store safely.\n\n## Common limits to expect\n\nEven where photos are allowed, prisons often limit how many can be sent at one time and how large they can be. Some sites require standard printed photos only. Others route all mail through a scanning service, which means the prisoner receives a scanned copy rather than the original print. If the prison uses digital messaging or a photo-upload provider, staff may direct families to that service instead of ordinary post.\n\n## Check the prison's mail route first\n\nThe most important step is to confirm the prisoner's correct postal or digital mail route before you send anything. Mail rules can differ by prison, by security category, and sometimes by the prisoner's status or location within the prison. If you send items to the wrong address or in the wrong format, the pictures may be rejected, delayed, or destroyed under local policy.\n\n## A safer way to approach it\n\nIf you want to send family pictures, children's drawings, or sentimental images, start by checking the prison's official contact guidance and mail rules. Look for information about photo limits, banned content, digital messaging providers, and whether original prints are returned. If nothing is published, contact the prison before posting. That is safer than relying on old forum advice or another prison's rules.\n\nHTML:Find the prison first through the <a href=\"/prisons\">Prison Finder</a>, then check the establishment's official mail or contact instructions before sending photographs.",
    faqs: [
      {
        question: "Can I send printed photographs to someone in prison?",
        answer:
          "Often yes, but only if the prison allows them and the photos meet local rules on size, quantity, content, and paper type. Always check the prison's own guidance first.",
      },
      {
        question: "Are Polaroids or instant photos allowed?",
        answer:
          "Often no, or only rarely. Some prisons restrict Polaroids and thicker photo materials because they are harder to search and may not fit the prison's mailroom rules.",
      },
      {
        question: "Will the prisoner receive the original photo?",
        answer:
          "Not always. Some prison mail systems scan incoming post and provide a copied or digital version instead of the original print.",
      },
      {
        question: "Can a prison reject family pictures?",
        answer:
          "Yes. A prison can reject photographs that breach decency, safety, gang-related, or mailroom-format rules, even when the sender did not intend any problem.",
      },
    ],
  },
  {
    title: "Can You Wear Glasses in Prison?",
    slug: "can-you-wear-glasses-in-prison",
    excerpt:
      "General guidance on prescription glasses in prison, property rules, replacement issues, and why healthcare and local prison routines matter.",
    icon: "FileText",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for prison eyewear guidance - not a photograph of a facility.",
    },
    content:
      "Yes, prisoners can usually wear glasses in prison if they need them, especially where the glasses are prescription eyewear. In practice, though, access, replacement, repairs, and the type of frames allowed can depend on the prison's healthcare arrangements, property checks, and local safety rules. A prisoner may arrive with their own glasses, be issued with replacements later, or need healthcare assessment if their prescription is unclear or the glasses are damaged. This guide is general orientation only and does not replace the prison's own property or healthcare rules.\n\n## Why glasses matter in custody\n\nEyewear is often a basic healthcare and daily-living issue, not just a personal preference. Prisoners may need glasses to read legal papers, attend education, move safely around the prison, or manage a medical condition. That is why prisons will often treat prescription glasses differently from purely cosmetic items. Even so, staff may still inspect frames, lenses, cases, and accessories under normal property and security rules.\n\n## Bringing glasses into prison\n\nIf someone arrives in custody already wearing prescription glasses, those glasses will usually be considered during reception and property checks. Staff may record them, inspect them, or ask healthcare to review the prisoner's needs if the glasses are damaged or there is doubt about whether they are necessary. Sunglasses, designer extras, or unusual accessories may be treated differently from ordinary prescription eyewear.\n\n## Replacement and repair issues\n\nOne of the main practical problems is not whether glasses are allowed, but how quickly they can be repaired or replaced. If glasses break, the prisoner may need to go through healthcare, prison administration, or an approved supplier arrangement. Timescales can vary. Some prisons may also restrict what family members can send in directly, so it is safer to check the prison's property rules before posting replacement eyewear.\n\n## What rules can vary\n\nLocal practice can affect frame types, tinted lenses, spare pairs, storage, and whether accessories like hard cases are allowed in possession. Security category, healthcare needs, and behaviour management can also affect how items are handled. If the prisoner has an urgent sight problem, that should be raised as a healthcare issue rather than treated as a routine property question.\n\nHTML:Find the establishment through the <a href=\"/prisons\">Prison Finder</a> first, then confirm eyewear, property, or healthcare instructions with the prison directly.",
    faqs: [
      {
        question: "Can prisoners keep prescription glasses?",
        answer:
          "Usually yes. Prescription glasses are commonly treated as a healthcare need, although the prison may still inspect them and apply local property rules.",
      },
      {
        question: "Can family send replacement glasses into prison?",
        answer:
          "Sometimes, but not always directly. Many prisons have specific property and healthcare rules, so it is best to check before sending replacement eyewear.",
      },
      {
        question: "Are sunglasses allowed in prison?",
        answer:
          "Often not as freely as ordinary prescription glasses. Tinted or non-essential eyewear may be restricted unless there is a medical reason and the prison accepts it.",
      },
      {
        question: "What happens if a prisoner's glasses break?",
        answer:
          "The prisoner may need to report it through healthcare or prison staff so repair or replacement arrangements can be made. Timing varies by prison and supplier process.",
      },
    ],
  },

  {
    title: "How to Find a UK Prison Address",
    slug: "how-to-find-a-uk-prison-address",
    excerpt:
      "Find a UK prison’s postal address, postcode and switchboard number, then open that establishment’s contact-details page instead of relying on forum posts.",
    icon: "MapPin",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for finding a UK prison address — not a photograph of a facility.",
    },
    content:
      "People looking up a UK prison address usually need a postal address, postcode, or switchboard number so they can write a letter, confirm they have the right establishment, or start a visit booking. Searches such as “HMP Wandsworth address” are best answered on that prison’s own contact-details page. This guide shows how to reach those pages from the directory, how to browse by security category when you do not yet have the name, and when to double-check the details on GOV.UK. It is general orientation only: it does not replace official HMPPS or GOV.UK records, and it does not list every prison’s address here.\n\n## If you already know the prison name\n\nOpen the prison’s profile in the UK directory, then use the contact-details page for that site. That is the page on this website meant to hold the postal address, postcode, and telephone number for one establishment. Profile pages describe the prison; contact-details pages own the address and phone lookup. If a search engine offered a directory listing instead of an address, follow through to the contact-details URL rather than copying an old forum post.\n\nHTML:High-demand contact pages include <a href=\"/prisons/uk/hmp-wandsworth/contact-details\">HMP Wandsworth contact details</a>, <a href=\"/prisons/uk/hmp-thameside/contact-details\">HMP Thameside contact details</a>, <a href=\"/prisons/uk/hmp-wormwood-scrubs/contact-details\">HMP Wormwood Scrubs contact details</a>, <a href=\"/prisons/uk/hmp-bullingdon/contact-details\">HMP Bullingdon contact details</a>, <a href=\"/prisons/uk/hmp-durham/contact-details\">HMP Durham contact details</a>, <a href=\"/prisons/uk/hmp-five-wells/contact-details\">HMP Five Wells contact details</a>, <a href=\"/prisons/uk/hmp-preston/contact-details\">HMP Preston contact details</a>, and <a href=\"/prisons/uk/hmp-yoi-bronzefield/contact-details\">HMP Bronzefield contact details</a>.\n\nHTML:You can also start from the <a href=\"/prisons/uk\">UK prison directory</a> or the <a href=\"/prisons\">Prison Finder</a> if you only have a partial name.\n\n## If you know the category but not the name\n\nEngland and Wales male prisons are grouped by security category. Category B and Category C lists are the busiest browse pages on this site. Use them when you know the type of prison but not the exact HMP name, then open the matching contact-details page once you have identified the establishment. Category pages are lists; they are not a substitute for a named prison’s address page.\n\nHTML:Browse <a href=\"/prisons/uk/category/category-c\">Category C prisons</a> and <a href=\"/prisons/uk/category/category-b\">Category B prisons</a>. If the site is privately managed, the <a href=\"/prisons/uk/collection/private-prisons\">privately managed prisons</a> collection can also narrow the list. For the category definitions themselves, see <a href=\"/guides/prison-categories-explained\">Prison Categories Explained</a>.\n\n## What a contact-details page is for\n\nUse the contact-details page to check the postal address and postcode before you send mail, and the published switchboard or enquiry number before you call. Visiting still needs a separate booking process; the phone number on a contact page is not automatically a visits booking line. Mail usually needs the prisoner’s full name and prison number as well as the establishment address. Rules on photographs, enclosures, and digital mail providers differ by prison, so treat the contact page as the route to the right site rather than a complete mail manual.\n\n## Confirm the details officially\n\nAddresses, phone numbers, and mail routes change. After you have identified the prison here, confirm the live details on GOV.UK before you post a letter or travel. This directory is compiled from HMPPS administrative data used in the current site build; it is not a government website and it does not cover every Scottish or Northern Ireland establishment in the same way as England and Wales HMP sites.\n\nHTML:Confirm establishment contact pages via GOV.UK’s <a href=\"https://www.gov.uk/government/collections/prisons-in-england-and-wales\">prisons in England and Wales collection</a> (the former Find a prison entry point redirects here).\n\nHTML:When you are ready to book a visit rather than post a letter, read <a href=\"/guides/how-prison-visits-work\">How Prison Visits Work</a> after you have the right contact-details page.\n\n## A simple order of steps\n\n- Confirm the establishment name, including YOI in the title where that is how the site is listed.\n- Open that prison’s contact-details page for the address, postcode, and telephone number.\n- If you only know the type of prison, browse the Category B or Category C list first.\n- Add the prisoner’s name and prison number to any letter, then confirm the postal route on GOV.UK before you send it.",
    faqs: [
      {
        question: "How do I find a UK prison address?",
        answer:
          "Search for the HMP name in the UK directory, then open that prison’s contact-details page. That page is where this site keeps the postal address, postcode, and telephone number for one establishment. Confirm the live details on GOV.UK before you post mail.",
      },
      {
        question: "What should I write on a letter to someone in prison?",
        answer:
          "Use the prisoner’s full name and prison number, then the prison’s postal address and postcode from the contact-details page. Do not rely on an old forum address. Extra items such as photographs follow that prison’s own mail rules.",
      },
      {
        question: "Is the phone number on a prison contact page for booking visits?",
        answer:
          "Not necessarily. The published number is usually a switchboard or general enquiry line. Visit booking often uses a separate line, an online form, or a visits centre process. Check the prison’s visiting information after you have the right site.",
      },
      {
        question: "Can I find a prison by category if I do not know the name?",
        answer:
          "Yes. Category C and Category B directory pages list establishments in those security bands. Identify the prison from the list, then open its contact-details page for the address rather than treating the category list as the address itself.",
      },
      {
        question: "Why do some listings include YOI in the name?",
        answer:
          "Some establishments are recorded as HMP/YOI in the source data, even when people search for the shorter HMP name. Use the listing name that matches the directory so you open the correct contact-details page.",
      },
    ],
  },
];

export const getGuide = (slug: string) => guides.find(g => g.slug === slug);
