import mammoth from "mammoth";

export async function extractDocxText(buffer: ArrayBuffer) {
  const result = await mammoth.extractRawText({
    arrayBuffer: buffer,
  });

  return {
    text: result.value,
  };
}
