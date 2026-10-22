import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserFinancialProfile, UserGoal } from '../services/financialEngine';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isDemoUser: boolean;
  savedProfile?: UserFinancialProfile;
  goals?: UserGoal[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (preset?: 'young-professional' | 'family-planner' | 'high-earner') => void;
  logout: () => void;
  saveUserProfile: (profile: UserFinancialProfile) => void;
  addGoal: (goal: Omit<UserGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<UserGoal>) => void;
  deleteGoal: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS_KEY = 'ai_finance_users_db_v4';
const STORAGE_CURRENT_USER_KEY = 'ai_finance_current_user_v4';

// Pre-packaged realistic Indian profiles for reviewers/faculty
export const PRESET_PROFILES: Record<string, { user: Partial<User>; profile: UserFinancialProfile }> = {
  'young-professional': {
    user: {
      id: 'demo-user-1',
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      isDemoUser: true,
      goals: [
        {
          id: 'goal-demo-1',
          name: 'Emergency Cushion Reserve',
          category: 'Emergency Cushion',
          targetAmount: 300000,
          currentSaved: 150000,
          targetDate: '2027-06',
          priority: 'High',
          description: '6 months of living expenses safely parked in liquid instruments',
          assumedReturnRate: 0,
          createdAt: '2026-01-15T00:00:00.000Z',
        },
        {
          id: 'goal-demo-2',
          name: 'Professional Tech & Certification',
          category: 'Higher Education',
          targetAmount: 120000,
          currentSaved: 40000,
          targetDate: '2027-12',
          priority: 'Medium',
          description: 'AI & cloud architecture certifications and workstation upgrade',
          assumedReturnRate: 6.5,
          createdAt: '2026-02-10T00:00:00.000Z',
        },
      ],
    },
    profile: {
      age: 26,
      occupation: 'Salaried Employee',
      knowledgeLevel: 'Intermediate',
      dependents: 0,
      goal: 'Wealth Growth',
      monthlyIncome: 95000,
      monthlyExpenses: 40000,
      monthlyEMI: 10000,
      existingSavings: 350000,
      riskTolerance: 'High',
      expectedSalaryGrowth: 10,
      investmentHorizonYears: 10,
    },
  },
  'family-planner': {
    user: {
      id: 'demo-user-2',
      name: 'Pooja Iyer',
      email: 'pooja.iyer@example.com',
      isDemoUser: true,
      goals: [
        {
          id: 'goal-demo-3',
          name: 'Children Higher Education',
          category: 'Higher Education',
          targetAmount: 1500000,
          currentSaved: 500000,
          targetDate: '2030-06',
          priority: 'High',
          description: 'College tuition and admission fund for two children',
          assumedReturnRate: 9.0,
          createdAt: '2026-01-10T00:00:00.000Z',
        },
        {
          id: 'goal-demo-4',
          name: 'Family Vacation',
          category: 'Travel / Vacation',
          targetAmount: 180000,
          currentSaved: 60000,
          targetDate: '2027-10',
          priority: 'Low',
          description: 'Annual family holiday trip',
          assumedReturnRate: 0,
          createdAt: '2026-03-01T00:00:00.000Z',
        },
      ],
    },
    profile: {
      age: 35,
      occupation: 'Business Owner',
      knowledgeLevel: 'Advanced',
      dependents: 2,
      goal: 'Education',
      monthlyIncome: 180000,
      monthlyExpenses: 80000,
      monthlyEMI: 35000,
      existingSavings: 1200000,
      riskTolerance: 'Moderate',
      expectedSalaryGrowth: 7,
      investmentHorizonYears: 12,
    },
  },
  'high-earner': {
    user: {
      id: 'demo-user-3',
      name: 'Vikramaditya Verma',
      email: 'vikram.verma@example.com',
      isDemoUser: true,
      goals: [
        {
          id: 'goal-demo-5',
          name: 'Home Down Payment Buffer',
          category: 'Home Down Payment',
          targetAmount: 2500000,
          currentSaved: 1000000,
          targetDate: '2028-12',
          priority: 'High',
          description: 'Down payment for suburban villa acquisition',
          assumedReturnRate: 8.0,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
    profile: {
      age: 42,
      occupation: 'Self-Employed',
      knowledgeLevel: 'Advanced',
      dependents: 3,
      goal: 'Retirement',
      monthlyIncome: 350000,
      monthlyExpenses: 120000,
      monthlyEMI: 45000,
      existingSavings: 4500000,
      riskTolerance: 'Moderate',
      expectedSalaryGrowth: 5,
      investmentHorizonYears: 15,
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse current user from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsersDB = (): Record<string, { user: User; passwordHash: string }> => {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveUsersDB = (db: Record<string, { user: User; passwordHash: string }>) => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(db));
  };

  const persistUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Also update in DB if registered
    if (!updatedUser.isDemoUser) {
      const db = getUsersDB();
      if (db[updatedUser.email]) {
        db[updatedUser.email].user = updatedUser;
        saveUsersDB(db);
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const db = getUsersDB();
    const record = db[cleanEmail];

    if (!record) {
      return { success: false, error: 'No account found with this email. Please create an account.' };
    }

    if (record.passwordHash !== btoa(password)) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    setUser(record.user);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(record.user));
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const db = getUsersDB();
    if (db[cleanEmail]) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      isDemoUser: false,
      goals: [],
    };

    db[cleanEmail] = {
      user: newUser,
      passwordHash: btoa(password),
    };

    saveUsersDB(db);
    setUser(newUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const loginAsDemo = (presetKey: 'young-professional' | 'family-planner' | 'high-earner' = 'young-professional') => {
    const preset = PRESET_PROFILES[presetKey] || PRESET_PROFILES['young-professional'];
    const demoUser: User = {
      id: preset.user.id || 'demo-1',
      name: preset.user.name || 'Demo Investor',
      email: preset.user.email || 'demo@aifinanceadvisor.internal',
      createdAt: new Date().toISOString(),
      isDemoUser: true,
      savedProfile: preset.profile,
      goals: preset.user.goals || [],
    };

    setUser(demoUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  };

  const saveUserProfile = (profile: UserFinancialProfile) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      savedProfile: profile,
    };
    persistUser(updatedUser);
  };

  const addGoal = (goalData: Omit<UserGoal, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newGoal: UserGoal = {
      ...goalData,
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    const currentGoals = user.goals || [];
    const updatedUser: User = {
      ...user,
      goals: [...currentGoals, newGoal],
    };
    persistUser(updatedUser);
  };

  const updateGoal = (id: string, updates: Partial<UserGoal>) => {
    if (!user) return;
    const currentGoals = user.goals || [];
    const updatedGoals = currentGoals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    const updatedUser: User = {
      ...user,
      goals: updatedGoals,
    };
    persistUser(updatedUser);
  };

  const deleteGoal = (id: string) => {
    if (!user) return;
    const currentGoals = user.goals || [];
    const updatedGoals = currentGoals.filter((g) => g.id !== id);
    const updatedUser: User = {
      ...user,
      goals: updatedGoals,
    };
    persistUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        saveUserProfile,
        addGoal,
        updateGoal,
        deleteGoal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
