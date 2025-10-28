import React from 'react';
import { 
  Activity, 
  Grid3X3, 
  Users, 
  ChevronLeft,
  Award
} from 'lucide-react';
import Image from 'next/image';


interface SidebarProps {
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isDarkMode, 
  isSidebarCollapsed, 
  toggleSidebar 
}) => {
  return (
    <div className={`fixed left-0 top-0 h-full backdrop-blur-md border-r transition-all duration-300 z-20 ${
      isSidebarCollapsed ? 'w-16' : 'w-64'
    } ${
      isDarkMode 
        ? 'bg-gray-800/90 border-gray-700/50' 
        : 'bg-white/80 border-black/10'
    }`}>
      <div className="p-6">
        <div className={`flex items-center mb-8 transition-all duration-300 ${
          isSidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
            {/* <Activity className="w-6 h-6 text-white" /> */}
            <Image src="/logo.png" alt="Logo" width={48} height={48} />
          </div>
          <span className={`text-xl font-bold transition-all duration-300 ${
            isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            RAFIKey
          </span>
        </div>
        
        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-6 -right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
              : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-sm'
          }`}
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${
            isSidebarCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
        
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
              ${isSidebarCollapsed ? "justify-center" : "space-x-3"}
              ${isDarkMode ? "bg-gray-700/50 text-white" : "text-gray-900"}
            `}
            tabIndex={0}
          >
            <span className="flex items-center justify-center w-6 h-6">
              <Grid3X3 className="w-5 h-5" />
            </span>
            <span
              className={`font-medium transition-all duration-300
                ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
              `}
            >
              Dashboard
            </span>
          </a>
          <a
            href="/dashboard/resources-management"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 hover:bg-opacity-10 group
              ${isSidebarCollapsed ? "justify-center" : "space-x-3"}
              ${isDarkMode
                ? "text-gray-400 hover:bg-gray-700/30 hover:text-white"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}
            `}
            tabIndex={0}
          >
            <span className="flex items-center justify-center w-6 h-6">
              <Users className="w-5 h-5" />
            </span>
            <span
              className={`font-medium transition-all duration-300
                ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "w-auto"}
              `}
            >
              Resource mgmt
            </span>
            <div
              className={`w-2 h-2 bg-red-500 rounded-full transition-all duration-300
                ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 ml-auto"}
              `}
            ></div>
          </a>
        </nav>
        {/* Analysis Link */}
        <a
          href="/dashboard/analysis"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 hover:bg-opacity-10 group
            ${isSidebarCollapsed ? "justify-center" : "space-x-3"}
            ${isDarkMode
              ? "text-gray-400 hover:bg-gray-700/30 hover:text-white"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}
          `}
          tabIndex={0}
        >
          <span className="flex items-center justify-center w-6 h-6">
            <Activity className="w-5 h-5" />
          </span>
          <span
            className={`font-medium transition-all duration-300
              ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
            `}
          >
            Analysis
          </span>
        </a>
        {/* Admins Link */}
        <a
          href="/dashboard/admins"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 hover:bg-opacity-10 group
            ${isSidebarCollapsed ? "justify-center" : "space-x-3"}
            ${isDarkMode
              ? "text-gray-400 hover:bg-gray-700/30 hover:text-white"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}
          `}
          tabIndex={0}
        >
          <span className="flex items-center justify-center w-6 h-6">
            <Users className="w-5 h-5" />
          </span>
          <span
            className={`font-medium transition-all duration-300
              ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
            `}
          >
            Admins
          </span>
        </a>
        {/* Gamification Link */}
        <a
          href="/dashboard/gamification"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 hover:bg-opacity-10 group
            ${isSidebarCollapsed ? "justify-center" : "space-x-3"}
            ${isDarkMode
              ? "text-yellow-400 hover:bg-gray-700/30 hover:text-yellow-300"
              : "text-yellow-700 hover:bg-yellow-100 hover:text-yellow-900"}
          `}
          tabIndex={0}
        >
          <span className="flex items-center justify-center w-6 h-6">
            <Award className="w-5 h-5" />
          </span>
          <span
            className={`font-medium transition-all duration-300
              ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
            `}
          >
            Gamification
          </span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;