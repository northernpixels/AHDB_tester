interface ProcessedText {
  text: string;
  specialTerms: string[];
}

export function processCardText(text: string | undefined): ProcessedText {
  if (!text) return { text: '', specialTerms: [] };
  
  // Remove HTML-style tags (e.g., <b>Fight</b>)
  let processedText = text.replace(/<[^>]+>/g, '');
  
  // Extract terms in single brackets for image lookup
  const specialTerms: string[] = [];
  processedText = processedText.replace(/\[([^\[\]]+)\]/g, (match, term) => {
    if (!term.includes('elder sign')) { // Don't include elder sign in special terms
      specialTerms.push(term.trim());
    }
    return match; // Keep the original [term] in the text
  });
  
  // Convert [[term]] to bold and italic
  processedText = processedText.replace(/\[\[([^\]]+)\]\]/g, '*_$1_*');
  
  return { text: processedText, specialTerms };
}
