import React, { useState, useEffect } from 'react';
import { translateContent } from '../services/gemini';

interface TranslatedTextProps {
  text: string;
  lang: string;
  className?: string;
}

export default function TranslatedText({ text, lang, className }: TranslatedTextProps) {
  const [translated, setTranslated] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If language is English, we assume the source is English and don't translate for now
    if (lang === 'en') {
      setTranslated(text);
      return;
    }

    // If the text is already translated in state, don't re-translate unless lang changes
    // This is handled by the dependency array, but we can be explicit
    
    let isMounted = true;
    const handleTranslation = async () => {
      // Don't translate if text is empty
      if (!text || text.trim() === '') return;

      setLoading(true);
      try {
        const result = await translateContent(text, lang);
        if (isMounted && result) {
          setTranslated(result);
        }
      } catch (err) {
        console.error("Component Translation Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    handleTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, lang]);

  return (
    <span className={`${className} ${loading ? 'opacity-50 animate-pulse' : 'opacity-100 transition-opacity duration-500'}`}>
      {translated}
    </span>
  );
}
