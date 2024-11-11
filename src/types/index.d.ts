type JsonContent = Record<string, never>;

interface JsonFile {
  name: string;
  content: JsonContent;
  lastModified: number;
}

interface FileState {
  source: JsonFile | null;
  target: JsonFile | null;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationJob {
  sourceText: string;
  languages: string[];
  status: 'pending' | 'translating' | 'completed' | 'error';
  results?: Record<string, string>;
}
