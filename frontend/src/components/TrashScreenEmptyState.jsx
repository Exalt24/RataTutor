import React from 'react'
import { Trash2 } from 'lucide-react'

const TrashScreenEmptyState = () => (
  <div className="text-center space-y-2 p-4 text-xs sm:text-sm">
    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"><Trash2 size={52} /></div>
    <h1 className="exam-heading exam-heading-mini text-lg">Your trash is empty</h1>
    <p>Here is where you can recover or permanently delete trash files.</p>
  </div>
)

export default TrashScreenEmptyState