import { create } from 'zustand';

type Toy = {
  id: string;
  name: string;
  description: string;
  modelUrl: string;
  year: number;
  inventor: string;
};

type UIState = {
  isInfoPanelOpen: boolean;
  isLoadingModel: boolean;
  isMobileMenuOpen: boolean;
  audioEnabled: boolean;
};

interface StoreState {
  // Current active toy
  activeToy: Toy | null;
  setActiveToy: (toy: Toy | null) => void;
  
  // UI visibility state
  ui: UIState;
  toggleInfoPanel: () => void;
  setLoadingModel: (isLoading: boolean) => void;
  toggleMobileMenu: () => void;
  toggleAudio: () => void;
  
  // Viewing history
  viewHistory: string[]; // IDs of viewed toys
  addToHistory: (toyId: string) => void;
  clearHistory: () => void;
}

export const useStore = create<StoreState>((set) => ({
  // Active toy state
  activeToy: null,
  setActiveToy: (toy) => set({ activeToy: toy }),
  
  // UI state
  ui: {
    isInfoPanelOpen: false,
    isLoadingModel: false,
    isMobileMenuOpen: false,
    audioEnabled: false,
  },
  toggleInfoPanel: () => 
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        isInfoPanelOpen: !state.ui.isInfoPanelOpen 
      } 
    })),
  setLoadingModel: (isLoading) => 
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        isLoadingModel: isLoading 
      } 
    })),
  toggleMobileMenu: () => 
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        isMobileMenuOpen: !state.ui.isMobileMenuOpen 
      } 
    })),
  toggleAudio: () => 
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        audioEnabled: !state.ui.audioEnabled 
      } 
    })),
  
  // History state
  viewHistory: [],
  addToHistory: (toyId) => 
    set((state) => ({ 
      viewHistory: [
        toyId, 
        ...state.viewHistory.filter(id => id !== toyId)
      ].slice(0, 10) // Keep last 10 items
    })),
  clearHistory: () => set({ viewHistory: [] }),
})); 