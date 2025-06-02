import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  GlobeAltIcon,
  HomeIcon,
  SparklesIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import logotemp from "../assets/logotemp.png";

const Sidebar = ({ screen, setScreen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const libraryItems = [
    { name: "Home", icon: <HomeIcon /> },
    { name: "Materials", icon: <FolderIcon /> },
    { name: "Trash", icon: <TrashIcon /> },
  ];

  const browseItems = [
    { name: "Explore", icon: <GlobeAltIcon /> },
  ];

  return (
    <div className="relative">
      <aside
        className={`
          hidden md:flex
          ${isCollapsed ? "md:w-14" : "md:w-64"}
          bg-color-2 flex-col justify-between
          overflow-y-auto overflow-x-hidden
          h-full
          transition-[width] duration-300 ease-in-out
          relative
        `}
      >
        <div className={`${isCollapsed ? "px-2" : "px-4"} py-4`}>
          {/* Logo */}
          <a href=".">
            <img
              src={logotemp}
              alt="Logo"
              className={`
                block mx-auto
                ${isCollapsed ? "w-10" : "w-16 sm:w-20"}
                border-b border-gray-200 pb-1 mb-3
                transition-all duration-300
              `}
            />
          </a>

          <hr className="border-t border-gray-400 mb-4" />

          {/* Library Section */}
          {!isCollapsed && <p className="sidebar-category">Library</p>}
          <nav className="space-y-1">
            {libraryItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setScreen(item.name.toLowerCase())}
                className={`
                  sidebar-menu-button
                  ${screen === item.name.toLowerCase() ? "active" : ""}
                  ${isCollapsed ? "justify-center px-2" : ""}
                  whitespace-nowrap
                `}
                title={isCollapsed ? item.name : ""}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </button>
            ))}
          </nav>

          {/* Browse Section */}
          {!isCollapsed && <p className="sidebar-category mt-6">Browse</p>}
          <nav className="space-y-1">
            {browseItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setScreen(item.name.toLowerCase())}
                className={`
                  sidebar-menu-button
                  ${screen === item.name.toLowerCase() ? "active" : ""}
                  ${isCollapsed ? "justify-center px-2" : ""}
                  whitespace-nowrap
                `}
                title={isCollapsed ? item.name : ""}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </button>
            ))}

            {/* AI Tools section */}
            {!isCollapsed && <p className="sidebar-category">AI Tools</p>}
            <button
              onClick={() => setScreen("rata")}
              className={`
                sidebar-menu-button
                ${screen === "rata" ? "active" : ""}
                ${isCollapsed ? "justify-center px-2" : ""}
                whitespace-nowrap
              `}
              title={isCollapsed ? "Rata AI" : ""}
            >
              <SparklesIcon />
              {!isCollapsed && <span className="ml-3">Rata AI</span>}
            </button>
          </nav>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute top-4 right-0
          bg-white p-1.5
          rounded-full shadow-lg hover:bg-gray-100
          transition-colors border border-gray-200
          transform translate-x-1/2
          z-50
        "
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default Sidebar;
