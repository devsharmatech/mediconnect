import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id");
    const full_name = formData.get("full_name");
    const email = formData.get("email");
    const gender = formData.get("gender");
    const date_of_birth = formData.get("date_of_birth");
    const address = formData.get("address");
    const file = formData.get("profile_picture");

    if (!user_id) return failure("User ID required");

    let profile_picture_url = null;

    const { data: oldData } = await supabase
      .from("users")
      .select("profile_picture")
      .eq("id", user_id)
      .maybeSingle();

    if (oldData?.profile_picture) {
      const oldPath = oldData.profile_picture.split("/").pop();
      await supabase.storage.from("profile-pictures").remove([oldPath]);
    }

    if (file && file.name) {
      const ext = file.name.split(".").pop();
      const fileName = `${user_id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

      profile_picture_url = publicUrl;
    }

    const { error: patientError } = await supabase
      .from("patient_details")
      .update({ full_name, email, gender, date_of_birth, address })
      .eq("id", user_id);

    if (patientError) throw patientError;

    if (profile_picture_url) {
      const { error: userError } = await supabase
        .from("users")
        .update({
          profile_picture: profile_picture_url,
          updated_at: new Date(),
        })
        .eq("id", user_id);

      if (userError) throw userError;
    }

    return success("Profile updated successfully", {
      profile_picture: profile_picture_url,
    });
  } catch (error) {
    return failure("Failed to update profile", error.message, 500);
  }
}
