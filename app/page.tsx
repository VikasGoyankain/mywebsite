import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
  Heart,
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  Star,
  MessageSquare,
  FileText,
  Users,
  Gavel,
  Globe,
  Verified,
  Send,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ModernProfile() {
  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/vikasgoyanka.in/", color: "text-pink-600" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://in.linkedin.com/in/vikas-goyanka-1a483a342",
      color: "text-blue-700",
    },
    { name: "Telegram", icon: Send, href: "https://t.me/Vikasgoyanka_in", color: "text-blue-500" },
    { name: "X (Twitter)", icon: Twitter, href: "https://x.com/vikasgoyanka_in", color: "text-gray-900" },
  ]

  const navigationPages = [
    {
      title: "Research Studies",
      description: "Constitutional Law & Policy Research",
      icon: FileText,
      href: "/research",
      color: "bg-blue-500",
    },
    {
      title: "Contact Me",
      description: "Get in touch for consultations",
      icon: MessageSquare,
      href: "/contact",
      color: "bg-green-500",
    },
    {
      title: "Speaking Events",
      description: "Book me for conferences",
      icon: Users,
      href: "/speaking",
      color: "bg-orange-500",
    },
    {
      title: "Legal Aid",
      description: "Free consultation program",
      icon: Gavel,
      href: "/legal-aid",
      color: "bg-red-500",
    },
  ]

  const experience = [
    {
      title: "Legal Research Intern",
      company: "Supreme Court of India",
      duration: "Jan 2024 - Present",
      location: "New Delhi",
      description:
        "Conducting research on constitutional law cases, drafting legal briefs, and assisting senior advocates in landmark cases.",
      logo: "/placeholder.svg?height=48&width=48",
      type: "Internship",
    },
    {
      title: "Youth Wing Secretary",
      company: "Indian National Congress",
      duration: "Mar 2023 - Present",
      location: "Delhi Pradesh",
      description:
        "Leading youth engagement initiatives, organizing policy discussions, and coordinating grassroots campaigns.",
      logo: "/placeholder.svg?height=48&width=48",
      type: "Leadership",
    },
    {
      title: "Legal Aid Coordinator",
      company: "Delhi Legal Services Authority",
      duration: "Jun 2022 - Dec 2023",
      location: "New Delhi",
      description:
        "Coordinated free legal aid camps, provided legal literacy programs, and assisted in pro bono cases.",
      logo: "/placeholder.svg?height=48&width=48",
      type: "Volunteer",
    },
  ]

  const education = [
    {
      degree: "Bachelor of Laws (LLB)",
      institution: "National Law University Delhi",
      year: "2021 - 2024",
      grade: "CGPA: 8.7/10",
      specialization: "Constitutional Law & Human Rights",
      achievements: ["Dean's List 2023", "Best Moot Court Performance", "Research Excellence Award"],
    },
    {
      degree: "Bachelor of Arts (Political Science)",
      institution: "University of Delhi",
      year: "2018 - 2021",
      grade: "First Class (78%)",
      specialization: "Public Policy & Governance",
      achievements: ["Gold Medalist", "Student Union President", "Debate Society Captain"],
    },
  ]

  const skills = [
    { name: "Constitutional Law", level: 95, category: "Legal" },
    { name: "Criminal Law", level: 88, category: "Legal" },
    { name: "Public Policy Analysis", level: 92, category: "Policy" },
    { name: "Legal Research", level: 96, category: "Research" },
    { name: "Public Speaking", level: 94, category: "Communication" },
    { name: "Campaign Management", level: 85, category: "Political" },
    { name: "Community Organizing", level: 90, category: "Social" },
    { name: "Legal Writing", level: 93, category: "Communication" },
  ]

  const posts = [
    {
      image: "/placeholder.svg?height=400&width=400",
      title: "Legal Aid Camp Success",
      date: "2 days ago",
      category: "Social Work",
    },
    {
      image: "/placeholder.svg?height=400&width=400",
      title: "Youth Leadership Summit",
      date: "1 week ago",
      category: "Politics",
    },
    {
      image: "/placeholder.svg?height=400&width=400",
      title: "Constitutional Law Seminar",
      date: "2 weeks ago",
      category: "Education",
    },
    {
      image: "/placeholder.svg?height=400&width=400",
      title: "Policy Research Presentation",
      date: "3 weeks ago",
      category: "Research",
    },
    {
      image: "/placeholder.svg?height=400&width=400",
      title: "Community Outreach Program",
      date: "1 month ago",
      category: "Social Work",
    },
    {
      image: "/placeholder.svg?height=400&width=400",
      title: "Moot Court Competition",
      date: "1 month ago",
      category: "Legal",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>VG</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Vikas Goyanka</span>
                  <Verified className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm text-gray-600">Law Student & Political Activist</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-8">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Profile Picture & Contact */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative mb-6">
                  <Avatar className="w-36 h-36 md:w-44 md:h-44 ring-4 ring-blue-500 ring-offset-4">
                    <AvatarImage src="/placeholder.svg?height=176&width=176" alt="Vikas Goyanka" />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      VG
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Contact Info Card */}
                <Card className="p-4 w-full max-w-sm bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      <span>contact@vikasgoyanka.in</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span>+917597441305</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>New Delhi, India</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Globe className="w-4 h-4" />
                      <span>Available for consultations</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    Vikas Goyanka
                    <Verified className="w-7 h-7 text-blue-500" />
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      Law Student
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                      <Gavel className="w-4 h-4 mr-1" />
                      Legal Researcher
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      <Users className="w-4 h-4 mr-1" />
                      Political Activist
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                      <Heart className="w-4 h-4 mr-1" />
                      Social Worker
                    </Badge>
                  </div>
                </div>

                <div className="prose prose-lg text-gray-700 mb-8">
                  <p className="text-lg leading-relaxed">
                    Passionate advocate for constitutional rights and social justice. Currently pursuing LLB while
                    actively engaging in policy research and grassroots political work. Dedicated to bridging the gap
                    between legal theory and practical governance to create meaningful change in Indian society.
                  </p>
                  <p className="text-base text-gray-600 mt-4">
                    🏛️ Specializing in Constitutional Law & Human Rights
                    <br />📊 Policy Research & Analysis
                    <br />
                    🗳️ Youth Political Engagement
                    <br />
                    ⚖️ Legal Aid & Community Service
                  </p>
                  {/* Subscribe Button */}
                  <div className="mt-6">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                      <Mail className="w-4 h-4 mr-2" />
                      Subscribe to Updates
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Navigation Pages */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {navigationPages.map((page, index) => (
                <Link key={index} href={page.href} className="group">
                  <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                    <div
                      className={`w-12 h-12 ${page.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <page.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{page.title}</h3>
                    <p className="text-xs text-gray-600">{page.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Experience */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Professional Experience
                </h2>
                <div className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index} className="relative">
                      <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100">
                        <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
                          <AvatarImage src={exp.logo || "/placeholder.svg"} />
                          <AvatarFallback className="bg-blue-600 text-white font-bold">
                            {exp.company
                              .split(" ")
                              .map((word) => word[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                              <p className="text-blue-600 font-semibold">{exp.company}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {exp.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exp.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {exp.location}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Education & Skills */}
            <div className="space-y-6">
              {/* Education */}
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                  Education
                </h2>
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="relative">
                      <div className="border-l-4 border-purple-500 pl-6 pb-6">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-900 mb-1">{edu.degree}</h3>
                        <p className="text-purple-600 font-semibold mb-1">{edu.institution}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span>{edu.year}</span>
                          <span className="font-medium text-green-600">{edu.grade}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{edu.specialization}</p>
                        <div className="space-y-1">
                          {edu.achievements.map((achievement, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Award className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Skills */}
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Core Skills
                </h2>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                          <span className="text-sm text-gray-600">{skill.level}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button className="flex items-center gap-2 text-gray-900 border-t-2 border-gray-900 pt-4 px-4">
                <div className="w-4 h-4 border-2 border-gray-900"></div>
                <span className="font-semibold">RECENT WORK</span>
              </button>
              <button className="flex items-center gap-2 text-gray-500 pt-4 px-4 hover:text-gray-700">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">ARTICLES</span>
              </button>
              <button className="flex items-center gap-2 text-gray-500 pt-4 px-4 hover:text-gray-700">
                <Award className="w-4 h-4" />
                <span className="font-medium">ACHIEVEMENTS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">{post.category}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600">{post.date}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white mt-16">
          <div className="px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">VG</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">Vikas Goyanka</h3>
                    <p className="text-gray-300">Law Student & Political Activist</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 max-w-md">
                  Committed to advancing constitutional rights, social justice, and democratic values through legal
                  advocacy and political engagement.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <social.icon className="w-5 h-5" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      About Me
                    </Link>
                  </li>
                  <li>
                    <Link href="/research" className="hover:text-white transition-colors">
                      Research
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/speaking" className="hover:text-white transition-colors">
                      Speaking
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="hover:text-white transition-colors">
                      Legal Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} Vikas Goyanka. All rights reserved. | Building a just society through
                law and advocacy.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
