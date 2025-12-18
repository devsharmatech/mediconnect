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
      appointment_id,

      appointment_type = "clinic_visit",
      specialization = "general_medicine",

      diagnosis = {},
      medicines = [],
      lab_tests = [],
      investigations = {},
      vital_signs = {},
      examination_findings = {},
      follow_up = {},
      special_instructions = {},
      template_data = {},
      ai_analysis = {},

      special_message = "",
      action = "save" // save | sign
    } = body;

    /* -------------------------------------------------
       BASIC VALIDATION
    -------------------------------------------------- */
    if (!doctor_id || !patient_id) {
      return failure("doctor_id and patient_id are required", null, 400, {
        headers: corsHeaders
      });
    }

    const allowedAppointmentTypes = [
      "video_call",
      "home_visit",
      "clinic_visit"
    ];

    if (!allowedAppointmentTypes.includes(appointment_type)) {
      return failure("Invalid appointment_type", null, 422, {
        headers: corsHeaders
      });
    }

    if (!["save", "sign"].includes(action)) {
      return failure("Invalid action", null, 422, {
        headers: corsHeaders
      });
    }

    /* -------------------------------------------------
       VALIDATE DOCTOR
    -------------------------------------------------- */
    const { data: doctor } = await supabase
      .from("doctor_details")
      .select("id, onboarding_status")
      .eq("id", doctor_id)
      .maybeSingle();

    if (!doctor) {
      return failure("Invalid doctor_id", null, 404, {
        headers: corsHeaders
      });
    }

    if (doctor.onboarding_status === "pending" || doctor.onboarding_status === "rejected") {
      return failure("Doctor account is inactive", null, 403, {
        headers: corsHeaders
      });
    }

    /* -------------------------------------------------
       VALIDATE PATIENT
    -------------------------------------------------- */
    const { data: patient } = await supabase
      .from("patient_details")
      .select("id")
      .eq("id", patient_id)
      .maybeSingle();

    if (!patient) {
      return failure("Invalid patient_id", null, 404, {
        headers: corsHeaders
      });
    }

    /* -------------------------------------------------
       VALIDATE APPOINTMENT (OPTIONAL)
    -------------------------------------------------- */
    let appointment = null;

    if (appointment_id) {
      const { data } = await supabase
        .from("appointments")
        .select(`
          id,
          doctor_id,
          patient_id,
          status,
          appointment_type
        `)
        .eq("id", appointment_id)
        .maybeSingle();

      if (!data) {
        return failure("Invalid appointment_id", null, 404, {
          headers: corsHeaders
        });
      }

      if (data.doctor_id !== doctor_id) {
        return failure("Appointment does not belong to this doctor", null, 403, {
          headers: corsHeaders
        });
      }

      if (data.patient_id !== patient_id) {
        return failure("Appointment does not belong to this patient", null, 403, {
          headers: corsHeaders
        });
      }

      if (data.prescription_id) {
        return failure("Prescription already exists for this appointment", null, 409, {
          headers: corsHeaders
        });
      }

      // if (
      //   data.appointment_type &&
      //   data.appointment_type !== appointment_type
      // ) {
      //   return failure(
      //     "appointment_type does not match appointment",
      //     null,
      //     422,
      //     { headers: corsHeaders }
      //   );
      // }

      appointment = data;
    }

    /* -------------------------------------------------
       STRICT DUPLICATE CHECK (USER-FRIENDLY)
    -------------------------------------------------- */
    if (appointment_id) {
      const { data: existing } = await supabase
        .from("prescriptions")
        .select("id")
        .eq("appointment_id", appointment_id)
        .limit(1)
        .maybeSingle();

      if (existing) {
        return failure(
          "Prescription already exists for this appointment",
          null,
          409,
          { headers: corsHeaders }
        );
      }
    }

    /* -------------------------------------------------
       SIGN VALIDATION
    -------------------------------------------------- */
    if (action === "sign") {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return failure(
          "Medicines are required to sign prescription",
          null,
          422,
          { headers: corsHeaders }
        );
      }

      if (!diagnosis || Object.keys(diagnosis).length === 0) {
        return failure(
          "Diagnosis is required to sign prescription",
          null,
          422,
          { headers: corsHeaders }
        );
      }
    }

    /* -------------------------------------------------
       PREPARE INSERT DATA
    -------------------------------------------------- */
    const now = new Date().toISOString();

    const prescriptionData = {
      doctor_id,
      patient_id,
      appointment_id,
      appointment_type,
      specialization,

      diagnosis,
      medicines,
      lab_tests,
      investigations,
      vital_signs,
      examination_findings,
      follow_up,
      special_instructions,
      template_data,
      ai_analysis,

      special_message,

      is_draft: action === "save",
      status: action === "sign" ? "completed" : "active",
      updated_at: now
    };

    if (action === "sign") {
      prescriptionData.signed_by = doctor_id;
      prescriptionData.signed_at = now;
      prescriptionData.completed_at = now;
    }

    /* -------------------------------------------------
       INSERT PRESCRIPTION (DB-LEVEL SAFETY)
    -------------------------------------------------- */
    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert(prescriptionData)
      .select("*")
      .single();

    if (error) {
      // PostgreSQL unique constraint violation
      if (error.code === "23505") {
        return failure(
          "Prescription already exists for this appointment",
          null,
          409,
          { headers: corsHeaders }
        );
      }
      throw error;
    }

    /* -------------------------------------------------
       UPDATE APPOINTMENT IF SIGNED
    -------------------------------------------------- */
    if (action === "sign" && appointment_id) {
      await supabase
        .from("appointments")
        .update({
          status: "completed",
          prescription_id: prescription.id,
          updated_at: now
        })
        .eq("id", appointment_id);
    }

    /* -------------------------------------------------
       FETCH RELATED DATA
    -------------------------------------------------- */
    const [doctorData, patientData] = await Promise.all([
      supabase
        .from("doctor_details")
        .select("id, full_name, specialization, clinic_name, signature_url")
        .eq("id", doctor_id)
        .single(),

      supabase
        .from("patient_details")
        .select("id, full_name, gender, date_of_birth, phone")
        .eq("id", patient_id)
        .single()
    ]);

    return success(
      action === "sign"
        ? "Prescription created and signed successfully"
        : "Prescription saved successfully",
      {
        prescription: {
          ...prescription,
          doctor: doctorData.data || {},
          patient: patientData.data || {},
          appointment: appointment || {}
        },
        action
      },
      201,
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Create prescription error:", err);
    return failure(
      "Failed to create prescription",
      err.message,
      500,
      { headers: corsHeaders }
    );
  }
}
