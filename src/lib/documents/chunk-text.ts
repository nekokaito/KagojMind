const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP,
) {
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return [];
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);

    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= cleanText.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}
