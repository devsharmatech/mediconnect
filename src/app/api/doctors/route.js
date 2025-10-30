import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      specialization,
      min_rating,
      available_day,
      city
    } = body || {};

    // ✅ Base query
    let query = supabase
      .from("doctor_details")
      .select(`
        id,
        full_name,
        email,
        specialization,
        experience_years,
        license_number,
        clinic_name,
        clinic_address,
        consultation_fee,
        qualification,
        indemnity_insurance,
        dmc_mci_certificate,
        aadhaar_pan_license,
        address_proof,
        passport_photo,
        bank_account_details,
        digital_consent,
        onboarding_status,
        rating,
        total_reviews,
        available_days,
        available_time,
        latitude,
        longitude,
        users:users!inner(
          id,
          profile_picture,
          role
        )
      `)
      .eq("users.role", "doctor");

    // ✅ Apply filters only if provided
    if (specialization) query = query.ilike("specialization", `%${specialization}%`);
    if (min_rating) query = query.gte("rating", Number(min_rating));
    if (available_day) query = query.contains("available_days", [available_day]);
    if (city) query = query.ilike("clinic_address", `%${city}%`);

    // ✅ Order by rating descending
    query = query.order("rating", { ascending: false });

    const { data: doctors, error } = await query;
    if (error) throw error;

    // ✅ If no filters or no matches — fetch all doctors
    if (!doctors || doctors.length === 0) {
      const { data: allDoctors, error: allError } = await supabase
        .from("doctor_details")
        .select(`
          id,
          full_name,
          email,
          specialization,
          experience_years,
          clinic_name,
          clinic_address,
          consultation_fee,
          rating,
          total_reviews,
          available_days,
          available_time,
          users:users!inner(
            id,
            profile_picture,
            role
          )
        `)
        .eq("users.role", "doctor")
        .order("rating", { ascending: false });

      if (allError) throw allError;

      return success(
        "No filters applied or no match found — returning all doctors.",
        allDoctors,
        200,
        { headers: corsHeaders }
      );
    }

    return success("Doctors fetched successfully.", doctors, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Fetch doctors error:", error);
    return failure("Failed to fetch doctor list.", error.message, 500, { headers: corsHeaders });
  }
}
