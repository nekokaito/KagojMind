import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: collectionId } = await params;

    const body = (await request.json()) as {
      documentId?: string;
    };

    const documentId = body.documentId?.trim();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required." },
        { status: 400 },
      );
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 },
      );
    }

    const { data: document } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    const { error } = await supabase.from("collection_documents").upsert(
      {
        collection_id: collectionId,
        document_id: documentId,
      },
      {
        onConflict: "collection_id,document_id",
        ignoreDuplicates: true,
      },
    );

    if (error) {
      console.error("Failed to add document:", error);

      return NextResponse.json(
        { error: "Failed to add document." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Collection document POST error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: collectionId } = await params;

    const body = (await request.json()) as {
      documentId?: string;
    };

    const documentId = body.documentId?.trim();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required." },
        { status: 400 },
      );
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("collection_documents")
      .delete()
      .eq("collection_id", collectionId)
      .eq("document_id", documentId);

    if (error) {
      console.error("Failed to remove document:", error);

      return NextResponse.json(
        { error: "Failed to remove document." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Collection document DELETE error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
