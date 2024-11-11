/* eslint-disable @typescript-eslint/no-explicit-any */
// context/I18nContext.js
import  { createContext, useContext, useState, useCallback, } from 'react';

const I18nContext = createContext(null);

export const I18nProvider = ({ children }:{
  children:any
}) => {
  // File structure and selection state
  const [fileStructure, setFileStructure] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // Languages and translations state
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [activeLanguages, setActiveLanguages] = useState({
    source: null,
    target: null
  });

  // Error handling
  const [error, setError] = useState('');

  // File processing functions
  const processJsonFile = useCallback(async (file:any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e:any) => {
        try {
          const content = JSON.parse(e.target.result);
          const pathParts = file.webkitRelativePath.split('/');
          const localeIndex = pathParts.findIndex((part:any) => part === 'locales');
          
          if (localeIndex !== -1 && pathParts[localeIndex + 1]) {
            const lang = pathParts[localeIndex + 1];
            resolve({
              lang,
              path: file.webkitRelativePath,
              content,
              namespace: pathParts[pathParts.length - 1].replace('.json', '')
            });
          } else {
            reject(new Error('Invalid file structure'));
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const readFiles = useCallback(async (files:any) => {
    try {
      setError('');
      const filePromises:any = [];
      const foundLanguages = new Set();
      const structure = {};
      const translationData = {};

      Array.from(files).forEach((file:any) => {
        if (file.name.endsWith('.json')) {
          filePromises.push(processJsonFile(file));
        }
      });

      const results = await Promise.all(filePromises);
      
      results.forEach(({ lang, path, content, namespace }) => {
        foundLanguages.add(lang);
        
        // Build file structure
        let current:any = structure;
        path.split('/').forEach((part:any, index:any, arr:any) => {
          if (index === arr.length - 1) {
            current[part] = {
              type: 'file',
              content,
              path,
              lang,
              namespace
            };
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        });

        // Store translations
        if (!translationData[lang]) {
          translationData[lang] = {};
        }
        translationData[lang][namespace] = content;
      });

      setLanguages(Array.from(foundLanguages));
      setFileStructure(structure);
      setTranslations(translationData);

    } catch (err) {
      setError(`Error processing files: ${err.message}`);
      console.error('Error processing files:', err);
    }
  }, [processJsonFile]);

  // Translation management functions
  const addTranslation = useCallback((nodePath, translations) => {
    setTranslations(prev => {
      const updated = { ...prev };
      Object.entries(translations).forEach(([lang, value]) => {
        if (!updated[lang]) return;
        
        const pathParts = nodePath.split('.');
        let current = updated[lang];
        
        // Navigate to the correct position
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }
        
        // Add the new translation
        current[pathParts[pathParts.length - 1]] = value;
      });
      
      return updated;
    });
  }, []);

  const value = {
    // State
    fileStructure,
    selectedFile,
    selectedNode,
    expandedNodes,
    languages,
    translations,
    activeLanguages,
    error,

    // Setters
    setFileStructure,
    setSelectedFile,
    setSelectedNode,
    setExpandedNodes,
    setLanguages,
    setTranslations,
    setActiveLanguages,
    setError,

    // Functions
    readFiles,
    addTranslation
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
