import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 },
      );
    }

    if (fullName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name must be 100 characters or less.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
      })
      .eq("user_id", user.id)
      .select("full_name, avatar_url")
      .single();

    if (error) {
      console.error("Profile update error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to update your profile.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        fullName: profile.full_name ?? "",
        avatarUrl: profile.avatar_url ?? null,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
