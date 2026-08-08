import React, { useState } from 'react';
import { Utensils, Plus, HelpCircle, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenHowItWorks: () => void;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenHowItWorks,
  onOpenAuthModal,
  activeCount,
}) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-[#EBE9E4] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A7D55] flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D3436]">
                  Leftover Share
                </span>
                {activeCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5A7D55]/10 text-[#5A7D55] border border-[#5A7D55]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5A7D55] mr-1.5 animate-pulse"></span>
                    {activeCount} active
                  </span>
                )}
              </div>
              <p className="hidden sm:block text-[10px] uppercase tracking-widest text-[#5A7D55] font-semibold">
                Community Food Exchange
              </p>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenHowItWorks}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-full text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200/80 transition-colors cursor-pointer"
              title="How Leftover Share Works"
            >
              <HelpCircle className="w-4 h-4 text-[#5A7D55]" />
              <span className="hidden md:inline">How It Works</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#E98A4A] hover:bg-[#D3763D] shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Post Food Donation</span>
              <span className="sm:hidden">Post Food</span>
            </button>

            {/* Auth Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 rounded-full border border-[#EBE9E4] bg-white hover:bg-stone-50 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-[#5A7D55] text-white font-bold text-xs flex items-center justify-center">
                    {initial}
                  </div>
                  <span className="text-xs font-semibold text-[#2D3436] max-w-[100px] truncate hidden sm:inline">
                    {displayName}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#EBE9E4] py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-[#EBE9E4]">
                      <p className="text-xs font-bold text-[#2D3436] truncate">{displayName}</p>
                      <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 font-semibold hover:bg-rose-50 flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => onOpenAuthModal('signin')}
                  className="inline-flex items-center space-x-1 px-3 py-2 rounded-full text-xs font-semibold text-[#5A7D55] hover:bg-[#5A7D55]/10 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="hidden sm:inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold text-white bg-[#5A7D55] hover:bg-[#4A6946] transition-colors cursor-pointer"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

