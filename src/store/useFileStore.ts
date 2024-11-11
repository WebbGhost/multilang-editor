import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JsonContent {
  [key: string]: never;
}

interface JsonFile {
  name: string;
  content: JsonContent;
  lastModified: number;
}

interface FileState {
  source: JsonFile | null;
  target: JsonFile | null;
}

interface TranslatorStore {
  files: FileState;
  isProcessing: boolean;
  error: string | null;
  setFile: (type: 'source' | 'target', file: JsonFile | null) => void;
  setProcessing: (status: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTranslatorStore = create<TranslatorStore>()(
  persist(
    (set) => ({
      files: {
        source: null,
        target: null
      },
      isProcessing: false,
      error: null,
      setFile: (type, file) => 
        set((state) => ({
          files: {
            ...state.files,
            [type]: file
          },
          error: null
        })),
      setProcessing: (status) => 
        set({ isProcessing: status }),
      setError: (error) => 
        set({ error }),
      reset: () => 
        set({
          files: {
            source: null,
            target: null
          },
          error: null
        })
    }),
    {
      name: 'json-translator-storage',
      partialize: (state) => ({
        files: state.files
      })
    }
  )
);
