import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { user_id, otp } = await req.json();

    if (!user_id || !otp)
      return failure("User ID and OTP are required.", null, 400, { headers: corsHeaders });

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) return failure("User not found.", null, 404, { headers: corsHeaders });

    if (user.otp_code !== otp)
      return failure("Invalid OTP.", null, 400, { headers: corsHeaders });

    if (new Date(user.otp_expires_at) < new Date())
      return failure("OTP expired. Please request a new one.", null, 400, { headers: corsHeaders });

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

    const roleData = await getUserDetailsByRole(user.id, user.role);

    return success(
      "OTP verified successfully.",
      {
        user_id: user.id,
        role: user.role,
        user: { ...user, is_verified: true, details: roleData },
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return failure("Failed to verify OTP.", error.message, 500, { headers: corsHeaders });
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
