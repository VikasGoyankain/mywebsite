"use client"

import React from "react"
import Link from "next/link"
import signature from "@/assets/signature.png"

interface SocialLink {
  id: number
  name: string
  icon: string
  href: string
  color: string
}

interface SignatureFooterProps {
  profileName: string
  socialLinks: SocialLink[]
}

const TICKER = [
  "AAWAAJ MOVEMENT",
  "GAJRAJ ASSOCIATES",
  "NLU DELHI",
  "AI · CONSTITUTIONAL LAW",
  "STANFORD ASPIRANT",
  "COIN CODE & CONSTITUTION",
]

export function SignatureFooter({ profileName, socialLinks }: SignatureFooterProps) {
  const year = new Date().getFullYear()
  return (
    <footer className="relative mt-24 sm:mt-32 border-t border-gold/10 bg-obsidian">
      {/* === Marquee Ticker === */}
      <div className="relative border-y border-gold/10 overflow-hidden bg-obsidian-elevated/40">
        <div className="flex w-max animate-marquee py-4">
          {[...TICKER, ...TICKER].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-6 px-8 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold/70 font-sans whitespace-nowrap"
            >
              <span className="w-1 h-1 rounded-full bg-gold/50" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* === Mega Footer === */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Identity column */}
          <div className="md:col-span-5">
            <h3 className="font-serif-display text-3xl sm:text-4xl text-foreground tracking-tight">
              {profileName || "Vikas Goyanka"}
            </h3>
            <div className="mt-2 text-[10px] tracking-[0.32em] uppercase text-gold font-sans">
              The Obsidian Architect
            </div>
            {/* Signature */}
            <div className="mt-8 max-w-[260px]">
              <img
                src={signature.src}
                alt={`${profileName || "Vikas Goyanka"} signature`}
                className="w-full h-auto signature-gold opacity-90"
              />
              <div className="gold-rule mt-3" />
            </div>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] tracking-[0.32em] uppercase text-gold font-sans mb-5">
              Practice
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              {[
                { label: "Expertise", href: "/expertise" },
                { label: "Research", href: "/research" },
                { label: "Coin Code & Constitution", href: "/blog" },
                { label: "Journal", href: "/blog" },
                { label: "Strategic Inquiry", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-foreground/70 hover:text-gold transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-px bg-gold/40 group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vision column */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] tracking-[0.32em] uppercase text-gold font-sans mb-5">
              The Vision
            </h4>
            <p className="font-serif-display text-xl leading-snug text-foreground/85 italic">
              "Building the bridge between Indian Jurisprudence and Artificial Intelligence."
            </p>
            {socialLinks?.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-9 h-9 rounded-full gold-border bg-obsidian-elevated/60 flex items-center justify-center hover:border-gold/60 hover:shadow-gold-soft transition-all duration-500 group"
                  >
                    <img
                      src={social.icon}
                      alt={social.name}
                      className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 invert transition-opacity"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-14 pt-6 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] tracking-[0.24em] uppercase text-muted-foreground font-sans">
          <span>© {year} {profileName || "Vikas Goyanka"} — All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-gold-pulse" />
            Current Location · Delhi / Palo Alto
          </span>
        </div>
      </div>
    </footer>
  )
}
