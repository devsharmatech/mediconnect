import { supabase } from "@/lib/supabaseAdmin";
import { corsHeaders } from "@/lib/cors";
import { success, failure } from "@/lib/response";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { patient_id, date_filter = "all", page = 1 } = await req.json();

    if (!patient_id)
      return failure("patient_id is required.", null, 400, { headers: corsHeaders });

    // ✅ Verify that patient_id belongs to a patient user
    const { data: patientUser, error: userErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", patient_id)
      .single();

    if (userErr || !patientUser || patientUser.role !== "patient")
      return failure("Invalid patient_id or user is not a patient.", null, 400, { headers: corsHeaders });

    const perPage = 15;
    const offset = (page - 1) * perPage;
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_date,
        appointment_time,
        status,
        disease_info,
        created_at,
        doctor:user_id!appointments_doctor_id_fkey (
          id,
          role,
          doctor_details:doctor_details (
            full_name,
            email,
            specialization,
            clinic_name,
            consultation_fee
          )
        )
      `,
        { count: "exact" }
      )
      .eq("patient_id", patient_id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (date_filter === "today") query = query.eq("appointment_date", today);
    else if (date_filter !== "all") query = query.eq("appointment_date", date_filter);

    query = query.range(offset, offset + perPage - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return success(
      "Patient appointments fetched successfully.",
      {
        appointments: data,
        pagination: {
          total: count,
          perPage,
          currentPage: page,
          totalPages: Math.ceil((count || 0) / perPage),
        },
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Patient appointments error:", error);
    return failure("Failed to fetch patient appointments.", error.message, 500, { headers: corsHeaders });
  }
}
