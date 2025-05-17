import React from 'react'
import { Bookmark } from 'lucide-react'

const SavedScreen = () => (
  <div className="text-center space-y-2 p-4 text-xs sm:text-sm">
    <div className="w-20 h-20 bg-pastel-pink rounded-full mx-auto flex items-center justify-center"><Bookmark size={52}/></div>
    <h1 className="exam-heading exam-heading-mini text-lg">Save Content!</h1>
    <p>If you like someone else's notes and flashcards, save them for later.</p>
    <button className="exam-button-mini py-1 px-2 text-xs sm:text-sm">Explore Notes & Flashcards</button>
  </div>
)

export default SavedScreen