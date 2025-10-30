import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

// 🟢 Handle CORS preflight requests
export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { phone_number } = await req.json();

    // 🧩 Validate input
    if (!phone_number) {
      return failure("Phone number is required.", null, 400, { headers: corsHeaders });
    }

    // 🔍 Fetch lab user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("id, role")
      .eq("phone_number", phone_number)
      .eq("role", "lab")
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return failure("Lab not found.", null, 404, { headers: corsHeaders });
    }

    // 🔐 Generate static OTP (for test)
    const otp = "123456";
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // expires in 5 mins

    // 🧾 Update OTP in users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // ✅ Send success response
    return success(
      "OTP sent successfully.",
      {
        otp,
        role: user.role,
        user_id: user.id,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Lab Login Error:", error);
    return failure("Login failed.", error.message, 500, { headers: corsHeaders });
  }
}
