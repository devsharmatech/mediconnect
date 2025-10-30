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
    const full_name = formData.get("full_name");
    const email = formData.get("email");
    const specialization = formData.get("specialization");
    const experience_years = formData.get("experience_years");
    const license_number = formData.get("license_number");
    const clinic_name = formData.get("clinic_name");
    const clinic_address = formData.get("clinic_address");
    const consultation_fee = formData.get("consultation_fee");
    const file = formData.get("profile_picture");

    if (!user_id || !full_name || !email) {
      return failure("Missing required fields: user_id, full_name, or email.", null, 400, { headers: corsHeaders });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure("Invalid email format.", null, 400, { headers: corsHeaders });
    }

    // Fetch current user
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("id, profile_picture, role")
      .eq("id", user_id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!userData) return failure("User not found.", null, 404, { headers: corsHeaders });
    if (userData.role !== "doctor") return failure("Invalid role for this endpoint.", null, 403, { headers: corsHeaders });

    let profile_picture_url = userData.profile_picture;

    // Handle profile picture
    if (file && file.name) {
      const ext = file.name.split(".").pop();
      const fileName = `${user_id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("profile-pictures").upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);
      profile_picture_url = publicData?.publicUrl || profile_picture_url;
    }

    // Update doctor details
    const { error: updateError } = await supabase.from("doctor_details").update({
      full_name,
      email,
      specialization,
      experience_years: experience_years ? Number(experience_years) : null,
      license_number,
      clinic_name,
      clinic_address,
      consultation_fee: consultation_fee ? Number(consultation_fee) : 0,
      updated_at: new Date()
    }).eq("id", user_id);

    if (updateError) throw updateError;

    // Update profile picture
    if (profile_picture_url !== userData.profile_picture) {
      await supabase.from("users").update({ profile_picture: profile_picture_url }).eq("id", user_id);
    }

    return success("Doctor profile updated successfully.", {
      user_id,
      full_name,
      email,
      specialization,
      experience_years,
      clinic_name,
      clinic_address,
      consultation_fee,
      profile_picture: profile_picture_url
    }, 200, { headers: corsHeaders });

  } catch (error) {
    console.error("Doctor update error:", error);
    return failure("Failed to update doctor profile.", error.message, 500, { headers: corsHeaders });
  }
}
