import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone_number, full_name, email, gender, date_of_birth, address } = body;

    // 🧾 Required field validation
    if (!phone_number || !full_name) {
      return failure("Phone number and full name are required.", null, 400);
    }

    // 📞 Validate phone number format (optional basic regex)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone_number)) {
      return failure("Invalid phone number format.", null, 400);
    }

    // 📧 Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure("Invalid email format.", null, 400);
    }

    // 🔍 Check if phone number already exists
    const { data: phoneExists, error: phoneError } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (phoneError) throw phoneError;
    if (phoneExists) {
      return failure("Phone number already registered.", null, 409);
    }

    // 🔍 Check if email already exists (if provided)
    if (email) {
      const { data: emailExists, error: emailError } = await supabase
        .from("patient_details")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (emailError) throw emailError;
      if (emailExists) {
        return failure("Email already registered.", null, 409);
      }
    }

    // ✅ Step 1: Create User
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          phone_number,
          role: "patient",
          is_verified: false,
          otp_code: null,
          otp_expires_at: null,
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    // ✅ Step 2: Create Patient Details
    const { error: detailsError } = await supabase
      .from("patient_details")
      .insert([
        {
          id: user.id,
          full_name,
          email: email || null,
          gender: gender || null,
          date_of_birth: date_of_birth || null,
          address: address || null,
        },
      ]);

    if (detailsError) {
      // rollback user if details fail
      await supabase.from("users").delete().eq("id", user.id);
      throw detailsError;
    }

    // ✅ Step 3: Return success with user_id
    return success("Registration successful.", {
      user_id: user.id,
      phone_number: user.phone_number,
      role: user.role,
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return failure("Registration failed.", error.message, 500);
  }
}
