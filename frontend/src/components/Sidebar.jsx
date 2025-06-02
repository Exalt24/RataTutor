import {
  BookmarkIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  GlobeAltIcon,
  HomeIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import logotemp from '../assets/logotemp.png'

const Sidebar = ({ screen, setScreen }) => {
  // Only "Library" items here (no more "Class" in this array)
  const libraryItems = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Files', icon: <FolderIcon /> },
    { name: 'Saved', icon: <BookmarkIcon /> },
    { name: 'Trash', icon: <TrashIcon /> }
  ]

  // "Browse" items with their icons
  const browseItems = [
    { name: 'Explore', icon: <GlobeAltIcon /> },
    { name: 'Exams', icon: <ClipboardDocumentListIcon /> }
  ]

  return (
    <aside className="hidden md:flex md:w-1/5 bg-color-2 p-4 flex-col justify-between overflow-y-auto h-full">
      <div>
        {/* Logo */}
        <a href=".">
          <img
            src={logotemp}
            alt="Logo"
            className="block mx-auto w-16 sm:w-20 border-b border-gray-200 pb-1 mb-3"
          />
        </a>
        <hr className="border-t border-gray-400 mb-4" />

        <nav>
          {/* Library section */}
          <p className="sidebar-category">Library</p>
          {libraryItems.map(item => (
            <button
              key={item.name}
              onClick={() => setScreen(item.name.toLowerCase())}
              className={`sidebar-menu-button ${screen === item.name.toLowerCase() ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}

          {/* Browse section */}
          <p className="sidebar-category">Browse</p>
          {browseItems.map(item => (
            <button
              key={item.name}
              onClick={() => setScreen(item.name.toLowerCase())}
              className={`sidebar-menu-button ${screen === item.name.toLowerCase() ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}

          {/* AI Tools section */}
          <p className="sidebar-category">AI Tools</p>
          <button
            onClick={() => setScreen('rata')}
            className={`sidebar-menu-button ${screen === 'rata' ? 'active' : ''}`}
          >
            <SparklesIcon />
            Rata AI
          </button>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
