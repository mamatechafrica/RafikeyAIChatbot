import React from 'react';
import { 

  User, 
  Moon,
  Sun,
  Menu
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

import { useEffect, useState } from "react";

function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch {
    return null;
  }
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  isSidebarCollapsed,
  toggleTheme,
  toggleSidebar,
}) => {
  const [user, setUser] = useState<{ sub?: string; username?: string; email?: string; is_admin?: boolean } | null>(null);

  useEffect(() => {
    // Try to get token from cookie
    let token: string | null = null;
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/);
      token = match ? decodeURIComponent(match[1]) : null;
    }
    if (token) {
      const decoded = decodeJWT(token);
      setUser(decoded);
    }
  }, []);

  return (
    <header className={`backdrop-blur-md border-b sticky top-0 z-10 ${
      isDarkMode
        ? 'bg-gray-800/90 border-gray-700/50'
        : 'bg-white/80 border-black/10'
    }`}>
      <div className="flex items-center justify-between px-4 py-2 sm:px-8 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl transition-all hover:scale-110 lg:hidden ${
              isDarkMode
                ? "bg-gray-700/50 hover:bg-gray-600/50 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className={`text-lg sm:text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
     
          {/* <div className="relative hidden md:block">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search Metrics..."
              className={`pl-10 pr-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDarkMode
                  ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400"
                  : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div> */}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${
              isDarkMode
                ? "bg-gray-700/50 hover:bg-gray-600/50 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* User info hidden on mobile, show only avatar */}
          <div
            className={`flex items-center px-2 py-1 rounded-xl ${
              isDarkMode
                ? "bg-gray-700/50 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:flex flex-col ml-2">
              <div className="text-sm font-medium">
                {user?.sub || user?.username || "Admin"}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {user?.email || "Admin"}
              </div>
            </div>
        
            <button
              onClick={() => {
                // Remove the admin_token cookie
                document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/";
              }}
              className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700/50 hover:bg-gray-600/50 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;