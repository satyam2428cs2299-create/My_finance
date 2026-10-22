import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WelcomeView } from './components/WelcomeView';
import { AuthView } from './components/AuthView';
import { QuestionnaireView } from './components/QuestionnaireView';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { ExplorerView } from './components/ExplorerView';
import { DisclaimerModal } from './components/DisclaimerModal';
import { UserFinancialProfile } from './services/financialEngine';

type ActiveTab =
  | 'welcome'
  | 'auth'
  | 'questionnaire'
  | 'dashboard'
  | 'goals'
  | 'explorer';

const AppContent: React.FC = () => {
  const { user, saveUserProfile, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('welcome');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Sync tab with authentication state
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.savedProfile) {
          if (currentTab === 'welcome' || currentTab === 'auth') {
            setCurrentTab('dashboard');
          }
        } else {
          if (currentTab === 'welcome' || currentTab === 'auth') {
            setCurrentTab('questionnaire');
          }
        }
      }
    }
  }, [user, isLoading]);

  const handleQuestionnaireComplete = (profile: UserFinancialProfile) => {
    saveUserProfile(profile);
    setCurrentTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-[#3478F6] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#667085] font-medium">Loading AI Finance Advisor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#17243A]">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1">
        {/* Welcome */}
        {currentTab === 'welcome' && (
          <WelcomeView
            onGetStarted={() => {
              if (user) {
                setCurrentTab(user.savedProfile ? 'dashboard' : 'questionnaire');
              } else {
                setCurrentTab('auth');
              }
            }}
            onSignIn={() => setCurrentTab('auth')}
          />
        )}

        {/* Authentication View */}
        {currentTab === 'auth' && (
          <AuthView
            initialMode="register"
            onSuccess={() => {
              if (user?.savedProfile) {
                setCurrentTab('dashboard');
              } else {
                setCurrentTab('questionnaire');
              }
            }}
          />
        )}

        {/* Financial Profile Questionnaire */}
        {currentTab === 'questionnaire' && (
          user ? (
            <QuestionnaireView
              initialProfile={user.savedProfile}
              onComplete={handleQuestionnaireComplete}
            />
          ) : (
            <AuthView
              initialMode="register"
              onSuccess={() => setCurrentTab('questionnaire')}
            />
          )
        )}

        {/* Dashboard View */}
        {currentTab === 'dashboard' && (
          user && user.savedProfile ? (
            <DashboardView
              profile={user.savedProfile}
              onEditProfile={() => setCurrentTab('questionnaire')}
              onNavigateToExplorer={() => setCurrentTab('explorer')}
              onNavigateToGoals={() => setCurrentTab('goals')}
            />
          ) : user ? (
            <QuestionnaireView
              onComplete={handleQuestionnaireComplete}
            />
          ) : (
            <AuthView
              initialMode="login"
              onSuccess={() => setCurrentTab('dashboard')}
            />
          )
        )}

        {/* Financial Goals View */}
        {currentTab === 'goals' && (
          user && user.savedProfile ? (
            <GoalsView
              profile={user.savedProfile}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
              onNavigateToQuestionnaire={() => setCurrentTab('questionnaire')}
            />
          ) : user ? (
            <QuestionnaireView
              onComplete={handleQuestionnaireComplete}
            />
          ) : (
            <AuthView
              initialMode="login"
              onSuccess={() => setCurrentTab('goals')}
            />
          )
        )}

        {/* Market Explorer */}
        {currentTab === 'explorer' && <ExplorerView />}
      </main>

      <Footer
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
