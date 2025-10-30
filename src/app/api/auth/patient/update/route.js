import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

// 🟢 Handle preflight (CORS)
export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id");
    const full_name = formData.get("full_name");
    const email = formData.get("email");
    const gender = formData.get("gender");
    const date_of_birth = formData.get("date_of_birth");
    const address = formData.get("address") || "";
    const file = formData.get("profile_picture");

    // 🔸 Validate required fields
    if (!user_id)
      return failure("Missing required field: user_id.", null, 400, { headers: corsHeaders });

    const requiredFields = { full_name, email, gender, date_of_birth };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        return failure(`${key.replace("_", " ")} is required.`, null, 400, { headers: corsHeaders });
      }
    }

    // 📧 Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return failure("Invalid email format.", null, 400, { headers: corsHeaders });

    // 🔍 Fetch user info
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("id, profile_picture")
      .eq("id", user_id)
      .maybeSingle();

    if (userFetchError) throw userFetchError;
    if (!userData) return failure("User not found.", null, 404, { headers: corsHeaders });

    // 📧 Ensure unique email
    const { data: emailExists, error: emailCheckError } = await supabase
      .from("patient_details")
      .select("id")
      .eq("email", email)
      .neq("id", user_id)
      .maybeSingle();

    if (emailCheckError) throw emailCheckError;
    if (emailExists)
      return failure("Email already registered with another account.", null, 409, { headers: corsHeaders });

    // 🖼️ Handle optional profile picture upload
    let profile_picture_url = userData.profile_picture;

    if (file && file.name) {
      try {
        // 🧹 Delete old image if exists
        if (userData.profile_picture) {
          const oldFile = userData.profile_picture.split("/").pop();
          await supabase.storage.from("profile-pictures").remove([oldFile]);
        }

        // 📸 Upload new image
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
      } catch (uploadError) {
        console.error("Profile picture upload failed:", uploadError);
        return failure("Failed to upload profile picture.", uploadError.message, 500, { headers: corsHeaders });
      }
    }

    // 🧠 Update patient details
    const { error: updateError } = await supabase
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

    if (updateError) throw updateError;

    // 🖼️ Update picture only if changed
    if (profile_picture_url !== userData.profile_picture) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          profile_picture: profile_picture_url,
          updated_at: new Date(),
        })
        .eq("id", user_id);

      if (userUpdateError) throw userUpdateError;
    }

    // ✅ Return final data
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
    console.error("Profile update error:", error);
    return failure("Unexpected server error occurred.", error.message, 500, { headers: corsHeaders });
  }
}
