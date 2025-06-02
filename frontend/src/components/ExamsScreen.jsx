import { FileText } from 'lucide-react'
import React from 'react'

const ExamsScreen = () => (
  <div className="text-center space-y-2 p-4 text-xs sm:text-sm">
    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"><FileText size={52} /></div>
    <h1 className="exam-heading exam-heading-mini text-lg">No Exams Yet</h1>
    <p>Your upcoming and past exams will appear here.</p>
  </div>
)

export default ExamsScreen 