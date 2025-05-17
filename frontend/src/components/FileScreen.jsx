import React from 'react'
import { ChevronDown, Bookmark, Eye, Pin, MoreHorizontal } from 'lucide-react'

const FilesScreen = ({ files }) => (
  <div>
    <div className="flex justify-between items-center mb-2 text-xs sm:text-sm">
      <h1 className="exam-heading exam-heading-mini text-base">Your Files</h1>
      <div className="flex flex-wrap gap-2">
        <button className="exam-button-mini py-1 px-2"><span className="flex items-center">Type<ChevronDown size={12} /></span></button>
        <button className="exam-button-mini py-1 px-2"><span className="flex items-center">Updated<ChevronDown size={12} /></span></button>
        <button className="exam-button-mini p-1"><Bookmark size={16} /></button>
        <button className="exam-button-mini p-1"><Eye size={16} /></button>
        <button className="exam-button-mini p-1"><Pin size={16} /></button>
        <button className="exam-button-mini p-1"><MoreHorizontal size={16} /></button>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {files.map((f,i) => (
        <div key={i} className="exam-card p-2 relative text-xs sm:text-sm">
          <h3 className="font-semibold mb-1">{f.title}</h3>
          <p className="text-gray-600 mb-1 text-xs sm:text-sm">Updated {f.updated}</p>
          <span className="inline-block bg-gray-700 text-white rounded-full px-2 py-0.5 text-[10px] mb-2">{f.tag}</span>
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Eye size={14} /><Pin size={14} /><MoreHorizontal size={14} />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default FilesScreen