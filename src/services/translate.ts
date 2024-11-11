// services/freeTranslationService.ts
const LIBRE_TRANSLATE_URL = 'https://libretranslate.de/translate'; // You can self-host or use other instances
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

/**
 * Try LibreTranslate first, fallback to MyMemory if it fails
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang = 'en'
): Promise<string> {
  try {
    // Try LibreTranslate first
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('LibreTranslate failed');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    // Fallback to MyMemory
    try {
      const response = await fetch(
        `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );

      const data = await response.json();
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
      throw new Error('Translation failed');
    } catch (error) {
      throw new Error(`Translation failed: ${error.message}`);
    }
  }
}

// Function to handle rate limiting and chunking
async function translateWithRateLimit(
  texts: string[],
  targetLang: string,
  sourceLang = 'en'
): Promise<string[]> {
  const results: string[] = [];
  const CHUNK_SIZE = 5; // Number of concurrent requests
  const DELAY = 1000; // Delay between chunks in ms

  for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
    const chunk = texts.slice(i, i + CHUNK_SIZE);
    const translations = await Promise.all(
      chunk.map(text => translateText(text, targetLang, sourceLang))
    );
    results.push(...translations);
    
    if (i + CHUNK_SIZE < texts.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  return results;
}

// Function to extract translatable strings from JSON
function extractStrings(obj: any): { strings: string[]; paths: string[][] } {
  const strings: string[] = [];
  const paths: string[][] = [];

  function extract(current: any, path: string[] = []) {
    if (typeof current === 'string') {
      strings.push(current);
      paths.push(path);
    } else if (Array.isArray(current)) {
      current.forEach((item, index) => {
        extract(item, [...path, index.toString()]);
      });
    } else if (typeof current === 'object' && current !== null) {
      Object.entries(current).forEach(([key, value]) => {
        extract(value, [...path, key]);
      });
    }
  }

  extract(obj);
  return { strings, paths };
}

// Function to rebuild JSON with translated strings
function rebuildJson(
  original: any,
  translatedStrings: string[],
  paths: string[][]
): any {
  const result = JSON.parse(JSON.stringify(original));

  paths.forEach((path, index) => {
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = translatedStrings[index];
  });

  return result;
}

export async function translateJson(
  content: any,
  targetLang: string,
  sourceLang = 'en'
): Promise<any> {
  // Extract all translatable strings and their paths
  const { strings, paths } = extractStrings(content);

  if (strings.length === 0) return content;

  // Translate all strings with rate limiting
  const translatedStrings = await translateWithRateLimit(strings, targetLang, sourceLang);

  // Rebuild the JSON with translated strings
  return rebuildJson(content, translatedStrings, paths);
}
