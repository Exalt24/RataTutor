import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FilesScreen from '../components/FileScreen'
import Header from '../components/Header'
import HomeScreen from '../components/HomeScreen'
import ProfileScreen from '../components/ProfileScreen'
import SavedScreenEmptyState from '../components/SavedScreenEmptyState'
import Sidebar from '../components/Sidebar'
import StreakScreen from '../components/StreakScreen'
import TrashScreenEmptyState from '../components/TrashScreenEmptyState'
// import api from '../services/api'   ← comment this out until ready
import { logout } from '../services/auth'
import '../styles/pages/dashboard.css'

const Dashboard = () => {
  const [screen, setScreen] = useState('home')
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [points, setPoints] = useState(0)
  const [generated, setGenerated] = useState({ flashcards: [], summary: '', quiz: [] })
  const [selectedFile, setSelectedFile] = useState(null)
  const [badges, setBadges] = useState([])

  const nav = useNavigate()
  
  // Commented out until your API is up:
  // useEffect(() => {
  //   Promise.all([ api.get('streak/'), api.get('daily-challenge/'), api.get('profile/') ])
  //     .then(([sr, cr, pr]) => {
  //       setStreak(sr.data.streak || 0)
  //       setPoints(pr.data.points)
  //       setBadges(pr.data.badges)
  //       setLevel(pr.data.level)
  //     })
  //     .catch(() => setStreak(0))
  // }, [])

  const doLogout = () => { logout(); nav('/login', { replace: true }) }
  const showProfile = () => setScreen('profile')
  const showStreak = () => setScreen('streak')

  const handleFileChange = e => {
    setSelectedFile(e.target.files[0])
    setGenerated({ flashcards: [], summary: '', quiz: [] })
  }

  const uploadAndGenerate = async type => {
    if (!selectedFile) return alert('Please select a file first')
    // …your generate logic (api.post) can stay commented if needed
  }

  const gradientClass = () => {
    switch(screen) {
      case 'home':    return 'bg-color-1'
      case 'files':   return 'bg-color-2'
      case 'saved':   return 'bg-color-3'
      case 'trash':   return 'bg-color-4'
      case 'profile': return 'bg-color-2'
      case 'streak':  return 'bg-color-3'
      default:        return 'bg-color-1'
    }
  }

  const files = [
    { title:'Scripts sa IOT', updated:'270d ago', tag:'Flashcards (33)' },
    { title:'Untitled',        updated:'270d ago', tag:'Note' },
    { title:'(Draft) 5 Testing', updated:'367d ago', tag:'Flashcards (14)' }
  ]

  return (
    <div className="flex h-screen text-xs sm:text-sm">
      <Sidebar screen={screen} setScreen={setScreen}/>
      <div className="flex-1 flex flex-col">
        <Header 
          streak={streak} 
          level={level} 
          points={points} 
          onLogout={doLogout}
          onProfile={showProfile}
          onStreak={showStreak}
        />
        <main className={`flex-1 overflow-auto p-2 sm:p-4 ${gradientClass()}`}>
          {screen==='home'   && <HomeScreen selectedFile={selectedFile} handleFileChange={handleFileChange} uploadAndGenerate={uploadAndGenerate} generated={generated}/>}
          {screen==='files'  && <FilesScreen files={files}/>}
          {screen==='saved'  && <SavedScreenEmptyState/>}
          {screen==='trash'  && <TrashScreenEmptyState/>}
          {screen==='profile'&& <ProfileScreen points={points} badges={badges}/>}
          {screen==='streak' && <StreakScreen points={points} badges={badges}/>}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
