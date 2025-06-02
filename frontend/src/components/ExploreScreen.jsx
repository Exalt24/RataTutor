import { Compass } from 'lucide-react'
import React from 'react'

const ExploreScreen = () => (
  <div className="text-center space-y-2 p-4 text-xs sm:text-sm">
    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"><Compass size={52} /></div>
    <h1 className="exam-heading exam-heading-mini text-lg">Start Exploring</h1>
    <p>Discover new learning materials and resources here.</p>
  </div>
)

export default ExploreScreen 