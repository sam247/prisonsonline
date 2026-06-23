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
    content: "Visiting someone in prison can feel daunting, especially for the first time. This guide explains the process step by step, from getting on the approved visitor list to what happens during the visit itself.\n\n## Getting on the Approved Visitor List\n\nBefore you can visit someone in prison, you must be approved as a visitor. The prisoner will need to submit your details to the prison, including your full name, date of birth, and address. A background check may be carried out. This process can take several weeks, so it is important to start early.\n\nIn the UK, the prisoner fills out a Visiting Order (VO) application. In the US, procedures vary by state and facility, but most require the prisoner to submit a visitor application form.\n\n## Booking a Visit\n\nMost prisons require visits to be booked in advance. In the UK, you can book through the prison's booking line or the official government website. In the US, procedures vary by state and facility, but most require advance scheduling.\n\nVisits are typically available on weekdays and weekends, though days and times vary by prison. Popular visiting slots fill up quickly, particularly at weekends, so booking early is recommended.\n\n## What to Bring\n\nYou will need valid photo identification such as a passport or driving licence. Some facilities also require a second form of ID. Check the specific prison's requirements before your visit.\n\nYou should bring money for the vending machines in the visits hall (usually in the form of coins or a specific payment card). Some prisons allow you to bring a small amount of cash; others require you to use a locker system.\n\nDo not bring mobile phones, cameras, electronic devices, or any items that could be considered prohibited. These items may be confiscated and could result in your visit being cancelled or criminal charges.\n\n## Arriving at the Prison\n\nArrive at least 30 minutes before your scheduled visit time. Late arrivals may not be admitted. You will need to check in at the visitors' centre, where your identification will be verified against the booking.\n\nYou may be required to store personal items in a locker. Only approved items can be taken into the visits hall.\n\n## Security Screening\n\nAll visitors undergo security screening which may include metal detectors, drug detection equipment, and searches. Some prisons use drug detection dogs. A positive indication from a drug dog may result in your visit being conducted behind a screen or being cancelled entirely.\n\nBe prepared for the possibility of a rub-down search or, in some cases, a more thorough search if there is reason for concern. These procedures exist to prevent the introduction of contraband into the prison.\n\n## The Visit Itself\n\nMost visits take place in a supervised visits hall where tables and chairs are arranged in a large room. Prison officers supervise the visit from the room.\n\nPhysical contact is usually limited to a brief embrace at the beginning and end of the visit. Food and drinks may be available from vending machines. The length of visits varies by prison but typically lasts between one and two hours.\n\n## Enhanced and Closed Visits\n\nPrisoners on enhanced regime status may receive longer or more frequent visits as a privilege. Conversely, prisoners who have breached rules may be placed on closed visits, where physical contact is not permitted and the visit takes place through a glass partition.\n\n## Visiting with Children\n\nMany prisons have child-friendly visiting arrangements, including play areas and special family visit days. Children under a certain age may not count toward the maximum visitor number. Some prisons offer extended family visits that include activities for children.\n\nIt is important to prepare children for the visit, explaining the security procedures and the environment in an age-appropriate way.",
    faqs: [
      { question: "How do I book a prison visit?", answer: "In the UK, you can book visits through the prison's booking line or the government's online booking service. In the US, contact the specific facility for their booking process. Most prisons require advance booking." },
      { question: "What ID do I need for a prison visit?", answer: "You will need valid photo identification such as a passport, driving licence, or government-issued ID card. Some facilities require two forms of identification. Always check the specific prison's requirements before your visit." },
      { question: "Can children visit someone in prison?", answer: "Yes, children can visit. Many prisons have child-friendly facilities and special family visit sessions. Children usually need to be accompanied by an approved adult visitor. Some prisons have play areas and organised activities." },
      { question: "What happens if I am late for a prison visit?", answer: "Most prisons will not admit visitors who arrive after the scheduled start time. Allow extra time for travel and security processing. Arriving 30 minutes early is recommended." },
      { question: "Can I bring food or gifts to a prison visit?", answer: "Generally, you cannot bring items directly to a prisoner during visits. Some prisons allow visitors to purchase items from vending machines during the visit. Property can usually be sent or handed in through a separate process." },
    ],
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
      "What typically belongs in your pocket for ID and screening, what stays in the car, and how property rules differ from visits-hall vending.",
    icon: "Package",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for visitor belongings — not a photograph of a facility.",
    },
    content:
      "Prison visits are tightly controlled, and what you can carry through the gate is narrower than everyday life. In most systems you will need valid photo identification and sometimes a second form of ID; everything else is judged against a prohibited-items list that can include phones, cameras, cash beyond small change for vending, and any item that could be passed to a prisoner without staff seeing it. Some halls sell drinks and snacks during the visit; others expect you to arrive with nothing but keys and ID in a clear bag. Never assume that because another prison allowed an item, the next one will too. Read the booking email, the visitors’ leaflet, and the official website for the establishment you are attending. If you are mapping which site you are visiting first, use our prison directory to jump from a name to the correct operator source rather than relying on outdated forum posts.\n\n## Usually allowed\n\nGovernment-issued photo ID, booking reference if you were given one, and any medication in original packaging with documentation when the prison has pre-approved it.\n\n## Usually refused\n\nMobile phones, recording devices, large bags, sharp tools, and gifts intended for the prisoner without going through property channels.\n\nHTML:Browse all establishments from the <a href=\"/prisons\">Prison Finder</a> to confirm contact numbers and visitor pages before you pack.",
    faqs: [
      {
        question: "Can I bring a bag into the visits hall?",
        answer:
          "Many sites restrict bags to small clear pouches or ban them entirely except for essential medical items. Expect to leave larger bags in a locker or your vehicle.",
      },
      {
        question: "Is cash allowed?",
        answer:
          "Some visits halls use coins or cards for vending; others restrict cash. Follow the facility’s instructions—bringing large amounts can cause delays or refusal.",
      },
    ],
  },
  {
    title: "Can You Get Haircuts in Prison?",
    slug: "can-you-get-haircuts-in-prison",
    excerpt:
      "General guidance on prison haircuts, barbering routines, hygiene rules, and why access varies between establishments.",
    icon: "FileText",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for prison grooming guidance - not a photograph of a facility.",
    },
    content:
      "Yes, people in prison can usually get haircuts, but the arrangement depends on the prison, the regime, staffing, and the prisoner's status. In many prisons, haircuts are offered through an internal barbering system rather than an outside salon. That may mean a trained prisoner barber, a supervised workshop, or a scheduled wing-based service rather than a choice of appointment times. Access can be slower during restricted regimes, staff shortages, or when movement around the prison is reduced. This guide is general orientation only: prisons set their own practical routines, so always treat local rules and current staff instructions as the final word.\n\n## How prison haircuts usually work\n\nMost prisons manage haircuts as part of day-to-day regime activity. Some have a dedicated barbershop area; others run haircut sessions on residential wings. In many systems, prisoners book through wing staff, unit orderlies, or a routine list rather than walking in when they want. Waiting times vary. A busy local prison or reception site may operate very differently from a training prison or open prison.\n\n## Who cuts prisoners' hair\n\nHaircuts are often carried out by other prisoners who have been trained and approved to work as prison barbers. Staff supervision, hygiene checks, and tool-control rules are usually stricter than in the community. Clippers, scissors, and other sharp equipment are controlled items, so sessions can be delayed or limited if staffing levels or security procedures change.\n\n## Limits and practical rules\n\nA prisoner is unlikely to have the same choice, frequency, or styling options they would expect outside prison. Rules can affect beard trimming, hair dye, specialist products, and the use of personal grooming items kept in cells. Medical needs, religious practice, and cultural requirements may also affect how prisons handle hair and facial-hair requests, but those decisions still sit within local policy and security rules.\n\n## Why access varies so much\n\nThe most important point is that there is no single universal haircut rule that applies in exactly the same way everywhere. Regime restrictions, lockdowns, staff shortages, first-night status, segregation, healthcare needs, and incentive or privilege issues can all affect access. If you are asking on behalf of someone in custody, the safest route is to contact the prison directly or check whether the prison's own guidance mentions grooming arrangements.\n\nHTML:Use the <a href=\"/prisons\">Prison Finder</a> to locate the prison first, then use the prison profile or official operator contact details to confirm the current regime.",
    faqs: [
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
    excerpt: "Understanding the reception process, from court to cell allocation and the first days inside.",
    icon: "Building2",
    coverImage: {
      type: "editorial",
      src: "/images/guides/what-happens-going-to-prison.svg",
      alt: "Abstract illustration for reception into custody — not a photograph of a facility.",
    },
    content: "When someone receives a custodial sentence, they are usually taken directly from court to a local reception prison. This guide explains what happens during those critical first days.\n\n## The Journey from Court\n\nAfter sentencing, prisoners are transported to a reception prison by secure transport. This journey can take several hours depending on the distance and the number of stops. Prisoners may be handcuffed during transport and will travel in a cellular vehicle (prison van) divided into small individual compartments.\n\nThe destination prison is determined by factors including the prisoner's gender, age, sentence length, security category, and geographical factors. New prisoners are usually sent to a local reception prison that serves the court area.\n\n## Arrival and Reception\n\nOn arrival, prisoners go through an intake process that includes searches, medical assessments, and administrative procedures. Personal belongings are catalogued and stored. Prison-issue clothing may be provided, though most prisons now allow inmates to wear their own clothing.\n\nThe reception process includes:\n\n- A full body search\n- Photographing and fingerprinting\n- Recording personal details and next of kin\n- An initial health screening\n- Assessment of immediate risks including self-harm and suicide risk\n- Issuing of prison number and basic supplies\n\n## First Night\n\nMany prisons have dedicated first night centres designed to help new arrivals adjust. Staff carry out welfare checks and provide essential information about the prison regime. First night cells may be located in a separate wing from the general prison population.\n\nNew prisoners are given a phone call to inform family members of their location. They receive basic supplies including bedding, toiletries, and information about the prison.\n\nThe first night can be one of the most difficult experiences in prison. Anxiety about the unknown, separation from family, and the reality of imprisonment combine to make this a high-risk period for mental health crises.\n\n## Initial Assessment\n\nIn the days following arrival, prisoners undergo a more detailed assessment covering health, education, employment history, substance misuse, and offending behaviour. This information is used to develop a sentence plan — a document outlining the programmes, work, and education that will form the basis of the prisoner's time in custody.\n\n## Induction\n\nOver the first one to two weeks, prisoners go through an induction programme covering prison rules, available services, education opportunities, and how to access healthcare. They learn about the incentives and earned privileges scheme, the complaints process, and their rights and responsibilities.\n\nDuring induction, prisoners are also assessed for their security category and may be allocated to a permanent wing or transferred to a more appropriate facility.\n\n## The Regime\n\nAfter induction, prisoners join the main regime. This typically involves being assigned to work, education, or training activities. The specific regime varies by prison but follows a structured daily timetable that governs mealtimes, activities, association periods, and lock-up times.\n\n## Communication with Family\n\nPrisoners are entitled to regular contact with family through letters, phone calls, and visits. Phone calls are typically made from communal phones on the wing and are limited in length and frequency. All calls (except to legal representatives) are monitored and recorded.\n\nWriting letters is an important means of maintaining family contact. Prisoners can send and receive letters, though incoming mail is usually opened and checked by staff.",
    faqs: [
      { question: "Where will someone go after being sentenced at court?", answer: "After sentencing, prisoners are transported to a local reception prison by secure transport. The destination depends on factors including gender, sentence length, and security category. The journey can take several hours." },
      { question: "Can prisoners make phone calls on their first day?", answer: "Yes, new prisoners are usually given a phone call on their first night to inform family members of their location. After this initial call, phone access follows the regular prison regime." },
      { question: "What happens to a prisoner's belongings?", answer: "Personal belongings are catalogued and stored securely by the prison. Some items may be allowed in the cell, while others are kept in property storage until release. Prohibited items are confiscated." },
      { question: "How long does the prison induction process take?", answer: "The induction process typically takes one to two weeks. During this time, new prisoners learn about prison rules, available services, and their rights and responsibilities." },
    ],
  },
  {
    title: "How Prison Sentences Work",
    slug: "how-prison-sentences-work",
    excerpt: "An explanation of different sentence types, release dates, and parole eligibility.",
    icon: "Scale",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for sentencing guidance — not a photograph of a facility.",
    },
    content: "Prison sentences can be complex. This guide breaks down the different types of sentences and how they work in practice.\n\n## Determinate Sentences\n\nThe most common type of sentence has a fixed length. In England and Wales, prisoners typically serve half their sentence in custody and the remainder on licence in the community. This is known as the automatic release point.\n\nFor sentences of four years or more imposed after April 2005, prisoners may be eligible for release at the two-thirds point rather than the halfway point. The licence period extends to the end of the full sentence, during which the prisoner must comply with certain conditions.\n\n## Standard Determinate Sentences\n\nA standard determinate sentence (SDS) is the most straightforward type. If someone receives a four-year sentence, they will typically serve two years in custody and two years on licence. During the licence period, they must comply with conditions such as reporting to a probation officer, living at a specified address, and avoiding contact with certain people.\n\nBreach of licence conditions can result in recall to prison to serve some or all of the remaining sentence.\n\n## Extended Determinate Sentences\n\nExtended determinate sentences (EDS) are imposed on offenders convicted of specified violent or sexual offences who are considered dangerous. These sentences consist of a custodial term followed by an extended licence period of up to five years for violent offences or eight years for sexual offences.\n\nPrisoners serving EDS sentences are eligible for parole consideration at the two-thirds point of the custodial term. If parole is not granted, they serve the full custodial term before automatic release.\n\n## Indeterminate Sentences\n\nLife sentences and Imprisonment for Public Protection (IPP) sentences have no fixed end date. Prisoners must serve a minimum tariff before becoming eligible for parole.\n\nLife sentences are mandatory for murder and discretionary for other serious offences. The minimum tariff — the period that must be served before the prisoner can apply for parole — is set by the judge at sentencing.\n\n## Imprisonment for Public Protection (IPP)\n\nIPP sentences were introduced in 2005 and abolished in 2012, but they continue to affect over 1,000 prisoners who remain in custody under this sentence type. IPP prisoners must serve their minimum tariff and then satisfy the Parole Board that they can be safely released.\n\nMany IPP prisoners remain in custody years beyond their minimum tariff, creating significant controversy and calls for resentencing or release.\n\n## Parole\n\nThe Parole Board assesses whether prisoners serving indeterminate sentences can be safely released. They consider factors including behaviour in custody, risk assessments, and release plans. Parole hearings may involve oral hearings where the prisoner and their legal representative can make representations.\n\nThe Parole Board's primary consideration is whether the prisoner continues to pose an unacceptable risk to the public. They do not consider whether the prisoner has been sufficiently punished.\n\n## Early Release\n\nSome prisoners may qualify for early release schemes such as Home Detention Curfew (tag) or Release on Temporary Licence (ROTL). Eligibility depends on the type of sentence and individual circumstances.\n\nHome Detention Curfew allows eligible prisoners to be released up to 135 days before their automatic release date, subject to wearing an electronic tag and observing a curfew. Not all prisoners are eligible, and the scheme excludes those convicted of certain offences.\n\n## Time on Remand\n\nTime spent in custody before sentencing (on remand) is credited against the sentence. If someone spends three months in custody awaiting trial and then receives a two-year sentence, the time served on remand is deducted from the sentence.",
    faqs: [
      { question: "How much of a prison sentence do you actually serve?", answer: "For most determinate sentences in England and Wales, prisoners serve half the sentence in custody and the remainder on licence. For sentences of four years or more, release may be at the two-thirds point. Indeterminate sentences have no fixed release date." },
      { question: "What is a life sentence?", answer: "A life sentence means the offender is subject to the sentence for the rest of their life. They must serve a minimum tariff set by the judge before becoming eligible for parole. If released, they remain on licence for life and can be recalled to prison." },
      { question: "What happens if someone breaches their licence conditions?", answer: "If a prisoner on licence breaches their conditions, they can be recalled to prison. The decision to recall is made by the probation service. Once recalled, the prisoner can make representations to the Parole Board for re-release." },
      { question: "Does time on remand count towards the sentence?", answer: "Yes, time spent in custody before sentencing (on remand) is automatically deducted from the sentence. This is known as 'time served' and is calculated by the prison." },
    ],
  },
  {
    title: "Life Inside Prison",
    slug: "life-inside-prison",
    excerpt: "What daily life looks like inside a prison, including routines, work, and recreation.",
    icon: "Clock",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for daily life in custody — not a photograph of a facility.",
    },
    content: "Daily life in prison follows a structured routine. While conditions vary between facilities, most prisons share common elements in their daily operations.\n\n## Daily Routine\n\nA typical day begins with unlock around 7:30-8:00am. Prisoners collect breakfast and prepare for the day's activities. The morning is usually spent in work, education, or training programmes.\n\nLunchtime is typically between 12:00 and 1:00pm. Afternoon activities follow a similar pattern to the morning. The day ends with evening lock-up, usually between 5:00 and 7:00pm, depending on the facility.\n\nWeekends follow a different routine with more association time and fewer scheduled activities.\n\n## Work and Education\n\nMost prisoners are expected to work or attend education. Work assignments can include kitchen duties, cleaning, laundry, workshops, or industrial work. Education ranges from basic literacy to degree-level courses.\n\nPrison work is paid, though rates are very low. In England and Wales, the average prison wage is around £10 per week. In the US federal system, wages range from $0.12 to $0.40 per hour for most work assignments.\n\nEducation is increasingly recognised as one of the most effective ways to reduce reoffending. Many prisons offer vocational qualifications, GCSEs, A-levels, and access to higher education through distance learning partnerships with universities.\n\n## Food and Meals\n\nPrisons provide three meals per day. Menus typically rotate on a weekly or fortnightly cycle and include options for different dietary requirements including vegetarian, halal, and kosher meals.\n\nThe quality and quantity of food varies between facilities. Most prisons operate a pre-order system where prisoners select their meals in advance. Some prisons allow inmates to purchase additional food items from a weekly canteen sheet.\n\n## Recreation\n\nPrisoners typically have access to association time in the evening, where they can socialise, use phones, and participate in activities. Most prisons have gym facilities and outdoor exercise yards.\n\nAssociation time is a privilege that can be earned through good behaviour. During association, prisoners can watch television in communal areas, play games, and interact with other inmates on their wing.\n\n## Healthcare\n\nPrisons provide healthcare services including GP appointments, mental health support, dental care, and substance misuse programmes. Access to specialist services can vary significantly between facilities.\n\nIn England and Wales, prison healthcare is commissioned by NHS England and should meet the same standards as community healthcare. In practice, waiting times for specialist services and mental health support are often longer in prison than in the community.\n\n## Communication\n\nPrisoners maintain contact with the outside world through letters, phone calls, and visits. Email services are available in some prisons. Phone calls are made from communal phones and are recorded and monitored (except calls to legal representatives).\n\n## The Incentives and Earned Privileges Scheme\n\nIn England and Wales, the Incentives and Earned Privileges (IEP) scheme governs many aspects of daily life. Prisoners are placed on one of three levels: Basic, Standard, or Enhanced. Each level provides different access to privileges including private cash, time out of cell, and the number of visits permitted.",
    faqs: [
      { question: "What time do prisoners wake up?", answer: "Most prisons unlock cells between 7:30 and 8:00am on weekdays. Prisoners collect breakfast and prepare for the day's activities. Weekend routines may start slightly later." },
      { question: "Do prisoners get paid for work?", answer: "Yes, but pay is very low. In England and Wales, the average prison wage is around £10 per week. In the US federal system, most work assignments pay between $0.12 and $0.40 per hour." },
      { question: "Can prisoners use the internet?", answer: "Generally, prisoners do not have direct internet access. Some prisons provide controlled access to specific educational websites. Email services may be available through monitored, prison-specific platforms." },
      { question: "What happens if a prisoner refuses to work?", answer: "Prisoners who refuse to work may face disciplinary action and loss of privileges. They may be placed on Basic regime level, which restricts access to private cash, television, and other privileges." },
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
    content: "Prisons are categorised by security level to match the risk posed by different prisoners. Understanding these categories helps explain why prisoners are held where they are.\n\n## UK Prison Categories\n\nIn England and Wales, male prisons are classified into four categories:\n\n- **Category A**: Maximum security for prisoners whose escape would pose the highest risk to the public, the police, or national security. Category A prisons include HMP Belmarsh, HMP Wakefield, and HMP Manchester (Strangeways). Within Category A, prisoners may be further classified as Standard, High, or Exceptional risk.\n\n- **Category B**: High security for prisoners who don't need maximum security but for whom escape must be made very difficult. Category B prisons serve as local prisons (receiving prisoners from courts) and training prisons. Examples include HMP Pentonville and HMP Wandsworth.\n\n- **Category C**: Training prisons for prisoners who can be trusted in semi-open conditions but who lack the reliability to be placed in open conditions. Category C prisons focus on education, work, and rehabilitation programmes. HMP Bullingdon operates partly at this level.\n\n- **Category D**: Open prisons for prisoners who can be trusted not to escape and who present a low risk to the public. Open prisons have minimal physical security and prisoners may be permitted to leave the facility for work, education, or home visits. Examples include HMP North Sea Camp and HMP Sudbury.\n\n## How Categorisation Works\n\nNew prisoners are assessed and categorised during the reception process. The categorisation considers the nature of the offence, sentence length, escape risk, and any intelligence about the prisoner's behaviour or associations.\n\nPrisoners typically progress through the categories during their sentence, moving from higher to lower security as they demonstrate good behaviour and reduced risk. This progression is reviewed regularly and forms part of the sentence planning process.\n\n## Women's Prisons\n\nWomen's prisons in England and Wales are not formally categorised using the same system. Instead, they are classified as either closed or open. Most women's prisons operate at a level roughly equivalent to Category B or C.\n\n## US Federal Security Levels\n\n- **Minimum**: Camp-style facilities with limited or no fencing. Inmates are typically non-violent offenders serving short sentences. Work assignments often involve community service.\n\n- **Low**: Double-fenced perimeters with dormitory housing. Greater staff supervision than minimum facilities.\n\n- **Medium**: Strengthened perimeters with cell-type housing. Internal security measures are more rigorous.\n\n- **High**: Highly secure with reinforced fencing and close staff supervision. Movement is highly controlled. USP Leavenworth is an example.\n\n- **Administrative/Supermax**: The most restrictive, including ADX Florence. These facilities house inmates who pose the greatest threat to safety and security.\n\n## State Prison Systems\n\nEach US state operates its own classification system, which may use different terminology. Most states use some variation of Minimum, Medium, Maximum, and Supermax designations, but the specific criteria for each level vary.",
    faqs: [
      { question: "What is a Category A prison?", answer: "Category A is the highest security classification in England and Wales. These prisons hold inmates whose escape would be highly dangerous to the public, police, or national security. Examples include HMP Belmarsh and HMP Wakefield." },
      { question: "Can prisoners move to lower security categories?", answer: "Yes, prisoners are regularly reviewed for recategorisation. Good behaviour, completion of programmes, and reduced risk can lead to progression from higher to lower security categories during the sentence." },
      { question: "What is the difference between a supermax and maximum security prison?", answer: "Supermax facilities, like ADX Florence, provide the highest level of security with near-total isolation. Maximum security prisons are highly secure but still allow some communal activities and interaction between inmates." },
      { question: "How are women's prisons categorised?", answer: "In England and Wales, women's prisons are classified as closed or open rather than using the Category A-D system. Most operate at a level roughly equivalent to Category B or C for male prisons." },
    ],
  },
  {
    title: "Rights of Prisoners",
    slug: "rights-of-prisoners",
    excerpt: "What rights prisoners retain while serving their sentence and how they are protected.",
    icon: "FileText",
    coverImage: {
      type: "editorial",
      src: "/images/guides/guide-general.svg",
      alt: "Abstract illustration for legal rights in custody — not a photograph of a facility.",
    },
    content: "Prisoners lose their liberty but retain many fundamental rights. This guide outlines what prisoners are entitled to during their time in custody.\n\n## Fundamental Principle\n\nThe fundamental principle underlying prisoners' rights is that a person sent to prison is deprived of their liberty — nothing more. All other rights remain intact unless they are necessarily restricted by the fact of imprisonment. This principle is established in both domestic law and international human rights instruments.\n\n## Basic Rights\n\nPrisoners have the right to be treated with dignity and respect, to adequate food and water, to healthcare, and to be protected from harm. These rights are protected by domestic and international law, including the European Convention on Human Rights and the United Nations Standard Minimum Rules for the Treatment of Prisoners (the Nelson Mandela Rules).\n\nThe right to life (Article 2 ECHR) imposes a positive obligation on prison authorities to protect prisoners from harm, including self-harm. Failures to prevent deaths in custody can give rise to legal claims.\n\nThe prohibition on torture and inhuman or degrading treatment (Article 3 ECHR) sets minimum standards for conditions of detention. Overcrowding, inadequate healthcare, and excessive use of solitary confinement have all been found to breach Article 3.\n\n## Legal Rights\n\nPrisoners retain the right to access legal representation, to make complaints through official channels, and to challenge their detention through the courts. Legal correspondence is treated as confidential and should not be opened or read by prison staff.\n\nPrisoners can apply for judicial review of decisions that affect them, make complaints through the prison complaints system, and refer matters to the Prisons and Probation Ombudsman. Access to justice should not be impeded by imprisonment.\n\n## Right to Vote\n\nIn the UK, serving prisoners cannot vote in elections. This blanket ban has been the subject of long-running legal challenges, with the European Court of Human Rights ruling that it violates the Convention. The UK government has made minimal changes in response.\n\nIn the US, voting rights for prisoners and former prisoners vary by state. Some states restore voting rights immediately upon release, while others impose permanent disenfranchisement for certain offences.\n\n## Communication\n\nPrisoners can send and receive letters, make phone calls (at their own expense), and receive visits from approved visitors. Some facilities are introducing email and video calling. Communication with legal advisors is protected and should not be monitored.\n\n## Education and Work\n\nPrisoners have the right to access education and are usually required to engage in purposeful activity. Work is typically paid at a basic rate. Education provision should include opportunities for prisoners to gain qualifications and develop skills relevant to employment after release.\n\n## Healthcare\n\nPrisoners are entitled to the same standard of healthcare as the general population. In England and Wales, prison healthcare is commissioned by NHS England. This includes access to GP services, mental health support, dental care, and specialist services.\n\n## Religious Practice\n\nPrisoners have the right to practise their religion, including access to religious services, religious texts, and dietary requirements associated with their faith. Prisons employ chaplains from multiple faiths and should accommodate reasonable religious needs.\n\n## Complaints and Oversight\n\nPrisoners can make formal complaints through the prison complaints system. If a complaint is not resolved satisfactorily, it can be escalated to the Prisons and Probation Ombudsman. Independent Monitoring Boards provide additional oversight at each prison.\n\nHM Inspectorate of Prisons conducts regular inspections of all prisons and publishes reports on conditions and standards. These reports are an important mechanism for holding the prison system to account.",
    faqs: [
      { question: "Can prisoners vote in elections?", answer: "In the UK, serving prisoners currently cannot vote. In the US, voting rights vary by state — some allow prisoners to vote, others restore rights upon release, and some impose permanent restrictions." },
      { question: "Are prisoners entitled to healthcare?", answer: "Yes, prisoners are entitled to the same standard of healthcare as the general population. In England and Wales, prison healthcare is commissioned by NHS England and includes GP, dental, mental health, and specialist services." },
      { question: "Can prisoners make complaints?", answer: "Yes, all prisons have a formal complaints system. Unresolved complaints can be escalated to the Prisons and Probation Ombudsman. Independent Monitoring Boards also provide oversight." },
      { question: "Do prisoners have the right to education?", answer: "Yes, prisoners have the right to access education. Most prisons offer a range of educational opportunities from basic literacy and numeracy to vocational qualifications and degree-level courses." },
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
];

export const getGuide = (slug: string) => guides.find(g => g.slug === slug);
