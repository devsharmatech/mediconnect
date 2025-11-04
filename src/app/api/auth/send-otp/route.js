import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { phone_number, role } = await req.json();
    if (!phone_number || !role) return failure("Phone number and role are required.");

    const { data: user, error } = await supabase
      .from("users")
      .select("id, role")
      .eq("phone_number", phone_number)
      .eq("role", role)
      .maybeSingle();

    if (error) throw error;
    if (!user) return failure(`${role} not found.`, null, 404);

    const otp = "123456"; // dummy OTP for now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return success("OTP sent successfully.", {
      otp,
      role: user.role,
      user_id: user.id,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return failure("Failed to send OTP.", error.message, 500);
  }
}
