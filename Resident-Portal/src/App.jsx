import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SearchSociety from './pages/SearchSociety'
import SocietyDetails from './pages/SocietyDetails'
import Leaderboard from './pages/Leaderboard'
import SavingsDashboard from './pages/SavingsDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchSociety />} />
          <Route path="society/:societyName" element={<SocietyDetails />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="savings" element={<SavingsDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App