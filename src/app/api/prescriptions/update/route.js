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
      prescription_id, // REQUIRED

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

    /* ---------------------------------
       BASIC VALIDATION
    ---------------------------------- */
    if (!prescription_id || !doctor_id || !patient_id) {
      return failure(
        "prescription_id, doctor_id and patient_id are required",
        null,
        400,
        { headers: corsHeaders }
      );
    }

    if (!["save", "sign"].includes(action)) {
      return failure("Invalid action", null, 422, {
        headers: corsHeaders
      });
    }

    /* ---------------------------------
       FETCH PRESCRIPTION
    ---------------------------------- */
    const { data: prescription } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("id", prescription_id)
      .maybeSingle();

    if (!prescription) {
      return failure("Prescription not found", null, 404, {
        headers: corsHeaders
      });
    }

    /* ---------------------------------
       OWNERSHIP VALIDATION
    ---------------------------------- */
    if (prescription.doctor_id !== doctor_id) {
      return failure("Unauthorized doctor", null, 403, {
        headers: corsHeaders
      });
    }

    if (prescription.patient_id !== patient_id) {
      return failure("Patient mismatch", null, 403, {
        headers: corsHeaders
      });
    }

    /* ---------------------------------
       PREVENT UPDATE AFTER SIGN
    ---------------------------------- */
    if (prescription.signed_at && action !== "sign") {
      return failure(
        "Signed prescription cannot be modified",
        null,
        409,
        { headers: corsHeaders }
      );
    }

    /* ---------------------------------
       VALIDATE DOCTOR
    ---------------------------------- */
    const { data: doctor } = await supabase
      .from("doctor_details")
      .select("id, onboarding_status")
      .eq("id", doctor_id)
      .maybeSingle();

    if (!doctor || ["pending", "rejected"].includes(doctor.onboarding_status)) {
      return failure("Doctor account inactive", null, 403, {
        headers: corsHeaders
      });
    }

    /* ---------------------------------
       SIGN VALIDATION
    ---------------------------------- */
    if (action === "sign") {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return failure("Medicines required to sign", null, 422, {
          headers: corsHeaders
        });
      }

      if (!diagnosis || Object.keys(diagnosis).length === 0) {
        return failure("Diagnosis required to sign", null, 422, {
          headers: corsHeaders
        });
      }
    }

    /* ---------------------------------
       PREPARE UPDATE DATA
    ---------------------------------- */
    const now = new Date().toISOString();

    const updateData = {
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
      status: action === "sign" ? "completed" : prescription.status,
      updated_at: now
    };

    if (action === "sign") {
      updateData.signed_by = doctor_id;
      updateData.signed_at = now;
      updateData.completed_at = now;
    }

    /* ---------------------------------
       UPDATE PRESCRIPTION
    ---------------------------------- */
    const { data: updatedPrescription, error } = await supabase
      .from("prescriptions")
      .update(updateData)
      .eq("id", prescription_id)
      .select("*")
      .single();

    if (error) throw error;

    /* ---------------------------------
       UPDATE APPOINTMENT (IF SIGNED)
    ---------------------------------- */
    if (action === "sign" && appointment_id) {
      await supabase
        .from("appointments")
        .update({
          status: "completed",
          prescription_id: prescription_id,
          updated_at: now
        })
        .eq("id", appointment_id);
    }

    return success(
      action === "sign"
        ? "Prescription updated and signed successfully"
        : "Prescription updated successfully",
      { prescription: updatedPrescription },
      200,
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Update prescription error:", err);
    return failure(
      "Failed to update prescription",
      err.message,
      500,
      { headers: corsHeaders }
    );
  }
}
