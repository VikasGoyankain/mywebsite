"use client"

import React, { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Verified, Menu, X } from "lucide-react"
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

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Avatar className="w-10 h-10 ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all duration-300 shadow-md">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={profileName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                {profileName
                  ? profileName.split(" ").map((n) => n[0]).join("")
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{profileName}</span>
                <Verified className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{profileTitle}</span>
            </div>
          </div>

          {/* Desktop Social Links */}
          <div className="hidden md:flex items-center gap-3">
            {socialLinks?.map((social) => (
              <Link
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2.5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gray-50 hover:bg-white relative group border border-gray-100 hover:border-gray-200`}
                aria-label={`Visit ${social.name} profile`}
              >
                <div className={`absolute inset-0 rounded-xl ${social.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <img
                  src={social.icon}
                  alt={social.name}
                  className="w-4 h-4 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                    }
                  }}
                />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button - using state to control menu visibility */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors active:scale-95"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Social Links Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-24 opacity-100 mt-3 pt-3 border-t border-gray-100/50' : 'max-h-0 opacity-0'}`}>
          <div className="flex items-center justify-center gap-4">
            {socialLinks?.map((social) => (
              <Link
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl transition-all duration-200 active:scale-95 relative group bg-gray-50 border border-gray-100`}
                aria-label={`Visit ${social.name} profile`}
              >
                <div className={`absolute inset-0 rounded-xl ${social.color} opacity-5 group-active:opacity-20 transition-opacity`}></div>
                <img
                  src={social.icon}
                  alt={social.name}
                  className="w-5 h-5 relative z-10 opacity-80"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                    }
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
