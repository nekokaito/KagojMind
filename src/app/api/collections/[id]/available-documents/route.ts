import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id: collectionId } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    /*
     * 1. Verify that the collection belongs
     *    to the authenticated user.
     */
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        {
          success: false,
          error: "Collection not found.",
        },
        { status: 404 },
      );
    }

    /*
     * 2. Get all ready documents belonging
     *    to the authenticated user.
     */
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select(
        `
          id,
          title,
          file_name,
          file_type,
          file_size,
          page_count,
          status,
          created_at
        `,
      )
      .eq("user_id", user.id)
      .eq("status", "ready")
      .order("created_at", {
        ascending: false,
      });

    if (documentsError) {
      console.error("Failed to fetch documents:", documentsError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load your documents.",
        },
        { status: 500 },
      );
    }

    /*
     * 3. Get documents already inside
     *    this collection.
     */
    const { data: collectionDocuments, error: relationError } = await supabase
      .from("collection_documents")
      .select("document_id")
      .eq("collection_id", collectionId);

    if (relationError) {
      console.error("Failed to fetch collection documents:", relationError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load collection documents.",
        },
        { status: 500 },
      );
    }

    /*
     * 4. Build a Set for quick lookup.
     */
    const existingDocumentIds = new Set(
      (collectionDocuments ?? []).map((item) => item.document_id),
    );

    /*
     * 5. Only return ready documents that
     *    aren't already in this collection.
     */
    const availableDocuments = (documents ?? []).filter(
      (document) => !existingDocumentIds.has(document.id),
    );

    return NextResponse.json({
      success: true,
      documents: availableDocuments,
    });
  } catch (error) {
    console.error("Available documents API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
