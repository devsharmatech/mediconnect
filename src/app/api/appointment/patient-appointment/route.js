import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { patient_id, date_filter = "all", page = 1 } = await req.json();

    if (!patient_id)
      return failure("patient_id is required.", null, 400, { headers: corsHeaders });

    // Verify user role
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
      .select("*", { count: "exact" })
      .eq("patient_id", patient_id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (date_filter === "today") query = query.eq("appointment_date", today);
    else if (date_filter !== "all") query = query.eq("appointment_date", date_filter);

    query = query.range(offset, offset + perPage - 1);

    const { data: appointments, error, count } = await query;
    if (error) throw error;

    if (!appointments.length)
      return success("No appointments found.", { appointments: [], pagination: {} }, 200, { headers: corsHeaders });

    // Fetch doctor details
    const doctorIds = appointments.map((a) => a.doctor_id);

    const { data: doctors, error: dErr } = await supabase
      .from("doctor_details")
      .select("id, full_name, email, specialization, clinic_name, consultation_fee")
      .in("id", doctorIds);

    if (dErr) throw dErr;

    // Merge
    const merged = appointments.map((a) => ({
      ...a,
      doctor: doctors.find((d) => d.id === a.doctor_id) || null,
    }));

    return success(
      "Patient appointments fetched successfully.",
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
    console.error("Patient appointments error:", error);
    return failure("Failed to fetch patient appointments.", error.message, 500, { headers: corsHeaders });
  }
}
