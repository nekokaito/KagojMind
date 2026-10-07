import { extractText } from "unpdf";

export async function extractPdfText(buffer: ArrayBuffer) {
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: false,
  });

  return {
    pages: text,
    pageCount: totalPages,
  };
}
