import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id");
    const store_name = formData.get("store_name");
    const owner_name = formData.get("owner_name");
    const email = formData.get("email");
    const gst_number = formData.get("gst_number");
    const license_number = formData.get("license_number");
    const address = formData.get("address");
    const file = formData.get("profile_picture");

    if (!user_id || !store_name || !email)
      return failure("Missing required fields: user_id, store_name, or email.", null, 400, { headers: corsHeaders });

    const { data: userData, error: fetchError } = await supabase.from("users").select("id, profile_picture, role").eq("id", user_id).maybeSingle();
    if (fetchError) throw fetchError;
    if (!userData) return failure("User not found.", null, 404, { headers: corsHeaders });
    if (userData.role !== "chemist") return failure("Invalid role.", null, 403, { headers: corsHeaders });

    let profile_picture_url = userData.profile_picture || null;

    if (file && file.name) {
      if (userData.profile_picture) {
        const oldFile = userData.profile_picture.split("/").pop();
        await supabase.storage.from("profile-pictures").remove([oldFile]);
      }
      const ext = file.name.split(".").pop();
      const fileName = `${user_id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("profile-pictures").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);
      profile_picture_url = publicData?.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("chemist_details")
      .update({ store_name, owner_name, email, gst_number, license_number, address, updated_at: new Date() })
      .eq("id", user_id);

    if (updateError) throw updateError;

    await supabase.from("users").update({ profile_picture: profile_picture_url, updated_at: new Date() }).eq("id", user_id);

    return success("Chemist profile updated successfully.", { user_id, store_name, email, profile_picture: profile_picture_url }, 200, { headers: corsHeaders });
  } catch (error) {
    return failure("Server error occurred.", error.message, 500, { headers: corsHeaders });
  }
}
