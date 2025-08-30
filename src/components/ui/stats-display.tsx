'use client'

import { useUserStats } from '@/contexts/user-stats-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, TrendingUp, Target, Trophy, BriefcaseIcon, FileText, BookOpen, Star } from 'lucide-react'

interface StatsDisplayProps {
  showAll?: boolean
  className?: string
}

export function StatsDisplay({ showAll = false, className = '' }: StatsDisplayProps) {
  const { stats, loading, error } = useUserStats()

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-${showAll ? '8' : '6'} gap-4 lg:gap-6 ${className}`}>
        {[...Array(showAll ? 8 : 6)].map((_, i) => (
          <Card key={i} className="h-24 w-full border-2 border-[#1E293B]">
            <div className="flex items-center justify-center h-full">
              <div className="h-7 w-7 bg-[#334155] rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-[#EF4444]">Failed to load stats</p>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total XP',
      value: stats.totalXp.toLocaleString(),
      subtitle: `Level ${stats.level}`,
      icon: Zap,
      iconColor: 'text-[#3B82F6]',
      borderColor: 'hover:border-[#3B82F6]'
    },
    {
      title: 'Current Level',
      value: stats.level.toString(),
      subtitle: `${stats.xpProgress} XP to level ${stats.level + 1}`,
      icon: TrendingUp,
      iconColor: 'text-[#6366F1]',
      borderColor: 'hover:border-[#6366F1]'
    },
    {
      title: 'Current Streak',
      value: `${Math.max(1, stats.currentStreak)} days`,
      subtitle: 'Keep it up!',
      icon: Target,
      iconColor: 'text-[#10B981]',
      borderColor: 'hover:border-[#10B981]'
    },
    {
      title: 'Notebook Entries',
      value: stats.notebookEntries.toString(),
      subtitle: 'Journal entries',
      icon: FileText,
      iconColor: 'text-[#8B5CF6]',
      borderColor: 'hover:border-[#8B5CF6]'
    },
    {
      title: 'Learning Hours',
      value: `${stats.totalLearningHours}h`,
      subtitle: 'Time invested',
      icon: BookOpen,
      iconColor: 'text-[#EC4899]',
      borderColor: 'hover:border-[#EC4899]'
    },
    {
      title: 'Achievements',
      value: stats.unlockedAchievements.toString(),
      subtitle: 'Unlocked badges',
      icon: Star,
      iconColor: 'text-[#F59E0B]',
      borderColor: 'hover:border-[#F59E0B]'
    }
  ]

  if (showAll) {
    statsCards.push(
      {
        title: 'Longest Streak',
        value: `${Math.max(1, stats.longestStreak)} days`,
        subtitle: 'Best record',
        icon: Trophy,
        iconColor: 'text-[#F59E0B]',
        borderColor: 'hover:border-[#F59E0B]'
      },
      {
        title: 'Applications',
        value: stats.applications.toString(),
        subtitle: `${stats.pendingResponses} responses pending`,
        icon: BriefcaseIcon,
        iconColor: 'text-[#06B6D4]',
        borderColor: 'hover:border-[#06B6D4]'
      }
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-${showAll ? '8' : '6'} gap-4 lg:gap-6 ${className}`}>
      {statsCards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <Card key={index} className={`h-24 w-full border-2 border-[#1E293B] ${card.borderColor} hover:bg-[#111827] transition-all duration-200`}>
            <div className="flex items-center justify-center h-full flex-col space-y-2">
              <IconComponent className={`h-7 w-7 ${card.iconColor}`} />
              <div className="text-center">
                <div className="text-lg font-bold text-[#F8FAFC]">{card.value}</div>
                <div className="text-xs text-[#94A3B8]">{card.title}</div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
