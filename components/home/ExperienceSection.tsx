"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, MapPin } from "lucide-react"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  const sortedExperience = [...experience].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <Card className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 bg-white/60 backdrop-blur-xl rounded-3xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          Professional Experience
        </h2>
        
        <motion.div 
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {sortedExperience.map((exp) => (
            <motion.div key={exp.id} variants={itemVariants} className="relative group">
              <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent opacity-0 group-last:hidden group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex gap-6 p-6 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md">
                <Avatar className="w-14 h-14 ring-4 ring-white shadow-sm mt-1 z-10 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <AvatarImage src={exp.image || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                    {exp.company.split(" ").map((word) => word[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-700 transition-colors leading-tight">
                        {exp.title}
                      </h3>
                      <p className="text-blue-600 font-semibold mt-1">{exp.company}</p>
                    </div>
                    <Badge variant="secondary" className="w-fit bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      {exp.type}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {exp.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {exp.location}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed text-base">
                    {exp.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  )
}
