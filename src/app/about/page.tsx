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
  Heart,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Award,
  Lightbulb,
  Globe,
  Code,
  Smartphone,
  Laptop,
  Database,
  Lock,
  Eye,
  Brain,
  Rocket,
  Sparkles,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  Search,
  Filter,
  Bell,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      setAnimatedStats([10000, 5000, 25000, 15000])
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: Target,
      title: "Focus Missions",
      description: "Time-blocked work sessions with intelligent website blocking to eliminate distractions and maximize productivity during your job search.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      benefits: ["Eliminate distractions", "Track focus time", "Build productive habits"]
    },
    {
      icon: BriefcaseIcon,
      title: "Smart Job Tracker",
      description: "AI-powered application tracking with intelligent reminders, interview scheduling, and follow-up automation.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      benefits: ["Never miss deadlines", "Track application status", "Automated follow-ups"]
    },
    {
      icon: GraduationCap,
      title: "Learning Hub",
      description: "Personalized learning paths with skill assessments, curated resources, and progress tracking for career growth.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      benefits: ["Skill gap analysis", "Curated resources", "Progress tracking"]
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Gamified progress tracking with XP, levels, streaks, and unlockable achievements to keep you motivated.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      benefits: ["Stay motivated", "Track milestones", "Celebrate wins"]
    },
    {
      icon: BookOpen,
      title: "Reflection Journal",
      description: "AI-enhanced journaling with insights, mood tracking, and actionable feedback for personal growth.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      benefits: ["Track progress", "Gain insights", "Personal growth"]
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics with visual insights into your job search progress, focus time, and success metrics.",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      benefits: ["Visual progress", "Data insights", "Success metrics"]
    }
  ]

  const stats = [
    { label: "Focus Sessions", value: "10,000+", icon: Target, suffix: "+" },
    { label: "Applications Tracked", value: "5,000+", icon: BriefcaseIcon, suffix: "+" },
    { label: "Learning Hours", value: "25,000+", icon: GraduationCap, suffix: "+" },
    { label: "Achievements Unlocked", value: "15,000+", icon: Trophy, suffix: "+" }
  ]

  const values = [
    {
      icon: Heart,
      title: "Human-Centered Design",
      description: "Every feature is crafted with your wellbeing in mind. We believe job searching should be empowering, not overwhelming.",
      color: "text-red-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data belongs to you. We use enterprise-grade encryption and never sell your personal information.",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by job seekers, for job seekers. We understand the challenges because we've been there too.",
      color: "text-blue-500"
    },
    {
      icon: Star,
      title: "Excellence Focused",
      description: "We're committed to creating the best possible experience through continuous improvement and user feedback.",
      color: "text-yellow-500"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "TechCorp",
      content: "JobQuest transformed my job search from chaotic to structured. The focus sessions helped me stay productive, and I landed my dream job in 3 months!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Manager",
      company: "Growth Inc",
      content: "The learning resources and achievement system kept me motivated throughout my 6-month job search. Highly recommend!",
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "UX Designer",
      company: "Design Studio",
      content: "The application tracker and analytics helped me understand what was working. I improved my interview success rate by 40%.",
      avatar: "EW"
    }
  ]

  const techStack = [
    { name: "Next.js 14", icon: Code, description: "Modern React framework" },
    { name: "TypeScript", icon: Code, description: "Type-safe development" },
    { name: "Prisma", icon: Database, description: "Database ORM" },
    { name: "Tailwind CSS", icon: Code, description: "Utility-first styling" },
    { name: "OpenAI API", icon: Brain, description: "AI-powered features" },
    { name: "Chrome Extension", icon: Globe, description: "Focus blocking" }
  ]

  return (
    <DashboardLayout title="About JobQuest">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className={`text-center space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="relative">
              <Zap className="h-16 w-16 text-yellow-400 animate-pulse" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              JobQuest
            </h1>
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered companion for navigating the modern job search with 
            <span className="font-semibold text-blue-600"> focus</span>, 
            <span className="font-semibold text-green-600"> organization</span>, and 
            <span className="font-semibold text-purple-600"> continuous learning</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
              🚀 AI-Powered
            </Badge>
            <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
              🎯 Focus-Driven
            </Badge>
            <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              📈 Results-Oriented
            </Badge>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-gray-700 dark:text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
              To empower job seekers with intelligent tools, structured workflows, and AI-driven insights that transform 
              the chaotic job search experience into a focused journey of growth and discovery. We believe everyone 
              deserves to find meaningful work without sacrificing their wellbeing.
            </p>
            <div className="flex justify-center mt-8">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Your Success</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to conduct an effective, focused job search while maintaining your wellbeing
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className={`hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 ${feature.bgColor}`}>
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Animated Stats */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-white">Impact by the Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center space-y-4 group">
                    <div className="relative">
                      <Icon className="h-12 w-12 mx-auto text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    </div>
                    <div className="text-4xl font-bold text-white">
                      {animatedStats[index].toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-blue-200 font-medium">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">How JobQuest Works</CardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300">Your journey to success in 4 simple steps</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Set Your Focus",
                  description: "Start with Focus Missions to eliminate distractions and dedicate quality time to your job search.",
                  icon: Target,
                  color: "bg-blue-600"
                },
                {
                  step: "2",
                  title: "Track Applications",
                  description: "Organize all your job applications, interviews, and follow-ups with smart reminders.",
                  icon: BriefcaseIcon,
                  color: "bg-green-600"
                },
                {
                  step: "3",
                  title: "Learn & Grow",
                  description: "Enhance your skills with personalized learning resources and track your progress.",
                  icon: GraduationCap,
                  color: "bg-purple-600"
                },
                {
                  step: "4",
                  title: "Stay Motivated",
                  description: "Earn achievements, maintain streaks, and visualize your progress to stay motivated.",
                  icon: Trophy,
                  color: "bg-yellow-600"
                }
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="text-center space-y-4 group">
                    <div className="relative">
                      <div className={`w-16 h-16 ${item.color} text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        {item.step}
                      </div>
                      <Icon className="h-8 w-8 mx-auto mt-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-bold text-xl">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Hear from job seekers who transformed their careers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Built with Modern Technology</CardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300">Cutting-edge tools for the best user experience</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {techStack.map((tech, index) => {
                const Icon = tech.icon
                return (
                  <div key={index} className="text-center space-y-3 group">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{tech.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{tech.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">What We Stand For</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4 text-xl">
                      <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${value.color}`} />
                      </div>
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Security & Privacy */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Security & Privacy First</CardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300">Your data is protected with enterprise-grade security</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center gap-3">
                  <Lock className="h-6 w-6 text-green-600" />
                  Data Protection
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">End-to-end encryption for all data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">GDPR and CCPA compliant</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">No data selling or third-party sharing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Regular security audits</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center gap-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                  Privacy Controls
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Full control over your data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">One-click data export</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Account deletion anytime</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Transparent privacy policy</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
          <CardContent className="text-center py-12">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Job Search?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of successful job seekers who have found their dream careers using JobQuest's 
              comprehensive platform. Start your journey today and never search alone again.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge variant="secondary" className="text-sm px-4 py-2 bg-white/20 text-white">
                ✨ Free to start
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2 bg-white/20 text-white">
                🚀 No credit card required
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2 bg-white/20 text-white">
                🎯 Start focusing immediately
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center space-x-6 text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 JobQuest. Built with ❤️ for job seekers everywhere.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}