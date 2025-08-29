'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  Trophy, 
  BookOpen, 
  BriefcaseIcon, 
  GraduationCap, 
  Zap, 
  TrendingUp,
  Star,
  CheckCircle,
  Rocket,
  Award,
  Brain,
  Clock,
  Users
} from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Target,
      title: "Focus Missions",
      description: "Time-blocked work sessions with website blocking to eliminate distractions.",
      xp: "10-50 XP per session"
    },
    {
      icon: BriefcaseIcon,
      title: "Job Tracker",
      description: "AI-powered application tracking with smart reminders and follow-ups.",
      xp: "25 XP per application"
    },
    {
      icon: GraduationCap,
      title: "Learning Hub",
      description: "Personalized learning paths with skill assessments and progress tracking.",
      xp: "50 XP per completed resource"
    },
    {
      icon: Trophy,
      title: "Achievements",
      description: "Unlock badges and achievements for milestones and consistent activity.",
      xp: "50-1000 XP per achievement"
    }
  ]

  const levelingInfo = [
    {
      level: "1-5",
      title: "Getting Started",
      description: "Complete your first missions and learn the basics",
      xpRange: "0-500 XP"
    },
    {
      level: "6-15",
      title: "Building Momentum",
      description: "Establish routines and unlock more achievements",
      xpRange: "500-2,500 XP"
    },
    {
      level: "16-30",
      title: "Advanced User",
      description: "Master the platform and maintain long streaks",
      xpRange: "2,500-10,000 XP"
    },
    {
      level: "31+",
      title: "JobQuest Master",
      description: "Elite status with maximum productivity and learning",
      xpRange: "10,000+ XP"
    }
  ]

  return (
    <DashboardLayout title="About JobQuest">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            About JobQuest
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your AI-powered companion for focused job searching
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Zap className="h-12 w-12 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobQuest
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your AI-powered companion for focused job searching with gamified productivity and continuous learning.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="px-4 py-2">🚀 AI-Powered</Badge>
            <Badge variant="secondary" className="px-4 py-2">🎯 Focus-Driven</Badge>
            <Badge variant="secondary" className="px-4 py-2">📈 Results-Oriented</Badge>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-0">
          <CardContent className="p-6 text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              To transform the chaotic job search experience into a focused journey of growth and discovery, 
              empowering job seekers with intelligent tools and AI-driven insights.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                    <Badge variant="outline" className="text-xs">{feature.xp}</Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Leveling System */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Leveling Up System</h2>
          <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold mb-2">How XP & Levels Work</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Earn Experience Points (XP) through various activities and level up to unlock new features and achievements.
                </p>
        </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    XP Sources
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Focus missions: 10-50 XP
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Job applications: 25 XP
                  </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Learning resources: 50 XP
                  </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Achievements: 50-1000 XP
                  </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Daily streaks: 10 XP per day
                  </li>
                </ul>
              </div>
              
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Level Progression
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Level = √(Total XP ÷ 100) + 1
                  </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Higher levels require more XP
                  </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Unlock achievements at milestones
                  </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Maintain streaks for bonus XP
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {levelingInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{info.level}</div>
                  <h4 className="font-semibold mb-2">{info.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{info.description}</p>
                  <Badge variant="outline" className="text-xs">{info.xpRange}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-blue-100 mb-6">
              Join thousands of job seekers who have transformed their careers with JobQuest.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4 py-6">
          <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 JobQuest. Built with ❤️ for job seekers everywhere.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}