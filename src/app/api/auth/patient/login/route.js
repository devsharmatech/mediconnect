import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";

export async function POST(req) {
  try {
    const { phone_number } = await req.json();
    if (!phone_number) return failure("Phone number is required.");

    const { data: user, error } = await supabase
      .from("users")
      .select("id, role")
      .eq("phone_number", phone_number)
      .eq("role", "patient")
      .maybeSingle();

    if (error) throw error;
    if (!user) return failure("Patient not found.", null, 404);

    const otp = "123456";
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
    console.error("Doctor Login Error:", error);
    return failure("Login failed.", error.message, 500);
  }
}
