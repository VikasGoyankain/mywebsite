export type PostType = "volume-chapter" | "independent";
export type Category = "banking" | "tech" | "policy" | "sociology";
export type Complexity = "Executive Summary" | "Technical Deep-Dive" | "Policy Brief";

export interface Volume {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  chapters: string[]; // post slugs
  icon: "library";
}

export interface Post {
  slug: string;
  title: string;
  abstract: string;
  excerpt: string;
  date: string;
  readTime: string;
  complexity: Complexity;
  type: PostType;
  volumeSlug?: string;
  categories: Category[];
  tags: { label: string; className: string }[];
  content: string;
  verdict?: string;
  footnotes?: string[];
  relatedSlugs?: string[];
  ogImage?: string;
}

export const volumes: Volume[] = [
  {
    slug: "upi-system",
    title: "Volume I: The UPI Architecture",
    subtitle: "A Three-Part Examination of India's Payment Revolution",
    description:
      "This volume dissects the Unified Payments Interface from three critical lenses — its technical plumbing, its financial implications, and the legal vacuum it operates within.",
    chapters: ["upi-technical-architecture", "upi-financial-inclusion", "upi-legal-vacuum"],
    icon: "library",
  },
  {
    slug: "digital-lending",
    title: "Volume II: Digital Lending & the New Credit Order",
    subtitle: "Regulation, Risk, and the Algorithmic Lender",
    description:
      "An investigation into how digital lending platforms are reshaping credit access in India, the regulatory response, and the constitutional questions they raise.",
    chapters: ["algorithmic-credit-scoring", "digital-lending-rbi-guidelines"],
    icon: "library",
  },
];

export const posts: Post[] = [
  {
    slug: "upi-technical-architecture",
    title: "The Technical Backbone of UPI: NPCI, IMPS, and the Switch",
    abstract:
      "This paper examines the multi-layered technical architecture underpinning India's Unified Payments Interface, tracing its evolution from the IMPS framework through the NPCI switching mechanism, and evaluates its resilience against systemic failure points.",
    excerpt:
      "A deep technical examination of UPI's payment switch, its IMPS heritage, and the single points of failure in India's most critical financial infrastructure.",
    date: "Feb 2026",
    readTime: "22 min",
    complexity: "Technical Deep-Dive",
    type: "volume-chapter",
    volumeSlug: "upi-system",
    categories: ["tech", "banking"],
    tags: [
      { label: "#TechPolicy", className: "tag-tech" },
      { label: "#BankingLaw", className: "tag-banking" },
    ],
    content: `## The IMPS Foundation\n\nThe Immediate Payment Service (IMPS), launched in 2010, laid the groundwork...\n\n> "The architecture of a payment system reflects the architecture of trust in a society." — Prof. Raghuram Rajan\n\n## The NPCI Switch\n\nAt the heart of UPI lies the National Payments Corporation of India...\n\n| Layer | Component | Failure Impact |\n|-------|-----------|----------------|\n| Application | PSP App | Low — User switches app |\n| Switch | NPCI Central | **Critical** — Full system halt |\n| Settlement | RBI RTGS | High — Delayed settlements |\n\n## Single Points of Failure\n\nDespite its distributed design, UPI concentrates risk at the NPCI layer[^1]...\n\n[^1]: NPCI Annual Report 2024-25, Section 4.2, "System Architecture and Redundancy Protocols."`,
    verdict:
      "The UPI architecture, while technically robust, presents a systemic concentration risk at the NPCI switch layer. The absence of a statutory mandate for redundancy protocols — as exists for RTGS under the Payment and Settlement Systems Act, 2007 — creates a regulatory lacuna that must be addressed before UPI processes exceed 15 billion monthly transactions.",
    footnotes: [
      "NPCI Annual Report 2024-25, Section 4.2",
      "RBI Circular on Payment System Oversight, March 2024",
      "Payment and Settlement Systems Act, 2007, Section 18",
    ],
    relatedSlugs: ["upi-financial-inclusion", "upi-legal-vacuum"],
  },
  {
    slug: "upi-financial-inclusion",
    title: "UPI and the Promise of Financial Inclusion: Rhetoric vs. Reality",
    abstract:
      "This paper interrogates the popular narrative that UPI has democratised financial access in India, presenting field data on digital payment adoption across income quintiles and evaluating the sociological barriers that persist despite technological availability.",
    excerpt:
      "Despite processing 12 billion transactions monthly, UPI's inclusion narrative masks deep disparities. A sociological analysis of who really benefits.",
    date: "Jan 2026",
    readTime: "18 min",
    complexity: "Policy Brief",
    type: "volume-chapter",
    volumeSlug: "upi-system",
    categories: ["sociology", "banking"],
    tags: [
      { label: "#FinancialSociology", className: "tag-sociology" },
      { label: "#BankingLaw", className: "tag-banking" },
    ],
    content:
      "## The Inclusion Narrative\n\nGovernment rhetoric positions UPI as the great equalizer...\n\n## Field Data Analysis\n\nOur analysis of NSSO data reveals...",
    verdict:
      "Financial inclusion through UPI remains aspirational rather than achieved. The digital divide mirrors pre-existing socio-economic stratification, and the absence of affirmative digital literacy mandates under the PMGDISHA framework renders the technology a tool of the already-included.",
    footnotes: ["NSSO 78th Round, Digital Payments Survey", "PMGDISHA Evaluation Report, 2025"],
    relatedSlugs: ["upi-technical-architecture", "upi-legal-vacuum"],
  },
  {
    slug: "upi-legal-vacuum",
    title: "UPI's Legal Vacuum: Who Bears Liability in Failed Transactions?",
    abstract:
      "Despite processing over 12 billion transactions monthly, India's UPI framework operates without a dedicated statute governing dispute resolution or liability allocation. This paper maps the regulatory gap and proposes a framework for statutory reform.",
    excerpt:
      "Despite processing 12 billion transactions monthly, India's UPI framework has no dedicated statute governing dispute resolution. An analysis of the regulatory gap.",
    date: "Dec 2025",
    readTime: "14 min",
    complexity: "Technical Deep-Dive",
    type: "volume-chapter",
    volumeSlug: "upi-system",
    categories: ["banking", "policy"],
    tags: [
      { label: "#BankingLaw", className: "tag-law" },
      { label: "#TechPolicy", className: "tag-tech" },
    ],
    content:
      "## The Regulatory Gap\n\nThe Payment and Settlement Systems Act, 2007 predates UPI by nearly a decade...",
    verdict:
      "The current regulatory framework is inadequate. A dedicated UPI Dispute Resolution Act, modelled on the UK's Payment Services Regulations 2017, is necessary to establish clear liability hierarchies between PSPs, banks, and NPCI.",
    footnotes: [
      "Payment and Settlement Systems Act, 2007",
      "UK Payment Services Regulations 2017",
    ],
    relatedSlugs: ["upi-technical-architecture", "upi-financial-inclusion"],
  },
  {
    slug: "algorithmic-credit-scoring",
    title: "Algorithmic Credit Scoring: Efficiency vs. Constitutional Equality",
    abstract:
      "When machine learning models determine creditworthiness, they risk encoding historical discrimination into automated decision-making systems. This paper examines the tension between algorithmic efficiency in credit markets and the constitutional guarantee of equality under Article 14.",
    excerpt:
      "When machine learning models decide creditworthiness, do they encode historical discrimination? A legal and technical examination.",
    date: "Nov 2025",
    readTime: "16 min",
    complexity: "Technical Deep-Dive",
    type: "volume-chapter",
    volumeSlug: "digital-lending",
    categories: ["tech", "policy", "sociology"],
    tags: [
      { label: "#FinancialSociology", className: "tag-sociology" },
      { label: "#TechPolicy", className: "tag-tech" },
    ],
    content: "## The Algorithmic Promise\n\nTraditional credit scoring relied on...",
    verdict:
      "Algorithmic credit scoring, absent regulatory guardrails mandating explainability and bias audits, risks perpetuating the very inequalities that financial inclusion policies seek to remedy. Article 14 jurisprudence must evolve to encompass algorithmic discrimination.",
    relatedSlugs: ["digital-lending-rbi-guidelines"],
  },
  {
    slug: "digital-lending-rbi-guidelines",
    title: "RBI's Digital Lending Guidelines: A Critical Assessment",
    abstract:
      "The Reserve Bank of India's 2022 Digital Lending Guidelines represented the first comprehensive attempt to regulate the burgeoning fintech lending sector. This paper evaluates their effectiveness two years on.",
    excerpt:
      "Two years after RBI's landmark digital lending guidelines, how effective have they been? A regulatory assessment.",
    date: "Oct 2025",
    readTime: "12 min",
    complexity: "Policy Brief",
    type: "volume-chapter",
    volumeSlug: "digital-lending",
    categories: ["banking", "policy"],
    tags: [
      { label: "#BankingLaw", className: "tag-law" },
      { label: "#TechPolicy", className: "tag-tech" },
    ],
    content: "## The Pre-Regulation Landscape\n\nBefore September 2022...",
    verdict:
      "While the guidelines addressed the most egregious practices, enforcement remains patchy and the First Loss Default Guarantee framework requires significant tightening.",
    relatedSlugs: ["algorithmic-credit-scoring"],
  },
  // Independent posts
  {
    slug: "sociology-financial-exclusion",
    title: "The Sociology of Financial Exclusion in Digital India",
    abstract:
      "Demonetisation pushed millions toward digital payments, but the transition was neither uniform nor equitable. This paper employs Bourdieu's theory of capital to examine how caste, class, and connectivity intersect with digital financial access.",
    excerpt:
      "Demonetisation pushed millions toward digital payments — but who was left behind? Examining caste, class, and connectivity in the cashless narrative.",
    date: "Jan 2026",
    readTime: "18 min",
    complexity: "Technical Deep-Dive",
    type: "independent",
    categories: ["sociology", "banking"],
    tags: [
      { label: "#FinancialSociology", className: "tag-sociology" },
      { label: "#BankingLaw", className: "tag-banking" },
    ],
    content: "## The Demonetisation Shock\n\nOn November 8, 2016...",
    verdict:
      "Financial exclusion in digital India is not a technological failure but a sociological one. Without addressing the structural inequalities in digital capital distribution, payment digitisation risks becoming an instrument of further marginalisation.",
    relatedSlugs: ["upi-financial-inclusion", "open-banking-data-protection"],
  },
  {
    slug: "open-banking-data-protection",
    title: "Open Banking APIs and the Data Protection Conundrum",
    abstract:
      "The Account Aggregator framework promises financial empowerment through data portability, but its consent architecture raises fundamental questions under the Digital Personal Data Protection Act, 2023.",
    excerpt:
      "The Account Aggregator framework promises financial empowerment, but its consent architecture raises questions under the DPDP Act 2023.",
    date: "Dec 2025",
    readTime: "11 min",
    complexity: "Policy Brief",
    type: "independent",
    categories: ["tech", "policy"],
    tags: [
      { label: "#TechPolicy", className: "tag-tech" },
      { label: "#BankingLaw", className: "tag-law" },
    ],
    content: "## The Account Aggregator Promise\n\nLaunched in September 2021...",
    verdict:
      "The AA framework's consent mechanism, while technically robust, fails to meet the 'informed consent' standard envisioned under Section 6 of the DPDP Act. A harmonisation exercise between RBI's AA framework and the DPDP Act's consent provisions is urgently required.",
    relatedSlugs: ["sociology-financial-exclusion", "cbdc-privacy-implications"],
  },
  {
    slug: "cbdc-privacy-implications",
    title: "CBDC and the Surveillance State: Privacy Implications of the Digital Rupee",
    abstract:
      "As the RBI pilots the e₹, this paper examines the privacy implications of a central bank digital currency, drawing comparisons with China's e-CNY and the EU's digital euro framework.",
    excerpt:
      "The Digital Rupee promises efficiency but threatens financial privacy. A comparative analysis of CBDC privacy architectures worldwide.",
    date: "Sep 2025",
    readTime: "20 min",
    complexity: "Technical Deep-Dive",
    type: "independent",
    categories: ["tech", "policy", "banking"],
    tags: [
      { label: "#TechPolicy", className: "tag-tech" },
      { label: "#BankingLaw", className: "tag-banking" },
    ],
    content: "## The Digital Rupee Pilot\n\nThe Reserve Bank of India launched...",
    verdict:
      "Without explicit statutory privacy safeguards — akin to the EU's proposed 'offline functionality' mandate — the Digital Rupee risks becoming an instrument of financial surveillance incompatible with Article 21 privacy jurisprudence as articulated in Puttaswamy.",
    relatedSlugs: ["open-banking-data-protection"],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getVolume(slug: string): Volume | undefined {
  return volumes.find((v) => v.slug === slug);
}

export function getVolumeChapters(volumeSlug: string): Post[] {
  const volume = getVolume(volumeSlug);
  if (!volume) return [];
  return volume.chapters.map((slug) => getPost(slug)).filter(Boolean) as Post[];
}

export function getRelatedPosts(post: Post): Post[] {
  return (post.relatedSlugs || []).map((s) => getPost(s)).filter(Boolean) as Post[];
}

export function getIndependentPosts(): Post[] {
  return posts.filter((p) => p.type === "independent");
}
