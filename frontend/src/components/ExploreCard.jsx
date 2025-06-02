import { Clock, Copy } from 'lucide-react'
import React from 'react'

const ExploreCard = ({ 
  file,
  onCopy
}) => {
  return (
    <div className="exam-card p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {file.typeIcon}
          <h3 className="font-semibold">{file.title}</h3>
        </div>
        <button 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => onCopy(file.id)}
          title="Make a copy"
        >
          <Copy size={18} className="text-gray-400" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">By {file.author}</p>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {file.description}
      </p>
      
      <div className="flex items-center justify-end text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {file.timeAgo}
        </span>
      </div>
    </div>
  )
}

export default ExploreCard 