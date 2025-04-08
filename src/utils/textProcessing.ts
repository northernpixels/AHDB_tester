export function processCardText(text: string | undefined): string {
  if (!text) return '';
  
  // Remove HTML-style tags (e.g., <b>Fight</b>)
  const withoutHtmlTags = text.replace(/<[^>]+>/g, '');
  
  // Remove wiki-style brackets (e.g., [[Firearm]])
  const withoutWikiLinks = withoutHtmlTags.replace(/\[\[([^\]]+)\]\]/g, '$1');
  
  return withoutWikiLinks;
}
