import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, Leaf, PiggyBank, Info, DollarSign, Home } from 'lucide-react'

const SavingsDashboard = () => {
  const [propertyTax, setPropertyTax] = useState(500000)
  const [complianceDays, setComplianceDays] = useState(30)

  // Calculate rebate based on formula: propertyTax × 0.05 × (approvedDays / 365)
  const calculateRebate = (tax, days) => {
    return Math.round(tax * 0.05 * (days / 365))
  }

  const rebate = calculateRebate(propertyTax, complianceDays)
  const annualSavings = calculateRebate(propertyTax, 365)
  const fiveYearSavings = annualSavings * 5

  const benefits = [
    {
      icon: DollarSign,
      title: 'Tax Rebates',
      description: 'Earn up to 5% of your property tax back through consistent compliance',
      color: 'from-green-400 to-green-600',
    },
    {
      icon: Leaf,
      title: 'Environmental Impact',
      description: 'Reduce your carbon footprint by composting organic waste',
      color: 'from-primary-400 to-primary-600',
    },
    {
      icon: Home,
      title: 'Property Value',
      description: 'Green-certified societies have higher property values',
      color: 'from-secondary-400 to-secondary-600',
    },
    {
      icon: TrendingUp,
      title: 'Leaderboard Recognition',
      description: 'Compete with other societies and earn public recognition',
      color: 'from-accent-gold to-yellow-600',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg mb-4">
          <PiggyBank className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Savings Calculator</h1>
        <p className="text-gray-600">See how much your society can save with green compliance</p>
      </div>

      {/* Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Calculator className="w-6 h-6 mr-2 text-primary-600" />
          Calculate Your Savings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Property Tax (₹)
            </label>
            <input
              type="range"
              min="100000"
              max="2000000"
              step="50000"
              value={propertyTax}
              onChange={(e) => setPropertyTax(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>₹1L</span>
              <span className="font-semibold text-primary-600 text-lg">₹{propertyTax.toLocaleString()}</span>
              <span>₹20L</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Days per Year
            </label>
            <input
              type="range"
              min="0"
              max="365"
              step="5"
              value={complianceDays}
              onChange={(e) => setComplianceDays(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0 days</span>
              <span className="font-semibold text-primary-600 text-lg">{complianceDays} days</span>
              <span>365 days</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-1">₹{rebate.toLocaleString()}</div>
              <p className="text-gray-600 text-sm">Your Estimated Rebate</p>
              <p className="text-xs text-gray-400 mt-1">Based on {complianceDays} days</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-600 mb-1">₹{annualSavings.toLocaleString()}</div>
              <p className="text-gray-600 text-sm">Potential Annual Savings</p>
              <p className="text-xs text-gray-400 mt-1">With 365-day compliance</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent-gold mb-1">₹{fiveYearSavings.toLocaleString()}</div>
              <p className="text-gray-600 text-sm">5-Year Total Savings</p>
              <p className="text-xs text-gray-400 mt-1">Compound benefits</p>
            </div>
          </div>
        </div>

        {/* Formula */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                <strong>Rebate Formula:</strong> Property Tax × 5% × (Compliance Days / 365)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Example: ₹{propertyTax.toLocaleString()} × 0.05 × ({complianceDays}/365) = ₹{rebate.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Benefits Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 card-hover"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SavingsDashboard