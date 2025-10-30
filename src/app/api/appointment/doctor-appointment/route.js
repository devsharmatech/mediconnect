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
      return failure("doctor_id is required.", null, 400, { headers: corsHeaders });

    // Verify doctor exists and is a doctor
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
      .select("*", { count: "exact" })
      .eq("doctor_id", doctor_id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (date_filter === "today") query = query.eq("appointment_date", today);
    else if (date_filter !== "all") query = query.eq("appointment_date", date_filter);

    query = query.range(offset, offset + perPage - 1);

    const { data: appointments, error, count } = await query;
    if (error) throw error;

    if (!appointments.length)
      return success("No appointments found.", { appointments: [], pagination: {} }, 200, { headers: corsHeaders });

    // Collect all patient IDs to get patient info
    const patientIds = appointments.map((a) => a.patient_id);

    const { data: patients, error: pErr } = await supabase
      .from("patient_details")
      .select("id, full_name, email, gender, blood_group")
      .in("id", patientIds);

    if (pErr) throw pErr;

    // Merge data
    const merged = appointments.map((a) => ({
      ...a,
      patient: patients.find((p) => p.id === a.patient_id) || null,
    }));

    return success(
      "Doctor appointments fetched successfully.",
      {
        appointments: merged,
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
