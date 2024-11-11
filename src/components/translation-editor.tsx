import React, { useState, useEffect } from 'react';
import { Plus, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '../context/I18nContext';

const TranslationEditor = () => {
  const {
    selectedFile,
    selectedNode,
    languages,
    translations,
    activeLanguages,
    addTranslation
  } = useI18n();

  const [newTranslation, setNewTranslation] = useState({
    key: '',
    values: {}
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when selection changes
  useEffect(() => {
    setNewTranslation({
      key: '',
      values: Object.fromEntries(languages.map(lang => [lang, '']))
    });
    setError('');
    setSuccess('');
  }, [selectedNode, languages]);

  const getCurrentValue = (lang) => {
    if (!selectedFile || !selectedNode || !translations[lang]) return '';
    
    const parts = selectedNode.split('.');
    let current = translations[lang][selectedFile.namespace];
    
    for (const part of parts) {
      if (!current || typeof current !== 'object') return '';
      current = current[part];
    }
    
    return current || '';
  };

  const handleAddTranslation = () => {
    setError('');
    setSuccess('');

    if (!selectedFile || !selectedNode) {
      setError('Please select a file and node first');
      return;
    }

    if (!newTranslation.key.trim()) {
      setError('Please enter a key name');
      return;
    }

    // Validate all languages have values
    const missingLanguages = languages.filter(lang => !newTranslation.values[lang]);
    if (missingLanguages.length > 0) {
      setError(`Missing translations for: ${missingLanguages.join(', ')}`);
      return;
    }

    const fullPath = `${selectedNode}.${newTranslation.key}`;
    addTranslation(fullPath, newTranslation.values);

    // Show success message
    setSuccess(`Translation "${newTranslation.key}" added successfully`);

    // Reset form after a short delay
    setTimeout(() => {
      setNewTranslation({
        key: '',
        values: Object.fromEntries(languages.map(lang => [lang, '']))
      });
      setSuccess('');
    }, 3000);
  };

  if (!selectedFile || !selectedNode) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        Select a file and node to start editing translations
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      <div className="space-y-2">
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert 
            className="bg-green-50 text-green-700 border-green-200 animate-in fade-in-0 slide-in-from-top-2"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Current Selection Info */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Current Selection</h3>
        <div className="flex gap-2 text-sm">
          <span className="bg-blue-100 px-2 py-1 rounded">
            File: {selectedFile.path}
          </span>
          <span className="bg-blue-100 px-2 py-1 rounded">
            Path: {selectedNode}
          </span>
        </div>
      </div>

      {/* Current Values */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Current Values</h3>
        {languages.map(lang => (
          <div key={lang} className="space-y-1">
            <label className="text-sm text-gray-600">{lang}:</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-50"
              value={getCurrentValue(lang)}
              readOnly
            />
          </div>
        ))}
      </div>

      {/* Add New Translation */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Add New Translation</h3>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Key:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={newTranslation.key}
            onChange={(e) => setNewTranslation(prev => ({
              ...prev,
              key: e.target.value
            }))}
            placeholder="Enter new key name"
          />
        </div>

        {languages.map(lang => (
          <div key={lang} className="space-y-2">
            <label className="text-sm text-gray-600">{lang}:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={newTranslation.values[lang] || ''}
              onChange={(e) => setNewTranslation(prev => ({
                ...prev,
                values: {
                  ...prev.values,
                  [lang]: e.target.value
                }
              }))}
              placeholder={`Enter ${lang} translation`}
            />
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
            onClick={handleAddTranslation}
          >
            <Plus size={16} />
            Add Translation
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationEditor;
