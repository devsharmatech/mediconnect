import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";

export async function DELETE(req) {
  try {
    const { user_id } = await req.json();
    if (!user_id) return failure("User ID required");

    const { error } = await supabase.from("users").delete().eq("id", user_id);
    if (error) throw error;

    return success("Account deleted successfully");
  } catch (error) {
    return failure("Failed to delete account", error.message, 500);
  }
}
