import { JsonFile } from './index';

export interface FileState {
  globalFile: JsonFile | null;
  englishFile: JsonFile | null;
  isLoading: boolean;
  error: string | null;
}

export interface FileActions {
  setGlobalFile: (file: JsonFile | null) => void;
  setEnglishFile: (file: JsonFile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFiles: () => void;
}

export type FileStore = FileState & FileActions;
