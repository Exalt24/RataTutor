import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditProfileScreen from '../components/EditProfileScreen'
import ExamsScreen from '../components/ExamsScreen'
import ExploreScreen from '../components/ExploreScreen'
import Header from '../components/Header'
import HomeScreen from '../components/HomeScreen'
import MaterialsScreen from '../components/MaterialsScreen'
import ProfileScreen from '../components/ProfileScreen'
import RataAIScreen from '../components/RataAIScreen'
import Sidebar from '../components/Sidebar'
import StreakScreen from '../components/StreakScreen'
import TrashScreenEmptyState from '../components/TrashScreenEmptyState'
// import api from '../services/api'   ← comment this out until ready
import { logout } from '../services/authService'
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

  const getBgColor = () => {
    switch(screen) {
      case 'home':    return 'bg-color-1'
      case 'materials':   return 'bg-color-2'
      case 'trash':   return 'bg-color-4'
      case 'explore': return 'bg-color-1'
      case 'rata':    return 'bg-color-3'
      case 'profile': return 'bg-color-2'
      case 'edit-profile': return 'bg-color-2'
      case 'streak':  return 'bg-color-3'
      case 'saved':   return 'bg-color-3'
      default:        return 'bg-color-1'
    }
  }

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
        <main className={`flex-1 overflow-auto p-2 sm:p-4 ${getBgColor()}`}>
          {screen==='home'   && <HomeScreen selectedFile={selectedFile} handleFileChange={handleFileChange} uploadAndGenerate={uploadAndGenerate} generated={generated}/>}
          {screen==='materials'  && <MaterialsScreen />}
          {screen==='trash'  && <TrashScreenEmptyState/>}
          {screen==='exams'  && <ExamsScreen/>}
          {screen==='explore'&& <ExploreScreen/>}
          {screen==='rata'   && <RataAIScreen/>}
          {screen==='profile'&& <ProfileScreen points={points} badges={badges} onEditProfile={() => setScreen('edit-profile')}/>}
          {screen==='edit-profile' && <EditProfileScreen onBack={() => setScreen('profile')}/>}
          {screen==='streak' && <StreakScreen points={points} badges={badges}/>}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
