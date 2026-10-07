import { gemini } from "@/lib/ai/gemini";

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_CONCURRENCY = 5;

function buildDocumentInput(text: string) {
  return `task: retrieval | document: ${text}`;
}

function buildQueryInput(text: string) {
  return `task: retrieval | query: ${text}`;
}

async function embedText(text: string) {
  const response = await gemini.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = response.embeddings?.[0]?.values;

  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Invalid embedding returned. Expected ${EMBEDDING_DIMENSIONS} dimensions.`,
    );
  }

  return values;
}

export async function embedTexts(texts: string[]) {
  const embeddings: number[][] = new Array(texts.length);

  for (let start = 0; start < texts.length; start += EMBEDDING_CONCURRENCY) {
    const batch = texts.slice(start, start + EMBEDDING_CONCURRENCY);

    const batchEmbeddings = await Promise.all(
      batch.map((text) => embedText(buildDocumentInput(text))),
    );

    batchEmbeddings.forEach((embedding, index) => {
      embeddings[start + index] = embedding;
    });
  }

  return embeddings;
}

export async function embedQuery(text: string) {
  return embedText(buildQueryInput(text));
}
