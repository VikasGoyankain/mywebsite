export interface ResearchStudy {
  id: string
  title: string
  abstract: string
  year: number
  domain: string
  tags: string[]
  fileUrl?: string
  externalUrl?: string
  imageUrl?: string
  publishedIn?: string
  author: string
  publishedAt: string
  featured: boolean
  views: number
}

export enum ResearchDomain {
  LAW = "Law",
  CONSTITUTION = "Constitutional Law",
  HUMAN_RIGHTS = "Human Rights",
  POLITICS = "Politics",
  EDUCATION = "Education Policy",
  GOVERNANCE = "Governance",
  ENVIRONMENT = "Environmental Law",
  TECHNOLOGY = "Technology & Law",
  SOCIAL_JUSTICE = "Social Justice",
  OTHER = "Other"
}

export const DEFAULT_RESEARCH_STUDIES: ResearchStudy[] = [
  {
    id: "1",
    title: "The Impact of Constitutional Amendments on Fundamental Rights in India",
    abstract:
      "This study explores how the multiple amendments to the Indian Constitution have affected the interpretation and application of fundamental rights over the decades.",
    year: 2023,
    domain: ResearchDomain.CONSTITUTION,
    tags: ["Constitution", "Fundamental Rights", "Amendments", "Supreme Court", "Legal History"],
    fileUrl: "/placeholder-pdf.pdf",
    imageUrl: "/placeholder.svg?height=400&width=600",
    publishedIn: "Indian Constitutional Law Review",
    author: "Vikas Goyanka",
    publishedAt: "2023-05-15",
    featured: true,
    views: 320
  },
  {
    id: "2",
    title: "Judicial Activism and Environmental Protection: Case Studies from National Green Tribunal",
    abstract:
      "A comprehensive analysis of landmark judgments by the National Green Tribunal and their impact on environmental protection and policy-making in India.",
    year: 2022,
    domain: ResearchDomain.ENVIRONMENT,
    tags: ["Environment", "Judicial Activism", "National Green Tribunal", "Policy Impact", "Case Study"],
    fileUrl: "/placeholder-pdf.pdf",
    externalUrl: "https://example.com/research/environmental-justice",
    imageUrl: "/placeholder.svg?height=400&width=600",
    publishedIn: "Environmental Law Journal",
    author: "Vikas Goyanka",
    publishedAt: "2022-11-10",
    featured: true,
    views: 275
  },
  {
    id: "3",
    title: "Digital Privacy and State Surveillance: Balancing Security and Civil Liberties",
    abstract:
      "This paper examines the legal framework governing digital surveillance by state agencies and proposes reforms to better protect citizen privacy while maintaining national security.",
    year: 2023,
    domain: ResearchDomain.TECHNOLOGY,
    tags: ["Digital Privacy", "Surveillance", "Technology Law", "Civil Liberties", "Security"],
    externalUrl: "https://example.com/research/digital-privacy",
    imageUrl: "/placeholder.svg?height=400&width=600",
    publishedIn: "Tech Law Forum",
    author: "Vikas Goyanka",
    publishedAt: "2023-08-22",
    featured: false,
    views: 189
  },
  {
    id: "4",
    title: "Access to Justice: Legal Aid Programs and Their Effectiveness in Rural India",
    abstract:
      "An empirical study measuring the reach and effectiveness of government legal aid programs in rural areas, with recommendations for improving access to justice for marginalized communities.",
    year: 2022,
    domain: ResearchDomain.SOCIAL_JUSTICE,
    tags: ["Legal Aid", "Access to Justice", "Rural Communities", "Empirical Study", "Social Impact"],
    fileUrl: "/placeholder-pdf.pdf",
    imageUrl: "/placeholder.svg?height=400&width=600",
    publishedIn: "Social Justice Review",
    author: "Vikas Goyanka",
    publishedAt: "2022-04-30",
    featured: false,
    views: 210
  }
]; 