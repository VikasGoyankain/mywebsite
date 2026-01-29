"use client";

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
  useDatabaseInit(); // Initialize database connection
  const { profileData } = useProfileStore();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt={profileData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{profileData.name}</h3>
                <p className="text-gray-300">{profileData.title}</p>
              </div>
            </div>            <p className="text-gray-300 mb-4 max-w-md">
              Committed to advancing constitutional rights, social justice, and democratic values through legal advocacy and political engagement.
            </p>
            <div className="flex gap-4">
              {profileData.socialLinks.map((social) => {
                const IconComponent = getIconComponent(social.name);
                return (
                  <Link
                    key={social.id}
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
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/posts" className="hover:text-white transition-colors">
                  Posts
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/casevault" className="hover:text-white transition-colors">
                  Case Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
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
            &copy; {new Date().getFullYear()} {profileData.name}. All rights reserved. | Building a just society
            through law and advocacy.
          </p>
        </div>
      </div>
    </footer>
  );
}
