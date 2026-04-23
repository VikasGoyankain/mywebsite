"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Github,
  Youtube,
  MessageSquare,
  Clock,
  Send,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useProfileStore } from "@/lib/profile-store"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { Footer } from "@/components/Footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SubscribeButton } from "@/components/subscribe-button"

// Social icon mapping
const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LinkedIn: Linkedin,
  Twitter: Twitter,
  Instagram: Instagram,
  Facebook: Facebook,
  Youtube: Youtube,
  GitHub: Github,
  Mail: Mail,
}

export default function ContactPage() {
  useDatabaseInit()
  const { profileData } = useProfileStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Feel free to reach out through any of the channels below. I'm always open to discussing new opportunities and collaborations.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
                <p className="text-sm text-gray-600">Direct ways to reach me</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <a
                href={`mailto:${profileData.contact.email}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {profileData.contact.email}
                  </p>
                </div>
                <Send className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </a>

              {/* Phone */}
              <a
                href={`tel:${profileData.contact.phone}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <p className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {profileData.contact.phone}
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-base font-semibold text-gray-900">
                    {profileData.contact.location}
                  </p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Availability</p>
                  <p className="text-base font-semibold text-gray-900">
                    {profileData.contact.availability}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Social Media & Profile Card */}
          <div className="space-y-8">
            {/* Profile Quick View */}
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 rounded-2xl shadow-lg mb-4 ring-4 ring-white">
                  <AvatarImage
                    src={profileData.profileImage || "/placeholder.svg"}
                    alt={profileData.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{profileData.name}</h3>
                <p className="text-base text-gray-600 font-medium">{profileData.title}</p>
              </div>
            </Card>

            {/* Social Media Links */}
            <Card className="p-8 bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Social Media</h2>
                  <p className="text-sm text-gray-600">Connect with me online</p>
                </div>
              </div>

              <div className="space-y-4">
                {profileData.socialLinks.map((social) => {
                  const IconComponent = socialIconMap[social.icon] || Globe
                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className={`w-12 h-12 ${social.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {social.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {social.href}
                        </p>
                      </div>
                      <Send className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </a>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Subscribe Section */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to receive updates about my latest work, articles, and insights directly in your inbox.
            </p>
            <SubscribeButton
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            />
          </div>
        </Card>

        <Footer />
      </div>
    </div>
  )
}
