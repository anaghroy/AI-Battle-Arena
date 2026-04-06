import { useState, useEffect } from 'react';

// Global cache to remember which message IDs have already been streamed
// This prevents re-streaming old messages when navigating between pages.
const streamingCache = new Set();

export const useTokenStream = (msgId, fullText = '', speedMs = 15) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Edge case: no text to stream
    if (!fullText) {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }

    // Edge case: already streamed this message before, instantly display it
    if (streamingCache.has(msgId) || speedMs === 0) {
      setDisplayedText(fullText);
      setIsComplete(true);
      return;
    }

    // Split text into word chunks + whitespaces so we can precisely reconstruct it
    const tokens = fullText.match(/(\S+|\s+)/g) || [];
    let currentIndex = 0;
    
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (currentIndex >= tokens.length) {
        clearInterval(interval);
        setIsComplete(true);
        streamingCache.add(msgId); // Mark as streamed
        return;
      }
      
      // Append the next token
      setDisplayedText((prev) => prev + tokens[currentIndex]);
      currentIndex++;
    }, speedMs);

    return () => clearInterval(interval);
  }, [msgId, fullText, speedMs]);

  return { displayedText, isComplete };
};

export default useTokenStream;
