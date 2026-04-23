"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"
import { GraduationCap, Award, Calendar } from "lucide-react"

interface Education {
  id: string
  degree: string
  institution: string
  year: string
  grade: string
  specialization: string
  achievements: string[]
  order: number
}

interface EducationSectionProps {
  education: Education[]
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

export function EducationSection({ education }: EducationSectionProps) {
  const sortedEducation = [...education].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg gold-border flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-gold" />
        </div>
        <div>
          <span className="text-[10px] tracking-[0.28em] uppercase text-gold font-sans">
            Pedigree
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-foreground/95 leading-none mt-1">
            Education
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
        <div
          aria-hidden
          className="absolute left-2 top-2 bottom-2 w-px"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--gold) / 0.5), hsl(var(--gold) / 0.05))",
          }}
        />

        {sortedEducation.map((edu) => (
          <motion.li key={edu.id} variants={itemVariants} className="relative group">
            <span
              className="absolute -left-[19px] sm:-left-[27px] top-2 w-3 h-3 rounded-full bg-obsidian border border-gold/60 group-hover:bg-gold transition-colors duration-500"
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-serif-display text-xl sm:text-2xl text-foreground leading-tight">
                {edu.degree}
              </h3>
              {edu.year && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-sans inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {edu.year}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-sans text-gold/90">{edu.institution}</p>

            {edu.specialization && (
              <p className="mt-2 text-sm italic text-foreground/70 font-sans">
                {edu.specialization}
              </p>
            )}
            {edu.grade && (
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-sans">
                Grade · <span className="text-foreground/80">{edu.grade}</span>
              </p>
            )}

            {edu.achievements && edu.achievements.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {edu.achievements.map((achievement, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground/70 font-sans"
                  >
                    <Award className="w-3.5 h-3.5 text-gold/80 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}
