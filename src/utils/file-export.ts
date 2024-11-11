// utils/fileExport.js

// Merge changes while maintaining original structure
const mergeTranslationChanges = (original, changes) => {
  const result = { ...original };
  
  const merge = (target, source, path = '') => {
    if (!target || !source) return target || source;

    Object.keys(source).forEach(key => {
      if (target.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          target[key] = merge(target[key], source[key], `${path}.${key}`);
        } else {
          target[key] = source[key];
        }
      }
    });
    
    return target;
  };

  return merge(result, changes);
};

// Function to download JSON file
const downloadJsonFile = (content, filename) => {
  const blob = new Blob([JSON.stringify(content, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportLanguageFile = (original, changes, language) => {
  const mergedContent = mergeTranslationChanges(original, changes);
  downloadJsonFile(mergedContent, `translation.${language}.json`);
};
