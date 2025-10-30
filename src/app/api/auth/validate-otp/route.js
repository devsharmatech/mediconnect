import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";

export async function POST(req) {
  try {
    const { user_id, otp } = await req.json();

    if (!user_id || !otp)
      return failure("User ID and OTP are required.", null, 400);

    // 🧾 Get user record
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, otp_code, otp_expires_at, is_verified")
      .eq("id", user_id)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) return failure("User not found.", null, 404);

   
    if (user.is_verified) {

      const userData = await getUserDetailsByRole(user.id, user.role);
      return success("User already verified.", {
        user_id: user.id,
        role: user.role,
        user: userData,
      });
    }

    if (user.otp_code !== otp)
      return failure("Invalid OTP.", null, 400);

    if (new Date(user.otp_expires_at) < new Date())
      return failure("OTP expired. Please request a new one.", null, 400);

    // ✅ Mark verified
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

    // 🧠 Fetch detailed profile according to role
    const userData = await getUserDetailsByRole(user.id, user.role);

    return success("OTP validated successfully.", {
      user_id: user.id,
      role: user.role,
      user: userData,
    });
  } catch (error) {
    console.error("OTP Validation Error:", error);
    return failure("Failed to validate OTP.", error.message, 500);
  }
}

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
