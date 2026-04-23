"use client"

import React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Verified, Phone, Mail, MapPin, Globe } from "lucide-react"
import Link from "next/link"
import { SubscribeButton } from "@/components/subscribe-button"
import * as LucideIcons from "lucide-react"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
}

export function HeroSection({ profileData, navigationButtons }: HeroSectionProps) {
  return (
    <motion.div 
      className="mb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col lg:flex-row gap-10 mb-12">
        {/* Profile Picture & Contact */}
        <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start group">
          <div className="relative mb-8">
            {/* Animated background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-1.5 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-md border border-white/40 ring-1 ring-black/5">
              <Avatar className="w-full h-full rounded-2xl shadow-inner">
                <AvatarImage
                  src={profileData.profileImage || "/placeholder.svg"}
                  alt={`${profileData.name} - ${profileData.title}`}
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl">
                  {profileData.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Contact Info Card */}
          <Card className="p-6 w-full max-w-sm bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Details
            </h3>
            <div className="space-y-4 text-sm font-medium">
              <a
                href={`mailto:${profileData.contact.email}`}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group/link p-2 -mx-2 rounded-lg hover:bg-blue-50/50"
              >
                <div className="bg-blue-100/50 p-2 rounded-lg group-hover/link:bg-blue-100 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <span className="truncate">{profileData.contact.email}</span>
              </a>
              <a
                href={`tel:${profileData.contact.phone}`}
                className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors group/link p-2 -mx-2 rounded-lg hover:bg-purple-50/50"
              >
                <div className="bg-purple-100/50 p-2 rounded-lg group-hover/link:bg-purple-100 transition-colors">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <span>{profileData.contact.phone}</span>
              </a>
              <div className="flex items-center gap-3 text-gray-700 p-2 -mx-2 rounded-lg">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <span>{profileData.contact.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-2 -mx-2 rounded-lg">
                <div className="bg-green-100/50 p-2 rounded-lg">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-green-700">{profileData.contact.availability}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Info */}
        <motion.div variants={itemVariants} className="flex-1 mt-4 lg:mt-0">
          <div className="mb-8">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight mb-4 flex items-center gap-4 py-1"
            >
              {profileData.name}
              <Verified className="w-8 h-8 md:w-10 md:h-10 text-blue-500 drop-shadow-md" />
            </motion.h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {profileData.badges.map((badge, idx) => {
                const IconComponent = (LucideIcons as any)[badge.icon] || LucideIcons.Award
                return (
                  <motion.div 
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Badge className={`${badge.color} px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border-white/20 backdrop-blur-md`}>
                      <IconComponent className="w-4 h-4 mr-2 opacity-80" />
                      {badge.text}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="prose prose-lg text-gray-700 mb-10 max-w-3xl">
            <p className="text-xl leading-relaxed text-gray-600 font-medium">
              {profileData.bio}
            </p>
            <div className="mt-8 space-y-3">
              {profileData.specializations.map((spec, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-lg">{spec}</span>
                </div>
              ))}
            </div>
            
            {/* Subscribe Button */}
            <motion.div 
              className="mt-10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SubscribeButton
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 h-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 text-lg font-semibold w-full sm:w-auto"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Buttons Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {navigationButtons.map((button, idx) => {
          const IconComponent = (LucideIcons as any)[button.icon] || LucideIcons.Square
          return (
            <motion.div
              key={button.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href={button.href} className="block h-full group">
                <Card className="h-full p-6 text-center border border-white/60 bg-white/40 hover:bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-3xl overflow-hidden relative">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${button.color}`}></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-16 h-16 ${button.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-xl rotate-3 group-hover:-rotate-3`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2">
                      {button.text}
                    </h3>
                    {button.description && (
                      <p className="text-sm text-gray-500 font-medium">{button.description}</p>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
