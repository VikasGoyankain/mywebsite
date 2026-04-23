"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"
import { Briefcase, Clock, MapPin, GraduationCap } from "lucide-react"

interface Experience {
  id: string
  title: string
  company: string
  duration: string
  location: string
  description: string
  type: string
  image: string
  order: number
}

interface ExperienceSectionProps {
  experience: Experience[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 28, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  const sortedExperience = [...experience].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg gold-border flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-gold" />
        </div>
        <div>
          <span className="text-[10px] tracking-[0.28em] uppercase text-gold font-sans">
            Track Record
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-foreground/95 leading-none mt-1">
            Ventures &amp; Roles
          </h2>
        </div>
      </div>

      <motion.ol
        className="relative space-y-7 pl-6 sm:pl-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Vertical gold spine */}
        <div
          aria-hidden
          className="absolute left-2 top-2 bottom-2 w-px"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--gold) / 0.5), hsl(var(--gold) / 0.05))",
          }}
        />

        {sortedExperience.map((exp) => (
          <motion.li key={exp.id} variants={itemVariants} className="relative group">
            {/* Node */}
            <span
              className="absolute -left-[19px] sm:-left-[27px] top-2 w-3 h-3 rounded-full bg-obsidian border border-gold/60 group-hover:bg-gold transition-colors duration-500"
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-serif-display text-xl sm:text-2xl text-foreground leading-tight">
                {exp.title}
              </h3>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-sans">
                {exp.type}
              </span>
            </div>
            <p className="mt-1 text-sm font-sans text-gold/90">{exp.company}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-muted-foreground font-sans">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {exp.duration}
              </span>
              {exp.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {exp.location}
                </span>
              )}
            </div>
            {exp.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/70 font-sans max-w-prose">
                {exp.description}
              </p>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}
