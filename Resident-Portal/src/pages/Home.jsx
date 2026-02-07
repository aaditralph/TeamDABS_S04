import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Trophy, Flame, Target, Zap, Star, ChevronRight } from 'lucide-react'

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Epic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 text-white p-8 md:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl mb-8 border-2 border-white/30"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Trophy className="w-14 h-14 text-yellow-300" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6"
          >
            <span className="bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent">
              EcoScore
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold mb-4 max-w-3xl mx-auto"
          >
            Compete. Climb. Conquer the Leaderboard! 🏆
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Join Mumbai's most competitive green challenge. Build daily streaks, 
            earn verification scores, and lead your society to glory!
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/search" className="group bg-white text-primary-700 font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 text-lg">
              <Search className="w-6 h-6" />
              <span>Find Your Society</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/leaderboard" className="group bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-3 text-lg">
              <Trophy className="w-6 h-6" />
              <span>View Rankings</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-10 left-10 text-6xl opacity-20"
        >
          🔥
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-10 right-10 text-6xl opacity-20"
        >
          🏆
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 right-20 text-5xl opacity-20 hidden md:block"
        >
          ⭐
        </motion.div>
      </section>

      {/* Gamified Features Grid */}
      <section className="py-8">
        <h2 className="text-3xl font-black text-center mb-10">
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            How to Win
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            className="card p-8 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <Flame className="w-10 h-10 text-white" />
            </div>
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="font-black text-2xl mb-3 text-gray-900">1. Build Your Streak</h3>
            <p className="text-gray-600 leading-relaxed">
              Submit reports every single day. The longer your streak, the higher you climb! 
              <span className="font-bold text-orange-600"> Don't break the chain!</span>
            </p>
            <div className="mt-4 flex items-center text-orange-600 font-bold">
              <span>Worth 20% of score</span>
              <Zap className="w-4 h-4 ml-2" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: -1 }}
            className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 hover:border-primary-400 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-black text-2xl mb-3 text-gray-900">2. Max Your Score</h3>
            <p className="text-gray-600 leading-relaxed">
              Submit crystal-clear photos for higher verification scores. 
              <span className="font-bold text-primary-600"> Quality = Points!</span>
            </p>
            <div className="mt-4 flex items-center text-primary-600 font-bold">
              <span>Worth 50% of score</span>
              <Zap className="w-4 h-4 ml-2" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            className="card p-8 bg-gradient-to-br from-yellow-50 to-accent-gold/20 border-2 border-yellow-300 hover:border-yellow-500 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-accent-gold rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="font-black text-2xl mb-3 text-gray-900">3. Dominate Rankings</h3>
            <p className="text-gray-600 leading-relaxed">
              Compete with other societies. Climb from Bronze to Champion tier 
              <span className="font-bold text-yellow-600"> and claim the crown!</span>
            </p>
            <div className="mt-4 flex items-center text-yellow-600 font-bold">
              <span>Save money & win!</span>
              <Star className="w-4 h-4 ml-2" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="card p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black mb-2">Current Champions</h2>
              <p className="text-gray-400">See who's dominating the leaderboard right now</p>
            </div>
            <Link to="/leaderboard" className="bg-white text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center">
              View All
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {[
              { rank: 1, name: "Green Valley Apartments", streak: 45, score: 88, total: 95, color: "from-yellow-400 to-yellow-600" },
              { rank: 2, name: "Sunrise Residency", streak: 38, score: 85, total: 89, color: "from-blue-400 to-cyan-500" },
              { rank: 3, name: "Metro Heights", streak: 32, score: 82, total: 84, color: "from-gray-400 to-gray-500" },
            ].map((society, index) => (
              <motion.div 
                key={society.rank}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${society.color} flex items-center justify-center text-2xl`}>
                    {society.rank === 1 ? '👑' : society.rank === 2 ? '💎' : '🥉'}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{society.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Flame className="w-4 h-4 mr-1 text-orange-400" />
                        {society.streak} day streak
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1 text-primary-400" />
                        {society.score}% verified
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{society.total}</p>
                  <p className="text-xs text-gray-400">POINTS</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home