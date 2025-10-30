import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    if (!user_id) return failure("User ID required");

    const { data, error } = await supabase
      .from("patient_details")
      .select("*, users(profile_picture, phone_number, role)")
      .eq("id", user_id)
      .single();

    if (error) throw error;

    return success("Profile fetched successfully", data);
  } catch (error) {
    return failure("Failed to fetch profile", error.message, 500);
  }
}
