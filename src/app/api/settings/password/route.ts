import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Both passwords are required.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must contain at least 8 characters.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length > 72) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must contain 72 characters or less.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { createClient: createSupabaseClient } =
      await import("@supabase/supabase-js");

    const verificationClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    const { error: verificationError } =
      await verificationClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (verificationError) {
      return NextResponse.json(
        {
          success: false,
          error: "Your current password is incorrect.",
        },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Password update error:", updateError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to update your password.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Password API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
