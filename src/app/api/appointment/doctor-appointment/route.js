import { supabase } from "@/lib/supabaseAdmin";
import { corsHeaders } from "@/lib/cors";
import { success, failure } from "@/lib/response";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { doctor_id, date_filter = "today", page = 1 } = await req.json();

    if (!doctor_id)
      return failure("doctor_id is required.", null, 400, { headers: corsHeaders });

    // ✅ Verify that doctor_id belongs to a doctor user
    const { data: doctorUser, error: userErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", doctor_id)
      .single();

    if (userErr || !doctorUser || doctorUser.role !== "doctor")
      return failure("Invalid doctor_id or user is not a doctor.", null, 400, { headers: corsHeaders });

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
        patient:user_id!appointments_patient_id_fkey (
          id,
          role,
          patient_details:patient_details (
            full_name,
            email,
            gender,
            blood_group
          )
        )
      `,
        { count: "exact" }
      )
      .eq("doctor_id", doctor_id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (date_filter === "today") query = query.eq("appointment_date", today);
    else if (date_filter !== "all") query = query.eq("appointment_date", date_filter);

    query = query.range(offset, offset + perPage - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return success(
      "Doctor appointments fetched successfully.",
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
    console.error("Doctor appointments error:", error);
    return failure("Failed to fetch doctor appointments.", error.message, 500, { headers: corsHeaders });
  }
}
