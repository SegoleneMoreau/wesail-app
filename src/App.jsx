import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import TripDetail from './pages/TripDetail'
import NewTrip from './pages/NewTrip'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Forum from './pages/Forum'
import Marketplace from './pages/Marketplace'
import Meteo from './pages/Meteo'
import MyTrips from './pages/MyTrips'
import MyBoats from './pages/MyBoats'
import MyReviews from './pages/MyReviews'
import Settings from './pages/Settings'
import Help from './pages/Help'
import Feed from './pages/Feed'
import PublicProfile from './pages/PublicProfile'

function PrivateRoute({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if(data.session?.user) {
        supabase.from('users').select('*').eq('id', data.session.user.id).single()
          .then(({ data: prof }) => { if(prof) setProfile(prof) })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if(s?.user) {
        supabase.from('users').select('*').eq('id', s.user.id).single()
          .then(({ data: prof }) => { if(prof) setProfile(prof) })
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="ws-loading">Chargement...</div>
  if (!session) return <Navigate to="/auth" replace />
  return <Layout user={session.user} profile={profile}>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/trip/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
        <Route path="/annonce" element={<PrivateRoute><NewTrip /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
        <Route path="/meteo" element={<PrivateRoute><Meteo /></PrivateRoute>} />
        <Route path="/trajets" element={<PrivateRoute><MyTrips /></PrivateRoute>} />
        <Route path="/bateaux" element={<PrivateRoute><MyBoats /></PrivateRoute>} />
        <Route path="/avis" element={<PrivateRoute><MyReviews /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/aide" element={<PrivateRoute><Help /></PrivateRoute>} />
        <Route path="/fil" element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="/profil/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
