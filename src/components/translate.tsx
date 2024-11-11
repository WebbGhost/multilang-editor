// components/TranslationModal.tsx
import React, { useState } from 'react';
import {  Loader2, Download,  Globe2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranslationJob } from '@/types';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  onTranslate: (languages: string[]) => Promise<void>;
  onExport: (language: string) => void;
  translationJob: TranslationJob | null;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  sourceText,
  onTranslate,
  onExport,
  translationJob
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('languages');

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  const handleTranslate = async () => {
    if (selectedLanguages.length > 0) {
      await onTranslate(selectedLanguages);
      setActiveTab('results');
    }
  };

  const getProgressValue = () => {
    if (!translationJob?.languages.length) return 0;
    if (translationJob.status === 'completed') return 100;
    if (translationJob.status !== 'translating') return 0;
    
    const totalLanguages = translationJob.languages.length;
    const completedLanguages = Object.keys(translationJob.results || {}).length;
    return (completedLanguages / totalLanguages) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-800 p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-xl text-slate-200">Translate Content</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Select languages and translate your JSON content
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b border-slate-800 px-6">
            <TabsList className="bg-slate-900">
              <TabsTrigger value="languages" className="data-[state=active]:bg-slate-800">
                Languages
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-slate-800">
                Results
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-slate-800">
                Source
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="languages" className="mt-0 flex-1">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-200">Select Languages</h3>
                  <Badge variant="secondary" className="bg-slate-800">
                    {selectedLanguages.length} selected
                  </Badge>
                </div>
                <ScrollArea className="h-[400px] rounded-md border border-slate-800 bg-slate-950/50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <label
                        key={lang.code}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedLanguages.includes(lang.code)}
                          onCheckedChange={() => handleLanguageToggle(lang.code)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-sm text-slate-200">
                          {lang.flag} {lang.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {translationJob?.status === 'translating' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Translation Progress</span>
                    <span className="text-slate-400">{Math.round(getProgressValue())}%</span>
                  </div>
                  <Progress value={getProgressValue()} className="h-2" />
                  {translationJob.currentLanguage && (
                    <p className="text-sm text-slate-400">
                      Translating to {SUPPORTED_LANGUAGES.find(l => l.code === translationJob.currentLanguage)?.name}...
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleTranslate}
                disabled={selectedLanguages.length === 0 || translationJob?.status === 'translating'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {translationJob?.status === 'translating' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  'Translate'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-0 flex-1">
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-4">
                {translationJob?.status === 'completed' && translationJob.results && (
                  <div className="space-y-4">
                    {Object.entries(translationJob.results).map(([langCode, text]) => {
                      const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
                      return (
                        <div
                          key={langCode}
                          className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-200">
                              {language?.flag} {language?.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onExport(langCode)}
                              className="h-8 text-blue-400 hover:text-blue-300"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <ScrollArea className="h-[200px] rounded-md bg-slate-950 p-4">
                            <pre className="text-sm text-slate-400 whitespace-pre-wrap">
                              {text}
                            </pre>
                          </ScrollArea>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="mt-0 flex-1">
            <ScrollArea className="h-[500px]">
              <div className="p-6">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <pre className="text-sm text-slate-400 whitespace-pre-wrap">
                    {sourceText}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
