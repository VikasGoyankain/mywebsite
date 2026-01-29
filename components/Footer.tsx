"use client";

import React from 'react';
import Link from 'next/link';
import { useProfileStore } from '@/lib/profile-store';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Linkedin,
  Twitter,
  Instagram,
  Send,
  Facebook,
  Github,
  Youtube,
  Users
} from 'lucide-react';
import { useDatabaseInit } from '@/hooks/use-database-init';

// Icon mapping for social media
const getIconComponent = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case 'linkedin':
      return Linkedin;
    case 'twitter':
      return Twitter;
    case 'instagram':
      return Instagram;
    case 'telegram':
      return Send;
    case 'facebook':
      return Facebook;
    case 'github':
      return Github;
    case 'youtube':
      return Youtube;
    default:
      return Users;
  }
};

export function Footer() {
  useDatabaseInit(); // Initialize database connection (loads profile + footer config)
  const { profileData, footerConfig } = useProfileStore();

  if (!footerConfig) {
    return null; // Don't render if config not loaded
  }

  // Determine which name/image/bio to use based on toggle settings
  const displayName = footerConfig.useProfileName ? profileData.name : footerConfig.customName;
  const displayImage = footerConfig.useProfileImage ? profileData.profileImage : footerConfig.customImage;
  const displayBio = footerConfig.useProfileBio ? profileData.bio : footerConfig.customBio;
  const displayTitle = profileData.title; // Always from profile

  // Use social links from footer config if available, otherwise from profile
  const displaySocialLinks = footerConfig.socialLinks && footerConfig.socialLinks.length > 0 
    ? footerConfig.socialLinks 
    : profileData.socialLinks;

  // Safety check for displayName
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-12 h-12">
                <AvatarImage src={displayImage || "/placeholder.svg"} alt={displayName || "Profile"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{displayName || "My Site"}</h3>
                <p className="text-gray-300">{displayTitle}</p>
              </div>
            </div>
            {displayBio && (
              <p className="text-gray-300 mb-4 max-w-md">
                {displayBio}
              </p>
            )}
            <div className="flex gap-4">
              {displaySocialLinks.map((social) => {
                const IconComponent = getIconComponent(social.name || social.href);
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              {footerConfig.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              {footerConfig.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {displayName}. All rights reserved. | {footerConfig.copyrightMessage}
          </p>
        </div>
      </div>
    </footer>
  );
}
