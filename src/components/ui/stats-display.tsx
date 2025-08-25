'use client'

import { useUserStats } from '@/contexts/user-stats-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, TrendingUp, Target, Trophy, BriefcaseIcon } from 'lucide-react'

interface StatsDisplayProps {
  showAll?: boolean
  className?: string
}

export function StatsDisplay({ showAll = false, className = '' }: StatsDisplayProps) {
  const { stats, loading, error } = useUserStats()

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${showAll ? '5' : '3'} gap-6 ${className}`}>
        {[...Array(showAll ? 5 : 3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">Failed to load stats</p>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total XP',
      value: stats.totalXp.toLocaleString(),
      subtitle: `Level ${stats.level}`,
      icon: Zap,
      iconColor: 'xp-color'
    },
    {
      title: 'Current Level',
      value: stats.level.toString(),
      subtitle: `${stats.xpProgress} XP to level ${stats.level + 1}`,
      icon: TrendingUp,
      iconColor: 'level-color'
    },
    {
      title: 'Current Streak',
      value: `${Math.max(1, stats.currentStreak)} days`,
      subtitle: 'Keep it up!',
      icon: Target,
      iconColor: 'streak-color'
    }
  ]

  if (showAll) {
    statsCards.push(
      {
        title: 'Longest Streak',
        value: `${Math.max(1, stats.longestStreak)} days`,
        subtitle: 'Best record',
        icon: Trophy,
        iconColor: 'trophy-color'
      },
      {
        title: 'Applications',
        value: stats.applications.toString(),
        subtitle: `${stats.pendingResponses} responses pending`,
        icon: BriefcaseIcon,
        iconColor: 'application-color'
      }
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${showAll ? '5' : '3'} gap-6 ${className}`}>
      {statsCards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <IconComponent className={`h-4 w-4 ${card.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{card.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
