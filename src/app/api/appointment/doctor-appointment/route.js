import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { doctor_id, date_filter = "today", page = 1 } = await req.json();
    if (!doctor_id)
      return failure("doctor_id required.", null, 400, { headers: corsHeaders });

    const perPage = 15;
    const offset = (page - 1) * perPage;

    const todayDate = new Date().toISOString().split("T")[0];
    let query = supabase
      .from("appointments")
      .select(
        `
        id,
        doctor_id,
        patient_id,
        appointment_date,
        appointment_time,
        status,
        disease_info,
        created_at,
        patients:patient_id(id, full_name, email, profile_picture)
      `
      )
      .eq("doctor_id", doctor_id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    // ✅ Filter logic
    if (date_filter === "today") query = query.eq("appointment_date", todayDate);
    else if (date_filter !== "all") query = query.eq("appointment_date", date_filter);

    // ✅ Pagination
    query = query.range(offset, offset + perPage - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return success("Appointments fetched successfully.", data, 200, {
      headers: corsHeaders,
      meta: { page, perPage, date_filter },
    });
  } catch (error) {
    console.error("Doctor appointments error:", error);
    return failure("Failed to fetch doctor appointments.", error.message, 500, { headers: corsHeaders });
  }
}
