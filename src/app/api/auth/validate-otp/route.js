import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

// 🟢 Handle preflight (CORS)
export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { user_id, otp } = await req.json();

    if (!user_id || !otp)
      return failure("User ID and OTP are required.", null, 400, { headers: corsHeaders });

    // 🔍 Fetch user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, otp_code, otp_expires_at, is_verified")
      .eq("id", user_id)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) return failure("User not found.", null, 404, { headers: corsHeaders });

    // ✅ Already verified
    if (user.is_verified) {
      const userData = await getUserDetailsByRole(user.id, user.role);
      return success(
        "User already verified.",
        { user_id: user.id, role: user.role, user: userData },
        200,
        { headers: corsHeaders }
      );
    }

    // ❌ OTP mismatch
    if (user.otp_code !== otp)
      return failure("Invalid OTP.", null, 400, { headers: corsHeaders });

    // ⏰ OTP expired
    if (new Date(user.otp_expires_at) < new Date())
      return failure("OTP expired. Please request a new one.", null, 400, { headers: corsHeaders });

    // ✅ Mark as verified
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        otp_code: null,
        otp_expires_at: null,
        updated_at: new Date(),
      })
      .eq("id", user_id);

    if (updateError) throw updateError;

    // 🧠 Fetch user details by role
    const userData = await getUserDetailsByRole(user.id, user.role);

    return success(
      "OTP validated successfully.",
      {
        user_id: user.id,
        role: user.role,
        user: userData,
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("OTP Validation Error:", error);
    return failure("Failed to validate OTP.", error.message, 500, { headers: corsHeaders });
  }
}

// 🔍 Helper: get user details by role
async function getUserDetailsByRole(userId, role) {
  const roleTables = {
    admin: "admin_details",
    patient: "patient_details",
    doctor: "doctor_details",
    chemist: "chemist_details",
    pharmacist: "pharmacist_details",
    lab: "lab_details",
  };

  const table = roleTables[role];
  if (!table) return null;

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
