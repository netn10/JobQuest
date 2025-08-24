'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Users, Heart, Shield, Zap, Mail, Github, Linkedin } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AboutPage() {
  return (
    <DashboardLayout title="About JobQuest">
      <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              About JobQuest
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Empowering professionals to take control of their career journey through focused productivity, 
              continuous learning, and gamified achievement tracking.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                JobQuest was born from the recognition that career development requires more than just 
                applying to jobs. It requires focus, continuous learning, and systematic progress tracking. 
                We believe that by gamifying the career development process, we can help professionals 
                stay motivated and achieve their goals more effectively.
              </p>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>User-First Design</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every feature is designed with the user experience in mind. We prioritize simplicity, 
                  accessibility, and intuitive navigation to ensure you can focus on what matters most.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>Privacy & Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your data is yours. We implement industry-standard security measures and never share 
                  your personal information with third parties without your explicit consent.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle>Continuous Innovation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We're constantly improving JobQuest based on user feedback and emerging best practices 
                  in career development and productivity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Community Driven</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We believe in the power of community. JobQuest is built for professionals who want to 
                  support each other in their career journeys.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">What Makes JobQuest Special</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Gamified Focus Sessions</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Transform your work sessions into engaging missions. Earn XP, unlock achievements, 
                      and build streaks to maintain momentum in your career development.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Smart Job Tracking</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Keep track of all your job applications in one place. Get insights on your application 
                      patterns and follow-up reminders to stay on top of opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Personalized Learning</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Access curated learning resources tailored to your career goals. Track your learning 
                      progress and discover new skills to enhance your professional development.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Progress Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Visualize your career development journey with detailed analytics. Understand your 
                      productivity patterns and identify areas for improvement.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
              <CardDescription>
                Have questions, suggestions, or feedback? We'd love to hear from you!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="mailto:contact@jobquest.com">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Us</span>
                  </Button>
                </Link>
                <Link href="https://github.com/jobquest" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </Button>
                </Link>
                <Link href="https://linkedin.com/company/jobquest" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

                     {/* CTA Section */}
           <div className="text-center">
             <Card className="max-w-2xl mx-auto">
               <CardHeader>
                 <CardTitle className="text-2xl">Ready to Start Your Journey?</CardTitle>
                 <CardDescription>
                   Join thousands of professionals who are already using JobQuest to transform their careers.
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                   <p className="text-gray-600 dark:text-gray-400">
                     You're already on your way! Keep exploring JobQuest to maximize your career potential.
                   </p>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </DashboardLayout>
     )
   }
