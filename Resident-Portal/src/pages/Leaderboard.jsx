import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Target, Medal, Crown, Star, Zap, TrendingUp } from 'lucide-react'

// Mock data for demonstration
const mockLeaderboard = [
  {
    societyId: "1",
    societyName: "Green Valley Apartments",
    overallScore: 95,
    totalReports: 52,
    approvedReports: 50,
    consistencyScore: 96.15,
    averageVerificationScore: 88,
    complianceStreak: 45,
    totalRebatesEarned: 12500,
    rank: 1
  },
  {
    societyId: "2",
    societyName: "Sunrise Residency",
    overallScore: 89,
    totalReports: 48,
    approvedReports: 45,
    consistencyScore: 93.75,
    averageVerificationScore: 85,
    complianceStreak: 38,
    totalRebatesEarned: 10800,
    rank: 2
  },
  {
    societyId: "3",
    societyName: "Metro Heights",
    overallScore: 84,
    totalReports: 45,
    approvedReports: 41,
    consistencyScore: 91.11,
    averageVerificationScore: 82,
    complianceStreak: 32,
    totalRebatesEarned: 9200,
    rank: 3
  },
  {
    societyId: "4",
    societyName: "Royal Gardens",
    overallScore: 79,
    totalReports: 42,
    approvedReports: 38,
    consistencyScore: 90.48,
    averageVerificationScore: 78,
    complianceStreak: 28,
    totalRebatesEarned: 8100,
    rank: 4
  },
  {
    societyId: "5",
    societyName: "Harmony Homes",
    overallScore: 76,
    totalReports: 40,
    approvedReports: 36,
    consistencyScore: 90.00,
    averageVerificationScore: 75,
    complianceStreak: 25,
    totalRebatesEarned: 7200,
    rank: 5
  },
  {
    societyId: "6",
    societyName: "Pacific Towers",
    overallScore: 72,
    totalReports: 38,
    approvedReports: 33,
    consistencyScore: 86.84,
    averageVerificationScore: 74,
    complianceStreak: 21,
    totalRebatesEarned: 6500,
    rank: 6
  },
  {
    societyId: "7",
    societyName: "Lotus Enclave",
    overallScore: 68,
    totalReports: 35,
    approvedReports: 30,
    consistencyScore: 85.71,
    averageVerificationScore: 71,
    complianceStreak: 18,
    totalRebatesEarned: 5400,
    rank: 7
  },
  {
    societyId: "8",
    societyName: "Silver Oak Society",
    overallScore: 64,
    totalReports: 33,
    approvedReports: 28,
    consistencyScore: 84.85,
    averageVerificationScore: 68,
    complianceStreak: 15,
    totalRebatesEarned: 4800,
    rank: 8
  },
  {
    societyId: "9",
    societyName: "Golden Paradise",
    overallScore: 59,
    totalReports: 30,
    approvedReports: 25,
    consistencyScore: 83.33,
    averageVerificationScore: 65,
    complianceStreak: 12,
    totalRebatesEarned: 3900,
    rank: 9
  },
  {
    societyId: "10",
    societyName: "Diamond Valley",
    overallScore: 54,
    totalReports: 28,
    approvedReports: 23,
    consistencyScore: 82.14,
    averageVerificationScore: 62,
    complianceStreak: 9,
    totalRebatesEarned: 3200,
    rank: 10
  }
]

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard)
  const [loading, setLoading] = useState(false)

  const getStreakEmoji = (streak) => {
    if (streak >= 40) return '🔥🔥🔥🔥'
    if (streak >= 30) return '🔥🔥🔥'
    if (streak >= 20) return '🔥🔥'
    if (streak >= 10) return '🔥'
    return '⚡'
  }

  const getTierInfo = (rank, score) => {
    if (rank === 1) return { 
      name: 'Champion', 
      color: 'from-yellow-400 via-yellow-500 to-orange-500', 
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50', 
      textColor: 'text-orange-700',
      icon: '👑',
      glow: 'shadow-yellow-400/50'
    }
    if (rank === 2) return { 
      name: 'Diamond', 
      color: 'from-blue-400 via-cyan-400 to-teal-400', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50', 
      textColor: 'text-blue-700',
      icon: '💎',
      glow: 'shadow-blue-400/50'
    }
    if (rank === 3) return { 
      name: 'Platinum', 
      color: 'from-gray-300 via-gray-400 to-slate-400', 
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50', 
      textColor: 'text-gray-700',
      icon: '🥉',
      glow: 'shadow-gray-400/50'
    }
    if (score >= 75) return { 
      name: 'Gold', 
      color: 'from-yellow-300 via-yellow-400 to-amber-400', 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-700',
      icon: '🥇',
      glow: 'shadow-yellow-300/50'
    }
    if (score >= 60) return { 
      name: 'Silver', 
      color: 'from-gray-300 via-slate-300 to-zinc-400', 
      bgColor: 'bg-gray-50', 
      textColor: 'text-gray-600',
      icon: '🥈',
      glow: 'shadow-gray-300/50'
    }
    return { 
      name: 'Bronze', 
      color: 'from-orange-300 via-orange-400 to-amber-600', 
      bgColor: 'bg-orange-50', 
      textColor: 'text-orange-700',
      icon: '🥉',
      glow: 'shadow-orange-400/50'
    }
  }

  const getRankAnimation = (rank) => {
    if (rank === 1) return { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } }
    return {}
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Epic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-gold via-yellow-500 to-orange-500 rounded-3xl shadow-2xl shadow-yellow-500/30 mb-6"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-3">
          <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-gold bg-clip-text text-transparent">
            Society Rankings
          </span>
        </h1>
        <p className="text-xl text-gray-600 font-medium">🔥 Climb the ranks with daily streaks & verification scores!</p>
      </motion.div>

      {/* Top 3 Champions - Gamified Podium */}
      {leaderboard.length >= 3 && (
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-center mb-8 flex items-center justify-center"
          >
            <Star className="w-6 h-6 text-accent-gold mr-2" />
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              TOP CHAMPIONS
            </span>
            <Star className="w-6 h-6 text-accent-gold ml-2" />
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <div className="card overflow-hidden shadow-2xl shadow-blue-500/20 border-2 border-blue-200">
                <div className="bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-500 p-6 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30"></div>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-2"
                  >
                    💎
                  </motion.div>
                  <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-bold mb-2">
                    DIAMOND TIER
                  </div>
                  <h3 className="font-bold text-xl truncate">{leaderboard[1].societyName}</h3>
                  <p className="text-5xl font-extrabold mt-2">{leaderboard[1].overallScore}</p>
                  <p className="text-sm opacity-90">POINTS</p>
                </div>
                <div className="p-5 space-y-4 bg-gradient-to-b from-blue-50 to-white">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="flex items-center text-sm font-semibold text-gray-700">
                      <Flame className="w-5 h-5 mr-2 text-orange-500" />
                      Daily Streak
                    </span>
                    <span className="font-bold text-orange-600 text-lg">
                      {getStreakEmoji(leaderboard[1].complianceStreak)} {leaderboard[1].complianceStreak}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="flex items-center text-sm font-semibold text-gray-700">
                      <Target className="w-5 h-5 mr-2 text-primary-600" />
                      Verification
                    </span>
                    <span className="font-bold text-primary-600 text-lg">
                      {leaderboard[1].averageVerificationScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">Reports</span>
                    <span className="font-bold text-gray-900">
                      {leaderboard[1].approvedReports}/{leaderboard[1].totalReports}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-4xl font-black text-blue-400">#2</span>
              </div>
            </motion.div>

            {/* 1st Place - Bigger & Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, type: "spring", stiffness: 100 }}
              className="relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
              >
                <span className="text-5xl">👑</span>
              </motion.div>
              
              <div className="card overflow-hidden shadow-2xl shadow-yellow-500/30 border-4 border-yellow-400 transform scale-110">
                <div className="bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-500 p-8 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-40 animate-pulse"></div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-7xl mb-3 relative z-10"
                  >
                    🏆
                  </motion.div>
                  <div className="inline-block px-6 py-2 bg-white/30 rounded-full text-sm font-black mb-3 relative z-10 backdrop-blur-sm">
                    CHAMPION TIER
                  </div>
                  <h3 className="font-black text-2xl truncate relative z-10">{leaderboard[0].societyName}</h3>
                  <p className="text-6xl font-black mt-3 relative z-10">{leaderboard[0].overallScore}</p>
                  <p className="text-base opacity-90 font-bold relative z-10">POINTS</p>
                </div>
                <div className="p-6 space-y-4 bg-gradient-to-b from-yellow-50 via-yellow-50 to-white">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border-2 border-yellow-200">
                    <span className="flex items-center text-base font-bold text-gray-800">
                      <Flame className="w-6 h-6 mr-2 text-orange-600" />
                      Daily Streak
                    </span>
                    <span className="font-black text-orange-600 text-xl">
                      {getStreakEmoji(leaderboard[0].complianceStreak)} {leaderboard[0].complianceStreak}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border-2 border-primary-200">
                    <span className="flex items-center text-base font-bold text-gray-800">
                      <Target className="w-6 h-6 mr-2 text-primary-600" />
                      Verification
                    </span>
                    <span className="font-black text-primary-600 text-xl">
                      {leaderboard[0].averageVerificationScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
                    <span className="text-base font-bold text-gray-800">Reports Approved</span>
                    <span className="font-black text-gray-900 text-xl">
                      {leaderboard[0].approvedReports}/{leaderboard[0].totalReports}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-5xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
                >
                  #1
                </motion.span>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="relative"
            >
              <div className="card overflow-hidden shadow-2xl shadow-gray-500/20 border-2 border-gray-300">
                <div className="bg-gradient-to-b from-gray-300 via-gray-400 to-slate-400 p-6 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30"></div>
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-6xl mb-2"
                  >
                    🥉
                  </motion.div>
                  <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-bold mb-2">
                    PLATINUM TIER
                  </div>
                  <h3 className="font-bold text-xl truncate">{leaderboard[2].societyName}</h3>
                  <p className="text-5xl font-extrabold mt-2">{leaderboard[2].overallScore}</p>
                  <p className="text-sm opacity-90">POINTS</p>
                </div>
                <div className="p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="flex items-center text-sm font-semibold text-gray-700">
                      <Flame className="w-5 h-5 mr-2 text-orange-500" />
                      Daily Streak
                    </span>
                    <span className="font-bold text-orange-600 text-lg">
                      {getStreakEmoji(leaderboard[2].complianceStreak)} {leaderboard[2].complianceStreak}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="flex items-center text-sm font-semibold text-gray-700">
                      <Target className="w-5 h-5 mr-2 text-primary-600" />
                      Verification
                    </span>
                    <span className="font-bold text-primary-600 text-lg">
                      {leaderboard[2].averageVerificationScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">Reports</span>
                    <span className="font-bold text-gray-900">
                      {leaderboard[2].approvedReports}/{leaderboard[2].totalReports}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-4xl font-black text-gray-400">#3</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Scoring Formula - Gamified */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="card p-8 mb-10 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 text-white overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-6 flex items-center justify-center">
            <Zap className="w-8 h-8 mr-3 text-yellow-300" />
            HOW TO CLIMB THE RANKS
            <Zap className="w-8 h-8 ml-3 text-yellow-300" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30"
            >
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-4xl font-black text-yellow-300 mb-2">50%</div>
              <h4 className="font-bold text-lg mb-2">Verification Score</h4>
              <p className="text-sm text-white/90">Average of all your report verification scores. Submit clear, high-quality images!</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30"
            >
              <div className="text-5xl mb-3">🔥</div>
              <div className="text-4xl font-black text-orange-300 mb-2">20%</div>
              <h4 className="font-bold text-lg mb-2">Daily Streak</h4>
              <p className="text-sm text-white/90">Consecutive days of approved reports. Don't break the chain!</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30"
            >
              <div className="text-5xl mb-3">⭐</div>
              <div className="text-4xl font-black text-green-300 mb-2">30%</div>
              <h4 className="font-bold text-lg mb-2">Consistency</h4>
              <p className="text-sm text-white/90">Percentage of reports approved. Quality matters!</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Full Rankings Table - Gamified */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-black text-gray-900 flex items-center">
            <TrendingUp className="w-7 h-7 mr-3 text-primary-600" />
            COMPLETE RANKINGS
          </h2>
          <p className="text-gray-500 mt-1">All societies competing for the top spot</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary-50 to-secondary-50">
                <th className="px-6 py-5 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-5 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Society</th>
                <th className="px-6 py-5 text-center text-sm font-black text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-center">
                    <Flame className="w-5 h-5 mr-2 text-orange-500" />
                    Streak
                  </span>
                </th>
                <th className="px-6 py-5 text-center text-sm font-black text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-center">
                    <Target className="w-5 h-5 mr-2 text-primary-600" />
                    Score
                  </span>
                </th>
                <th className="px-6 py-5 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-5 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Total Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.map((society, index) => {
                const tier = getTierInfo(society.rank, society.overallScore)
                return (
                  <motion.tr
                    key={society.societyId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }}
                    className={`transition-all duration-200 ${index < 3 ? tier.bgColor : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        {society.rank <= 3 ? (
                          <motion.span 
                            animate={getRankAnimation(society.rank)}
                            className="text-3xl"
                          >
                            {society.rank === 1 ? '👑' : society.rank === 2 ? '💎' : '🥉'}
                          </motion.span>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} text-white flex items-center justify-center font-black text-lg shadow-lg`}>
                            {society.rank}
                          </div>
                        )}
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${tier.textColor} bg-white shadow-sm border`}>
                          {tier.icon} {tier.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{society.societyName}</p>
                        {society.totalRebatesEarned > 0 && (
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            💰 ₹{society.totalRebatesEarned.toLocaleString()} saved
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-bold shadow-md"
                      >
                        <span className="mr-2 text-xl">{getStreakEmoji(society.complianceStreak)}</span>
                        <span className="text-lg">{society.complianceStreak}</span>
                      </motion.span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 font-bold shadow-md"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        <span className="text-lg">{society.averageVerificationScore}%</span>
                      </motion.span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-bold text-green-600 text-lg">{society.approvedReports}</span>
                      <span className="text-gray-400 text-sm"> / {society.totalReports}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <motion.span 
                        whileHover={{ scale: 1.2 }}
                        className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-black text-xl shadow-lg"
                      >
                        {society.overallScore}
                      </motion.span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pro Tips Section - Gamified */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-12 card p-8 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-700 text-white overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-8 flex items-center justify-center">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Medal className="w-10 h-10 mr-4 text-yellow-300" />
            </motion.span>
            PRO TIPS TO DOMINATE
            <motion.span
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Medal className="w-10 h-10 ml-4 text-yellow-300" />
            </motion.span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.03, rotate: 1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30 hover:border-yellow-400/50 transition-all"
            >
              <div className="text-4xl mb-3">🔥</div>
              <h4 className="font-black text-xl mb-2 text-yellow-300">NEVER BREAK THE CHAIN</h4>
              <p className="text-white/90">Submit reports every single day! Missing just ONE day resets your streak to ZERO and costs you massive points. Set daily reminders!</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03, rotate: -1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30 hover:border-green-400/50 transition-all"
            >
              <div className="text-4xl mb-3">📸</div>
              <h4 className="font-black text-xl mb-2 text-green-300">PICTURE PERFECT</h4>
              <p className="text-white/90">Take crystal-clear photos in good lighting. Blurry images = low verification scores = lower rank. Make sure meter readings are readable!</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Leaderboard