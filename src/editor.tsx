// pages/Editor.tsx
import  { useState, useEffect } from 'react';
import { TreeNode, TreeView } from './components/file-tree';
import { useTranslatorStore } from './store/useFileStore';
import { convertJsonToTree, updateJsonByPath, deleteJsonByPath } from './utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { TranslationModal } from './components/translate';
import { translateJson } from './services/translate';
import { TranslationJob } from './types';

export default function Editor() {
  const files = useTranslatorStore((state) => state.files);
  const setFile = useTranslatorStore((state) => state.setFile);
  const [sourceTree, setSourceTree] = useState<TreeNode | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationJob, setTranslationJob] = useState<TranslationJob | null>(null);

  useEffect(() => {
    if (files.source) {
      setSourceTree(convertJsonToTree(files.source.content));
    }
  }, [files.source]);

  const handleToggle = (path: string[]) => {
    if (!sourceTree) return;
    
    const updateNodeExpanded = (node: TreeNode, targetPath: string[]): TreeNode => {
      if (targetPath.length === 0) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (!node.children) return node;
      
      const [head, ...rest] = targetPath;
      return {
        ...node,
        children: node.children.map(child => 
          child.key === head ? updateNodeExpanded(child, rest) : child
        )
      };
    };
    
    setSourceTree(updateNodeExpanded(sourceTree, path));
  };

  const handleAdd = (path: string[], key: string, value: string) => {
    if (!files.source) return;
    
    const newContent = updateJsonByPath(
      files.source.content,
      [...path, key],
      value
    );
    
    setFile('source', {
      ...files.source,
      content: newContent
    });
  };

  const handleEdit = (path: string[], value: string) => {
    if (!files.source) return;
    
    const newContent = updateJsonByPath(
      files.source.content,
      path,
      value
    );
    
    setFile('source', {
      ...files.source,
      content: newContent
    });
  };

  const handleDelete = (path: string[]) => {
    if (!files.source) return;
    
    const newContent = deleteJsonByPath(
      files.source.content,
      path
    );
    
    setFile('source', {
      ...files.source,
      content: newContent
    });
  };

  const getNodeValueByPath = (content: never, path: string[]) => {
    let current = content;
    for (const key of path) {
      if (current[key] === undefined) return undefined;
      current = current[key];
    }
    return current;
  };

  const handlePreview = (path: string[]) => {
    setSelectedPath(path);
    setShowPreview(true);
  };

  const handleTranslate = async (languages: string[]) => {
    const contentToTranslate = selectedPath.length === 0
      ? files.source?.content
      : getNodeValueByPath(files.source?.content, selectedPath);

    if (!contentToTranslate) return;

    setTranslationJob({
      sourceText: JSON.stringify(contentToTranslate, null, 2),
      languages,
      status: 'translating'
    });

    try {
      const results = await Promise.all(
        languages.map(async (lang) => {
          try {
            // Add loading indicator for current language
            setTranslationJob(prev => ({
              ...prev!,
              status: 'translating',
              currentLanguage: lang
            }));

            const translatedContent = await translateJson(
              contentToTranslate,
              lang
            );

            return [lang, JSON.stringify(translatedContent, null, 2)];
          } catch (error) {
            console.error(`Translation error for ${lang}:`, error);
            return [lang, `Error translating to ${lang}: ${error.message}`];
          }
        })
      );

      setTranslationJob(prev => ({
        ...prev!,
        status: 'completed',
        results: Object.fromEntries(results),
        currentLanguage: undefined
      }));
    } catch (error) {
      console.error('Translation job error:', error);
      setTranslationJob(prev => ({
        ...prev!,
        status: 'error',
        currentLanguage: undefined
      }));
    }
  };

  const handleExport = (language: string) => {
    if (!translationJob?.results?.[language]) return;
    
    const blob = new Blob([translationJob.results[language]], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${language}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!sourceTree) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Please upload a source file first</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 h-[calc(100vh-4rem)] overflow-hidden">
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-200">JSON Editor</h2>
            <Button
              variant="outline"
              onClick={() => handlePreview([])}
              className="gap-2 bg-zinc-900 hover:bg-zinc-900 hover:text-white"
            >
              <Eye className="h-4 w-4" />
              Preview All
            </Button>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 h-[calc(100vh-10rem)] overflow-y-auto">
            <TreeView
              node={sourceTree}
              onToggle={handleToggle}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPreview={handlePreview}
            />
          </div>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-200">
              {selectedPath.length === 0 
                ? "Full JSON Preview" 
                : `Preview: ${selectedPath.join('.')}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="overflow-y-auto max-h-[60vh]">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950 p-4 rounded-lg">
                {JSON.stringify(
                  selectedPath.length === 0
                    ? files.source?.content
                    : getNodeValueByPath(files.source?.content, selectedPath),
                  null,
                  2
                )}
              </pre>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowTranslation(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              Translate Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TranslationModal
        isOpen={showTranslation}
        onClose={() => setShowTranslation(false)}
        sourceText={JSON.stringify(
          selectedPath.length === 0
            ? files.source?.content
            : getNodeValueByPath(files.source?.content, selectedPath),
          null,
          2
        )}
        onTranslate={handleTranslate}
        onExport={handleExport}
        translationJob={translationJob}
      />
    </>
  );
}
