import {
  AcademicCapIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  GlobeAltIcon,
  HomeIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import logotemp from '../assets/logotemp.png';

const Sidebar = ({ screen, setScreen }) => {
  const menu = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Files', icon: <FolderIcon /> },
    { name: 'Saved', icon: <BookmarkIcon /> },
    { name: 'Trash', icon: <TrashIcon /> }
  ]

  const browseItems = [
    { name: 'Explore', icon: <GlobeAltIcon /> },
    { name: 'Exams', icon: <ClipboardDocumentListIcon /> },
    { name: 'Store', icon: <ShoppingBagIcon /> }
  ]

  return (
    <aside className="hidden md:flex md:w-1/5 bg-color-2 p-4 flex-col justify-between overflow-y-auto h-full">
      <div>
        {/* Logo placeholder */}
        <a href=".">
          <img
            src={logotemp}
            alt="Logo"
            className="block mx-auto w-16 sm:w-20 border-b border-gray-200 pb-1 mb-3"
          />
        </a>
        <hr className="border-t border-gray-400 mb-4" />
        <nav>
          <p className="sidebar-category">Library</p>
          {menu.map(item => (
            <button
              key={item.name}
              onClick={() => setScreen(item.name.toLowerCase())}
              className={`sidebar-menu-button ${screen === item.name.toLowerCase() ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
          <p className="sidebar-category">Classes</p>
          <button className="sidebar-menu-button">
            <AcademicCapIcon />
            Classes
          </button>
          <p className="sidebar-category">Browse</p>
          {browseItems.map(item => (
            <button
              key={item.name}
              className="sidebar-menu-button"
            >
              {item.icon}
              {item.name}
            </button>
          ))}
          <p className="sidebar-category">AI Tools</p>
          <button className="sidebar-menu-button">
            <SparklesIcon />
            Rata AI
          </button>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar