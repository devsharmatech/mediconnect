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
      doctor_id,
      patient_id,
      screening_id,
      appointment_date,
      appointment_time,
      disease_info
    } = body || {};

    // ✅ Validate required fields
    if (!doctor_id || !patient_id || !appointment_date || !appointment_time || !screening_id) {
      return failure(
        "doctor_id, patient_id, appointment_date, appointment_time, and screening_id are required.",
        null,
        400,
        { headers: corsHeaders }
      );
    }

    // ✅ Verify doctor
    const { data: doctor, error: docErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", doctor_id)
      .maybeSingle();

    if (docErr) throw docErr;
    if (!doctor || doctor.role !== "doctor")
      return failure("Invalid doctor ID or role.", null, 400, {
        headers: corsHeaders,
      });

    // ✅ Verify patient
    const { data: patient, error: patErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", patient_id)
      .maybeSingle();

    if (patErr) throw patErr;
    if (!patient || patient.role !== "patient")
      return failure("Invalid patient ID or role.", null, 400, {
        headers: corsHeaders,
      });

    // ✅ Check if slot already booked
    const { data: existing, error: existingErr } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctor_id)
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .in("status", ["booked", "approved", "completed","freezed"])
      .maybeSingle();

    if (existingErr) throw existingErr;
    if (existing)
      return failure("This slot is already booked.", null, 409, {
        headers: corsHeaders,
      });

    // ✅ Insert appointment
    const { data: appointment, error: insertErr } = await supabase
      .from("appointments")
      .insert([
        {
          doctor_id,
          patient_id,
          screening_id,
          appointment_date,
          appointment_time,
          disease_info,
          status: "booked",
        },
      ])
      .select(
        `
        id,
        doctor_id,
        patient_id,
        screening_id,
        appointment_date,
        appointment_time,
        status,
        disease_info,
        created_at
      `
      )
      .single();

    if (insertErr) throw insertErr;

    // ✅ Prepare notifications
    const notifications = [
      {
        user_id: doctor_id,
        title: "New Appointment Booked",
        message: `A patient booked an appointment on ${appointment_date} at ${appointment_time}.`,
        type: "appointment",
        metadata: {
          appointment_id: appointment.id,
          patient_id,
          appointment_date,
          appointment_time,
          disease_info,
        },
      },
      {
        user_id: patient_id,
        title: "Appointment Confirmed",
        message: `Your appointment with the doctor is confirmed for ${appointment_date} at ${appointment_time}.`,
        type: "appointment",
        metadata: {
          appointment_id: appointment.id,
          doctor_id,
          appointment_date,
          appointment_time,
          disease_info,
        },
      },
    ];

    // ✅ Insert notifications
    const { error: notifyErr } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notifyErr) console.warn("Notification insert error:", notifyErr);

    // ✅ Return appointment details
    return success("Appointment booked successfully.", appointment, 201, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    return failure("Failed to book appointment.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}
