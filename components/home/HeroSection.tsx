"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"
import { Verified, Mail, MapPin, ArrowUpRight, Sparkles } from "lucide-react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import portrait from "@/assets/vikas-portrait.png"

interface BadgeData {
  id: number
  text: string
  icon: string
  color: string
}

interface NavButton {
  id: string
  text: string
  href: string
  icon: string
  description: string
  color: string
}

interface ContactData {
  email: string
  phone: string
  location: string
  availability: string
}

interface HeroSectionProps {
  profileData: {
    name: string
    title: string
    bio: string
    profileImage: string
    specializations: string[]
    contact: ContactData
    badges: BadgeData[]
  }
  navigationButtons: NavButton[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

export function HeroSection({ profileData, navigationButtons }: HeroSectionProps) {
  const nameParts = profileData.name?.split(" ") || ["Vikas", "Goyanka"]
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(" ")

  return (
    <motion.div 
      className="mb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* === HERO PORTRAIT + NAME === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pt-6 sm:pt-10 lg:pt-16">
        {/* Portrait — LCP image */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 order-1 lg:order-1 relative"
        >
          <div className="relative mx-auto max-w-[360px] lg:max-w-none">
            {/* Gold glow halo */}
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-50 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 30%, hsl(var(--gold) / 0.25), transparent 70%)",
              }}
            />
            <div className="relative rounded-[1.75rem] overflow-hidden gold-border shadow-gold-glow bg-obsidian-elevated">
              {/* Frosted brass top bar */}
              <div className="absolute top-0 left-0 right-0 h-10 z-20 flex items-center justify-between px-4 glass-nav">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-gold-pulse" />
                  <span className="text-[10px] tracking-[0.2em] text-gold uppercase font-sans">
                    Live · Delhi
                  </span>
                </div>
                <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-sans">
                  MMXXVI
                </span>
              </div>
              <div className="aspect-[4/5] relative">
                <img
                  src={portrait.src}
                  alt={`${profileData.name} — ${profileData.title}`}
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                {/* Bottom vignette */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
                {/* Verified seal */}
                <div className="absolute bottom-4 right-4 z-10 glass-panel rounded-full px-3 py-1.5 flex items-center gap-2">
                  <Verified className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] tracking-[0.18em] uppercase text-foreground/90 font-sans">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Headline + identity */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 order-2 lg:order-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold/60" />
            <span className="text-[10px] sm:text-xs tracking-[0.32em] uppercase text-gold font-sans">
              The Obsidian Architect
            </span>
          </div>

          <h1 className="font-serif-display text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-[6.5rem] lg:leading-[0.92] font-light tracking-tight">
            <span className="block text-foreground/95">{firstName}</span>
            <span className="block gold-text italic font-medium">{lastName}</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl font-sans">
            {profileData.bio ||
              "Building the bridge between Indian Jurisprudence and Artificial Intelligence — from NLU Delhi to Stanford."}
          </p>

          {/* Specializations as gold-divided list */}
          {profileData.specializations?.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-sans tracking-wide text-foreground/70">
              {profileData.specializations.slice(0, 4).map((spec, i) => (
                <React.Fragment key={spec}>
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-gold/60" />}
                  <span className="uppercase tracking-[0.18em]">{spec}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gold text-gold-foreground font-sans font-semibold text-sm tracking-wide shadow-gold-glow hover:shadow-gold-soft transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              Strategic Inquiry
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/expertise"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full glass-panel text-foreground font-sans font-medium text-sm tracking-wide hover:border-gold/40 transition-all duration-300"
            >
              View Expertise
              <ArrowUpRight className="w-4 h-4 opacity-60 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Quick contact line */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-sans text-muted-foreground">
            {profileData.contact?.email && (
              <a
                href={`mailto:${profileData.contact.email}`}
                className="inline-flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {profileData.contact.email}
              </a>
            )}
            {profileData.contact?.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold/70" />
                {profileData.contact.location}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* === POWER HUB — Bento Navigation === */}
      {navigationButtons?.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-20 sm:mt-28"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.32em] uppercase text-gold font-sans">
                The Command Center
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl mt-2 text-foreground/95">
                Navigate the Practice
              </h2>
            </div>
            <div className="hidden sm:block gold-rule flex-1 ml-8 mb-3" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {navigationButtons.map((button, idx) => {
              const IconComponent =
                (LucideIcons as any)[button.icon] || LucideIcons.ArrowUpRight
              const wide = idx === 0 && navigationButtons.length === 3
              return (
                <Link
                  key={button.id}
                  href={button.href}
                  prefetch
                  className={`group relative overflow-hidden rounded-2xl glass-panel p-5 sm:p-6 hover:border-gold/40 transition-all duration-500 hover:-translate-y-1 ${
                    wide ? "col-span-2" : ""
                  }`}
                >
                  {/* Hover gold sweep */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 50% 0%, hsl(var(--gold) / 0.08), transparent 60%)",
                    }}
                  />
                  <div className="relative z-10 flex flex-col h-full min-h-[150px] sm:min-h-[180px] justify-between">
                    <div className="w-11 h-11 rounded-xl gold-border bg-obsidian-elevated/60 flex items-center justify-center group-hover:shadow-gold-soft transition-all duration-500">
                      <IconComponent className="w-5 h-5 text-gold" />
                    </div>
                    <div className="mt-6">
                      <h3 className="font-serif-display text-xl sm:text-2xl text-foreground leading-tight">
                        {button.text}
                      </h3>
                      {button.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground font-sans line-clamp-2">
                          {button.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground group-hover:text-gold transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
