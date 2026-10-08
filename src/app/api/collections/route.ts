import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: collections, error } = await supabase
      .from("collections")
      .select(
        `
          id,
          name,
          created_at,
          collection_documents (
            document_id
          )
        `,
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to fetch collections:", error);

      return NextResponse.json(
        { error: "Failed to fetch collections." },
        { status: 500 },
      );
    }

    const result = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      createdAt: collection.created_at,
      documentCount: collection.collection_documents?.length ?? 0,
    }));

    return NextResponse.json({
      success: true,
      collections: result,
    });
  } catch (error) {
    console.error("Collections GET error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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
      .insert({
        user_id: user.id,
        name,
      })
      .select("id, name, created_at")
      .single();

    if (error) {
      console.error("Failed to create collection:", error);

      return NextResponse.json(
        { error: "Failed to create collection." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        collection: {
          id: collection.id,
          name: collection.name,
          createdAt: collection.created_at,
          documentCount: 0,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Collections POST error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
