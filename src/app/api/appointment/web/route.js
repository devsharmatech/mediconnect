import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const date = searchParams.get("date") || "";
    const doctor_id = searchParams.get("doctor_id") || "";
    const patient_id = searchParams.get("patient_id") || "";

    const offset = (page - 1) * limit;

    // Main query
    let query = supabase.from("appointments").select(
      `
        *,
        patient:patient_id (
          id,
          phone_number,
          un_id,
          profile_picture,
          patient_details (
            full_name,
            email,
            gender
          )
        ),
        doctor:doctor_id (
          id,
          phone_number,
          un_id,
          profile_picture,
          doctor_details (
            full_name,
            email,
            specialization,
            clinic_name,
            consultation_fee
          )
        )
      `,
      { count: "exact" }
    );

    // Filters
    if (status !== "all") {
      query = query.eq("status", status);
    } else {
      query = query.neq("status", "freezed");
    }

    if (date) query = query.eq("appointment_date", date);
    if (doctor_id) query = query.eq("doctor_id", doctor_id);
    if (patient_id) query = query.eq("patient_id", patient_id);

    if (search) {
      const s = `%${search}%`;

      query = query.or(
        `patient->patient_details->>full_name.ilike.${s},` +
          `patient->patient_details->>email.ilike.${s},` +
          `patient->>phone_number.ilike.${s},` +
          `doctor->doctor_details->>full_name.ilike.${s},` +
          `doctor->doctor_details->>email.ilike.${s},` +
          `doctor->>phone_number.ilike.${s}`
      );
    }

    // Execute paginated query
    const {
      data: appointments,
      error,
      count,
    } = await query
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // ✅ Get total counts for each status
    const statusList = [
      "booked",
      "approved",
      "cancelled",
      "completed",
      "rejected",
    ];

    const statusCounts = {};
    for (const s of statusList) {
      const { count: c } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", s)
        .neq("status", "freezed");

      statusCounts[s] = c || 0;
    }

    // Get total count (excluding freezed)
    const { count: totalCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .neq("status", "freezed");

    // Transform data
    const transformedAppointments =
      appointments?.map((apt) => ({
        id: apt.id,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        status: apt.status,
        disease_info: apt.disease_info,
        created_at: apt.created_at,
        patient: {
          id: apt.patient?.id,
          un_id: apt.patient?.un_id,
          phone_number: apt.patient?.phone_number,
          profile_picture: apt.patient?.profile_picture,
          full_name: apt.patient?.patient_details?.full_name,
          email: apt.patient?.patient_details?.email,
          gender: apt.patient?.patient_details?.gender,
        },
        doctor: {
          id: apt.doctor?.id,
          un_id: apt.doctor?.un_id,
          phone_number: apt.doctor?.phone_number,
          profile_picture: apt.doctor?.profile_picture,
          full_name: apt.doctor?.doctor_details?.full_name,
          email: apt.doctor?.doctor_details?.email,
          specialization: apt.doctor?.doctor_details?.specialization,
          clinic_name: apt.doctor?.doctor_details?.clinic_name,
          consultation_fee: apt.doctor?.doctor_details?.consultation_fee,
        },
      })) || [];

    // ✅ Final response
    return success(
      "Appointments fetched successfully.",
      {
        appointments: transformedAppointments,
        pagination: {
          total: count,
          perPage: limit,
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
        },
        summary: {
          total: totalCount,
          ...statusCounts,
        },
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Appointments fetch error:", error);
    return failure("Failed to fetch appointments.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}
