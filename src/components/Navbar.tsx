import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  LayoutDashboard,
  Compass,
  Sliders,
  Target,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'welcome' | 'auth' | 'questionnaire' | 'dashboard' | 'goals' | 'explorer';
  setCurrentTab: (tab: 'welcome' | 'auth' | 'questionnaire' | 'dashboard' | 'goals' | 'explorer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const hasProfile = Boolean(user?.savedProfile);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E3EAF3] bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setCurrentTab(user ? (hasProfile ? 'dashboard' : 'questionnaire') : 'welcome')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3478F6] text-white font-bold text-sm tracking-tight shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[#17243A]">
                AI Finance Advisor
              </span>
              <span className="text-[10px] font-semibold text-[#3478F6] bg-[#EBF2FE] rounded px-1.5 py-0.5">
                4.0
              </span>
            </div>
            <p className="text-[11px] text-[#667085] hidden sm:block">
              Smart Financial Planning & Investment Advisory
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {!user && (
            <button
              onClick={() => setCurrentTab('welcome')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'welcome'
                  ? 'bg-[#EBF2FE] text-[#3478F6] font-semibold'
                  : 'text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC]'
              }`}
            >
              Overview
            </button>
          )}

          {user && (
            <>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentTab === 'dashboard'
                    ? 'bg-[#EBF2FE] text-[#3478F6] font-semibold'
                    : 'text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>

              <button
                onClick={() => setCurrentTab('goals')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentTab === 'goals'
                    ? 'bg-[#EBF2FE] text-[#3478F6] font-semibold'
                    : 'text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC]'
                }`}
              >
                <Target className="h-4 w-4" />
                My Financial Goals
              </button>

              <button
                onClick={() => setCurrentTab('questionnaire')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentTab === 'questionnaire'
                    ? 'bg-[#EBF2FE] text-[#3478F6] font-semibold'
                    : 'text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC]'
                }`}
              >
                <Sliders className="h-4 w-4" />
                Financial Profile
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentTab('explorer')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              currentTab === 'explorer'
                ? 'bg-[#EBF2FE] text-[#3478F6] font-semibold'
                : 'text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC]'
            }`}
          >
            <Compass className="h-4 w-4" />
            Market Explorer
          </button>
        </nav>

        {/* Right Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-lg border border-[#E3EAF3] bg-[#F8FAFD] px-3 py-1.5 text-xs font-medium text-[#17243A] hover:bg-[#F1F5FB] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EBF2FE] text-xs font-bold text-[#3478F6]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-[#E3EAF3] bg-white p-1.5 shadow-lg z-50 text-xs"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E3EAF3] mb-1">
                    <p className="font-semibold text-[#17243A] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#667085] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => setCurrentTab('questionnaire')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[#17243A] hover:bg-[#F5F8FC]"
                  >
                    <Sliders className="h-3.5 w-3.5 text-[#667085]" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[#17243A] hover:bg-[#F5F8FC]"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#667085]" />
                    Investment Plan
                  </button>

                  <button
                    onClick={() => setCurrentTab('goals')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[#17243A] hover:bg-[#F5F8FC]"
                  >
                    <Target className="h-3.5 w-3.5 text-[#667085]" />
                    Financial Goals
                  </button>

                  <div className="my-1 border-t border-[#E3EAF3]" />

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[#B91C1C] hover:bg-[#FDECEC]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentTab('auth')}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#667085] hover:text-[#17243A] transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={() => setCurrentTab('auth')}
                className="rounded-lg bg-[#3478F6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] shadow-xs transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#667085] hover:text-[#17243A]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3EAF3] bg-white px-4 py-3 space-y-1 text-xs">
          {!user && (
            <button
              onClick={() => {
                setCurrentTab('welcome');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-[#17243A]"
            >
              Overview
            </button>
          )}

          {user && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full py-2 text-[#17243A]"
              >
                <LayoutDashboard className="h-4 w-4 text-[#3478F6]" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentTab('goals');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full py-2 text-[#17243A]"
              >
                <Target className="h-4 w-4 text-[#3478F6]" />
                My Financial Goals
              </button>
              <button
                onClick={() => {
                  setCurrentTab('questionnaire');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full py-2 text-[#17243A]"
              >
                <Sliders className="h-4 w-4 text-[#3478F6]" />
                Financial Profile
              </button>
            </>
          )}

          <button
            onClick={() => {
              setCurrentTab('explorer');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full py-2 text-[#17243A]"
          >
            <Compass className="h-4 w-4 text-[#3478F6]" />
            Market Explorer
          </button>
        </div>
      )}
    </header>
  );
};
