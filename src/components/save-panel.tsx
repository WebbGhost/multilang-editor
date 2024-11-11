/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useState } from 'react';
import { Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '../context/I18nContext';

const SavePanel = () => {
  const { translations, fileStructure } = useI18n();
  const [saveStatus, setSaveStatus] = useState('');

  const deepMerge = (target:any, source:any) => {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  };

  const isObject = (item:any) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  const createNestedObject = (path:any, value:any) => {
    const parts = path.split('.');
    const result = {};
    let current:any = result;

    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    return result;
  };

  const handleExport = (language:any) => {
    try {
      // Get original content from file structure
      let originalContent:any = null;
      Object.entries(fileStructure[language] || {}).forEach(([filename, file]:any) => {
        if (filename === 'translation.json' && file.content) {
          originalContent = JSON.parse(JSON.stringify(file.content));
        }
      });

      // If no original content, use default structure
      if (!originalContent) {
        originalContent = {
          common: {},
          psp: {},
          succession_profile: {},
          okr: {},
          appraisal: {}
        };
      }

      // Get all changes from translations object
      const changes = {};
      const languageTranslations = translations[language]?.translation && translations[language]?.translation || {};

      // Convert flat paths to nested structure
      Object.entries(languageTranslations).forEach(([key, value]:any) => {
        if (typeof value === 'string') {
          const nestedObj = createNestedObject(key, value);
          deepMerge(changes, nestedObj);
        } else if (typeof value === 'object') {
          // Handle nested objects
          Object.entries(value).forEach(([subKey, subValue]) => {
            const fullPath = `${key}.${subKey}`;
            const nestedObj = createNestedObject(fullPath, subValue);
            deepMerge(changes, nestedObj);
          });
        }
      });

      // Merge original content with changes
      const finalContent = deepMerge(originalContent, changes);

      // Ensure the structure is maintained
      Object.keys(originalContent).forEach(key => {
        if (!finalContent[key]) {
          finalContent[key] = {};
        }
      });

      // Create and trigger download
      const blob = new Blob([JSON.stringify(finalContent, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `translation.${language}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000); // Clear status after 3 seconds
    } catch (error) {
      console.error('Export error:', error);
      setSaveStatus('error');
    }
  };

  // const previewTranslations = (language) => {
  //   // Get original content
  //   let content = null;
  //   Object.entries(fileStructure[language] || {}).forEach(([filename, file]) => {
  //     if (filename === 'translation.json' && file.content) {
  //       content = JSON.parse(JSON.stringify(file.content));
  //     }
  //   });

  //   if (!content) {
  //     content = {
  //       common: {},
  //       psp: {},
  //       succession_profile: {},
  //       okr: {},
  //       appraisal: {}
  //     };
  //   }

  //   return content;
  // };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-medium">Export Translations</h3>

      {saveStatus === 'success' && (
        <Alert className="bg-green-50 text-green-700 animate-in fade-in-0 slide-in-from-top-2">
          <AlertDescription>File exported successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
          <AlertDescription>Failed to export file. Please try again.</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          onClick={() => handleExport('en')}
        >
          <Download size={16} />
          Export English
        </button>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          onClick={() => handleExport('fr')}
        >
          <Download size={16} />
          Export French
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>• Preserves original file structure</p>
        <p>• Maintains all existing translations</p>
        <p>• Properly merges new translations</p>
        <p>• Maintains nested structure</p>
      </div>
    </div>
  );
};

export default SavePanel;
