import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

// 🟢 Handle preflight CORS
export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id");

    // 🧾 Validation
    if (!user_id) {
      return failure("Missing required field: user_id.", null, 400, { headers: corsHeaders });
    }

    const full_name = formData.get("full_name");
    const email = formData.get("email");
    const gender = formData.get("gender");
    const date_of_birth = formData.get("date_of_birth");
    const address = formData.get("address");
    const file = formData.get("profile_picture");

    // 📧 Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure("Invalid email format.", null, 400, { headers: corsHeaders });
    }

    // 🔍 Check user existence
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("id, profile_picture")
      .eq("id", user_id)
      .maybeSingle();

    if (userFetchError) {
      console.error("Error fetching user:", userFetchError);
      return failure("Unable to fetch user details.", userFetchError.message, 500, { headers: corsHeaders });
    }

    if (!userData) {
      return failure("User not found.", null, 404, { headers: corsHeaders });
    }

    // 🧩 Check if email already exists (other users)
    if (email) {
      const { data: emailExists, error: emailError } = await supabase
        .from("patient_details")
        .select("id")
        .eq("email", email)
        .neq("id", user_id)
        .maybeSingle();

      if (emailError) {
        console.error("Error checking email uniqueness:", emailError);
        return failure("Failed to validate email uniqueness.", emailError.message, 500, { headers: corsHeaders });
      }

      if (emailExists) {
        return failure("Email already registered with another account.", null, 409, { headers: corsHeaders });
      }
    }

    // 🖼️ Handle profile picture upload
    let profile_picture_url = userData.profile_picture || null;

    if (file && file.name) {
      try {
        // Delete old picture if exists
        if (userData.profile_picture) {
          const oldFile = userData.profile_picture.split("/").pop();
          const { error: removeError } = await supabase.storage
            .from("profile-pictures")
            .remove([oldFile]);
          if (removeError) console.warn("Failed to delete old profile:", removeError.message);
        }

        // Upload new one
        const ext = file.name.split(".").pop();
        const fileName = `${user_id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(fileName, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(fileName);

        profile_picture_url = publicData?.publicUrl || profile_picture_url;
      } catch (uploadErr) {
        console.error("Profile picture upload failed:", uploadErr);
        return failure("Failed to upload new profile picture.", uploadErr.message, 500, { headers: corsHeaders });
      }
    }

    // 🧠 Update patient details
    const { error: patientError } = await supabase
      .from("patient_details")
      .update({
        full_name,
        email,
        gender,
        date_of_birth,
        address,
        updated_at: new Date(),
      })
      .eq("id", user_id);

    if (patientError) {
      console.error("Error updating patient details:", patientError);
      return failure("Failed to update patient profile.", patientError.message, 500, { headers: corsHeaders });
    }

    // 🧠 Update user profile picture if changed
    if (profile_picture_url !== userData.profile_picture) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          profile_picture: profile_picture_url,
          updated_at: new Date(),
        })
        .eq("id", user_id);

      if (userUpdateError) {
        console.error("Error updating user picture:", userUpdateError);
        return failure("Failed to update profile picture URL.", userUpdateError.message, 500, { headers: corsHeaders });
      }
    }

    return success(
      "Profile updated successfully.",
      {
        user_id,
        full_name,
        email,
        gender,
        date_of_birth,
        address,
        profile_picture: profile_picture_url,
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return failure("Unexpected server error occurred.", error.message, 500, { headers: corsHeaders });
  }
}
