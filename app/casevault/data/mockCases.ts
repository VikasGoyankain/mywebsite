export interface Case {
  id: string;
  title: string;
  citation: string;
  court: string;
  judgmentDate: string;
  year: number;
  legalArea: string;
  stage: string;
  tags: string[];
  shortSummary: string;
  facts: string;
  issues: string;
  held: string;
  legalPrinciples: string[];
  relatedCases: string[];
  hasDocument: boolean;
  
  // New fields for litigation tracking
  isOwnCase: boolean;
  startDate?: string;
  completionDate?: string;
  outcome?: 'Won' | 'Settled' | 'Dismissed' | 'Pending' | 'Appeal';
  myRole?: string;
  clientTestimony?: string;
  courtProgression?: {
    court: string;
    date: string;
    outcome: string;
    orderSummary: string;
  }[];
  personalCommentary?: {
    challenges: string;
    learnings: string;
    turningPoint: string;
  };
  satisfactionRating?: number;
  isHighImpact?: boolean;
}

export const mockCases: Case[] = [
  // Your own litigated cases
  {
    id: "own-1",
    title: "Rajesh Kumar vs. State Bank of India",
    citation: "CWP 2023/4567",
    court: "High Court of Delhi",
    judgmentDate: "2023-09-15",
    year: 2023,
    legalArea: "Civil",
    stage: "High Court",
    tags: ["Banking Law", "Consumer Rights", "Contract Dispute"],
    shortSummary: "Successfully argued for bank customer's rights in wrongful account freezing case, establishing precedent for due process in banking operations.",
    facts: "The petitioner's account was frozen without proper notice by SBI, causing significant business losses. The bank claimed suspicious transactions but failed to follow RBI guidelines for account freezing procedures.",
    issues: "Whether banks can freeze accounts without following due process under RBI guidelines. Whether compensation is due for wrongful freezing.",
    held: "Bank liable for wrongful account freezing. Compensation of ₹5 lakhs awarded. Banks must follow due process before freezing accounts.",
    legalPrinciples: [
      "Due process in banking operations",
      "Customer protection under Banking Regulation Act",
      "Compensation for wrongful bank actions"
    ],
    relatedCases: ["Punjab National Bank vs. Sharma (2019)", "ICICI Bank vs. Consumer Forum (2020)"],
    hasDocument: true,
    
    // Litigation-specific fields
    isOwnCase: true,
    startDate: "2023-01-10",
    completionDate: "2023-09-15",
    outcome: "Won",
    myRole: "Lead Counsel - Drafted petition, argued before HC bench",
    clientTestimony: "Client was a small business owner whose account was frozen during peak business season, causing severe financial distress and loss of credibility with suppliers.",
    courtProgression: [
      {
        court: "District Consumer Forum",
        date: "2023-02-15",
        outcome: "Dismissed",
        orderSummary: "Forum held it lacked jurisdiction over banking matters"
      },
      {
        court: "High Court of Delhi",
        date: "2023-09-15",
        outcome: "Allowed",
        orderSummary: "Writ petition allowed, compensation awarded, guidelines issued"
      }
    ],
    personalCommentary: {
      challenges: "Establishing jurisdiction and proving malafide intent by the bank",
      learnings: "Importance of RBI guidelines in banking litigation and consumer protection",
      turningPoint: "Discovery of similar cases where RBI had penalized banks for similar conduct"
    },
    satisfactionRating: 5,
    isHighImpact: true
  },
  {
    id: "own-2",
    title: "Sunita Devi vs. Ramesh Chandra (Maintenance)",
    citation: "CrMC 2022/3456",
    court: "Sessions Court",
    judgmentDate: "2022-11-20",
    year: 2022,
    legalArea: "Family",
    stage: "Trial",
    tags: ["Maintenance", "Domestic Violence", "Women's Rights"],
    shortSummary: "Secured substantial maintenance for client under Section 125 CrPC, despite husband's attempts to hide income sources.",
    facts: "Wife seeking maintenance from husband who claimed to be unemployed but was found to have multiple income sources including property rentals.",
    issues: "Determination of husband's actual income for maintenance calculation. Whether assets acquired during marriage should be considered.",
    held: "Maintenance of ₹25,000 per month awarded. Husband's hidden income streams established through investigation.",
    legalPrinciples: [
      "Maintenance under Section 125 CrPC",
      "Burden of proof for income declaration",
      "Women's right to dignified living"
    ],
    relatedCases: [],
    hasDocument: true,
    
    isOwnCase: true,
    startDate: "2022-06-01",
    completionDate: "2022-11-20",
    outcome: "Won",
    myRole: "Sole Counsel - Investigation, documentation, arguments",
    clientTestimony: "Client was left destitute when husband claimed poverty while maintaining lavish lifestyle. Needed urgent financial support for herself and children.",
    courtProgression: [
      {
        court: "Family Court",
        date: "2022-07-15",
        outcome: "Interim maintenance ₹10,000",
        orderSummary: "Interim relief granted pending final hearing"
      },
      {
        court: "Sessions Court",
        date: "2022-11-20",
        outcome: "Final order ₹25,000/month",
        orderSummary: "Permanent maintenance awarded based on proven income"
      }
    ],
    personalCommentary: {
      challenges: "Proving husband's hidden income without proper financial disclosure",
      learnings: "Importance of thorough investigation and evidence gathering in family matters",
      turningPoint: "Discovery of property documents showing undisclosed rental income"
    },
    satisfactionRating: 5,
    isHighImpact: false
  },
  
  // General case briefs (academic/research)
  {
    id: "brief-1",
    title: "Maneka Gandhi vs. Union of India",
    citation: "AIR 1978 SC 597",
    court: "Supreme Court",
    judgmentDate: "1978-01-25",
    year: 1978,
    legalArea: "Constitutional",
    stage: "Supreme Court",
    tags: ["Article 21", "Personal Liberty", "Due Process", "Passport"],
    shortSummary: "Landmark judgment expanding the scope of Article 21 to include the right to travel abroad and establishing the principle of substantive due process.",
    facts: "Petitioner's passport was impounded without giving her a hearing. She challenged this action as violative of her fundamental rights under Articles 14 and 21.",
    issues: "Whether the right to travel abroad is part of personal liberty under Article 21. Whether procedural safeguards are necessary before restricting fundamental rights.",
    held: "Right to travel abroad is part of personal liberty. No person can be deprived of life or personal liberty except according to procedure established by law, which must be fair, just and reasonable.",
    legalPrinciples: [
      "Expanded interpretation of Article 21",
      "Right to travel abroad as fundamental right",
      "Substantive due process in Indian Constitution",
      "Natural justice in administrative action"
    ],
    relatedCases: ["Kharak Singh vs. State of UP", "Francis Coralie vs. Union Territory of Delhi"],
    hasDocument: true,
    isOwnCase: false
  },
  {
    id: "brief-2",
    title: "Vishaka vs. State of Rajasthan",
    citation: "AIR 1997 SC 3011",
    court: "Supreme Court",
    judgmentDate: "1997-08-13",
    year: 1997,
    legalArea: "Constitutional",
    stage: "Supreme Court",
    tags: ["Sexual Harassment", "Women's Rights", "Workplace", "Guidelines"],
    shortSummary: "Supreme Court laid down comprehensive guidelines for prevention of sexual harassment at workplace, creating legally binding norms in absence of legislation.",
    facts: "Social worker Bhanwari Devi was gang-raped for preventing child marriage. The case highlighted the absence of laws protecting women from sexual harassment at workplace.",
    issues: "Whether absence of legislation prevents courts from protecting fundamental rights. What measures are necessary to prevent sexual harassment at workplace.",
    held: "Courts can fill legislative vacuum by laying down guidelines. Comprehensive Vishaka Guidelines established for workplace sexual harassment prevention.",
    legalPrinciples: [
      "Judicial activism in absence of legislation",
      "International conventions as aid to interpretation",
      "Right to gender equality and life with dignity",
      "Employer's vicarious liability for harassment"
    ],
    relatedCases: ["CERC vs. Union of India", "Apparel Export Promotion Council vs. Chopra"],
    hasDocument: true,
    isOwnCase: false
  },
  {
    id: "brief-3",
    title: "K.S. Puttaswamy vs. Union of India",
    citation: "AIR 2017 SC 4161",
    court: "Supreme Court",
    judgmentDate: "2017-08-24",
    year: 2017,
    legalArea: "Constitutional",
    stage: "Supreme Court",
    tags: ["Privacy", "Fundamental Right", "Aadhaar", "Technology"],
    shortSummary: "Nine-judge bench unanimously declared privacy as a fundamental right, overruling previous judgments and setting framework for digital age rights.",
    facts: "Challenge to Aadhaar scheme raised fundamental questions about privacy rights under Indian Constitution. Previous smaller benches had held privacy was not a fundamental right.",
    issues: "Whether privacy is a fundamental right under the Constitution. How to balance individual privacy with state security and welfare schemes.",
    held: "Privacy is an intrinsic part of life and liberty under Article 21. Previous judgments denying privacy as fundamental right overruled.",
    legalPrinciples: [
      "Privacy as fundamental right under Article 21",
      "Three-fold test for privacy restrictions",
      "Informational privacy and bodily autonomy",
      "Limitations on state surveillance powers"
    ],
    relatedCases: ["MP Sharma vs. Satish Chandra", "Kharak Singh vs. State of UP", "Justice KS Puttaswamy vs. Union of India (Aadhaar)"],
    hasDocument: true,
    isOwnCase: false
  },
  {
    id: "brief-4",
    title: "Shreya Singhal vs. Union of India",
    citation: "AIR 2015 SC 1523",
    court: "Supreme Court",
    judgmentDate: "2015-03-24",
    year: 2015,
    legalArea: "Constitutional",
    stage: "Supreme Court",
    tags: ["Free Speech", "Section 66A", "Internet Freedom", "IT Act"],
    shortSummary: "Supreme Court struck down Section 66A of IT Act as unconstitutional for being vague and violating freedom of speech and expression.",
    facts: "Section 66A of IT Act, 2000 criminalized sending 'offensive' messages through communication devices. Several arrests were made for social media posts.",
    issues: "Whether Section 66A violates Article 19(1)(a). Whether vague and overbroad laws can restrict fundamental rights.",
    held: "Section 66A struck down as unconstitutional. Laws restricting free speech must be narrowly tailored and not vague or overbroad.",
    legalPrinciples: [
      "Chilling effect on free speech",
      "Void for vagueness doctrine",
      "Overbreadth in criminal laws",
      "Internet freedom as part of free speech"
    ],
    relatedCases: ["Romesh Thappar vs. State of Madras", "Anuradha Bhasin vs. Union of India"],
    hasDocument: true,
    isOwnCase: false
  }
]; 