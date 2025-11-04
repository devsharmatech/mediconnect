import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ids } = await req.json();

    if (!ids?.length) {
      return NextResponse.json({ error: "No patient IDs provided" }, { status: 400 });
    }
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id, profile_picture") 
      .in("id", ids);

    if (fetchError) throw fetchError;
    const imagePaths = users
      .map((user) => {
        if (!user.profile_picture) return null;

        const match = user.profile_picture.match(/\/storage\/v1\/object\/public\/profile-pictures\/(.+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (imagePaths.length > 0) {
      const { error: deleteImageError } = await supabase.storage
        .from("profile-pictures")
        .remove(imagePaths);

      if (deleteImageError) {
        console.warn("Image delete warning:", deleteImageError);
      }
    }

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .in("id", ids);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

