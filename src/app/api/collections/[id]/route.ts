import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: collection, error } = await supabase
      .from("collections")
      .select(
        `
          id,
          name,
          created_at,
          collection_documents (
            document_id,
            documents (
              id,
              title,
              file_name,
              file_type,
              file_size,
              page_count,
              status,
              created_at,
              updated_at
            )
          )
        `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 },
      );
    }

    const documents =
      collection.collection_documents
        ?.map((item) => item.documents)
        .filter(Boolean) ?? [];

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        name: collection.name,
        createdAt: collection.created_at,
        documents,
      },
    });
  } catch (error) {
    console.error("Collection GET error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = (await request.json()) as {
      name?: string;
    };

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Collection name is required." },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "Collection name must be 100 characters or less.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: collection, error } = await supabase
      .from("collections")
      .update({ name })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, name, created_at")
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Collection PATCH error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete collection:", error);

      return NextResponse.json(
        { error: "Failed to delete collection." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Collection DELETE error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
