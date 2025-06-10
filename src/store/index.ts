// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Ranch {
  id: string;
  name: string;
  location: string;
  size?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StoreState {
  // Usuario
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Rancho
  currentRanch: Ranch | null;
  setCurrentRanch: (ranch: Ranch | null) => void;
  
  // Onboarding
  isOnboardingComplete: boolean;
  setIsOnboardingComplete: (complete: boolean) => void;
  
  // Profile prompt
  profilePromptDismissed: boolean;
  setProfilePromptDismissed: (dismissed: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Usuario
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Rancho
      currentRanch: null,
      setCurrentRanch: (ranch) => set({ currentRanch: ranch }),
      
      // Onboarding
      isOnboardingComplete: false,
      setIsOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      
      // Profile prompt
      profilePromptDismissed: false,
      setProfilePromptDismissed: (dismissed) => set({ profilePromptDismissed: dismissed }),
    }),
    {
      name: 'ranchos-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentRanch: state.currentRanch,
        isOnboardingComplete: state.isOnboardingComplete,
        profilePromptDismissed: state.profilePromptDismissed,
      }),
    }
  )
);