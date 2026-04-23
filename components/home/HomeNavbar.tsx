"use client"

import React, { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface SocialLink {
  id: number
  name: string
  icon: string
  href: string
  color: string
}

interface HomeNavbarProps {
  profileName: string
  profileTitle: string
  profileImage: string
  socialLinks: SocialLink[]
}

export function HomeNavbar({ profileName, profileTitle, profileImage, socialLinks }: HomeNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { href: "/expertise", label: "Expertise" },
    { href: "/research", label: "Research" },
    { href: "/blog", label: "Journal" },
    { href: "/contact", label: "Inquire" },
  ]

  const initials = profileName
    ? profileName.split(" ").map((n) => n[0]).join("").slice(0, 2)
    : "VG"

  return (
    <header
      className={`sticky top-0 z-50 glass-nav transition-all duration-500 ${
        scrolled ? "py-2" : "py-3 sm:py-4"
      }`}
    >
      <div className="px-4 sm:px-6 max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Identity mark */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="Home">
          <div className="relative">
            <Avatar className="w-9 h-9 gold-border ring-1 ring-gold/30 transition-all duration-300 group-hover:ring-gold/60">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={profileName} />
              <AvatarFallback className="bg-obsidian text-gold font-serif-display font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif-display text-base sm:text-lg text-foreground tracking-tight">
              {profileName || "Vikas Goyanka"}
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.28em] uppercase text-gold font-sans">
              {profileTitle || "Architect"}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className="px-4 py-2 text-sm font-sans text-foreground/80 hover:text-gold transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
            </Link>
          ))}
          <Link
            href="/contact"
            prefetch
            className="ml-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold text-gold-foreground font-sans font-semibold text-xs tracking-wide hover:shadow-gold-soft transition-all"
          >
            Inquire
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full gold-border bg-obsidian-elevated/60 active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4 text-gold" />
          ) : (
            <Menu className="w-4 h-4 text-gold" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
          mobileMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 max-w-6xl mx-auto">
          <nav className="grid grid-cols-2 gap-2 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl glass-panel hover:border-gold/40 transition-all"
              >
                <span className="font-serif-display text-base text-foreground">
                  {link.label}
                </span>
                <ArrowUpRight className="w-4 h-4 text-gold" />
              </Link>
            ))}
          </nav>
          {socialLinks?.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gold/10 flex items-center justify-center gap-3">
              {socialLinks.slice(0, 6).map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full gold-border bg-obsidian-elevated/40 active:scale-95"
                  aria-label={social.name}
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    className="w-4 h-4 opacity-80 invert"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
