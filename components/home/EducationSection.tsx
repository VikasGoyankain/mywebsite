"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { GraduationCap, Award, Calendar, BookOpen } from "lucide-react"

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
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
}

export function EducationSection({ education }: EducationSectionProps) {
  const sortedEducation = [...education].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <Card className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 bg-white/60 backdrop-blur-xl rounded-3xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-2xl">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          Education Journey
        </h2>
        
        <motion.div 
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {sortedEducation.map((edu) => (
            <motion.div key={edu.id} variants={itemVariants} className="relative group">
              <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-transparent opacity-0 group-last:hidden group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex gap-5 p-5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-blue-50/40 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md">
                <div className="mt-1 flex-shrink-0 z-10">
                   <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <BookOpen className="w-6 h-6 text-purple-500" />
                   </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors leading-tight mb-1">
                    {edu.degree}
                  </h3>
                  <p className="text-purple-600 font-semibold mb-3">{edu.institution}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium mb-3">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.year}
                    </div>
                    {edu.grade && (
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                        <Award className="w-3.5 h-3.5" />
                        {edu.grade}
                      </div>
                    )}
                  </div>
                  
                  {edu.specialization && (
                    <p className="text-sm text-gray-600 mb-4 pb-3 border-b border-gray-100 italic">
                      Specialization in <span className="font-medium text-gray-700">{edu.specialization}</span>
                    </p>
                  )}
                  
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Achievements</h4>
                      {edu.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  )
}
