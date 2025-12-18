import { supabase } from "@/lib/supabaseAdmin";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

// GET templates by specialization and appointment type
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization");
    const appointment_type = searchParams.get("appointment_type") || "clinic_visit";
    const include_defaults = searchParams.get("include_defaults") === "true";

    let query = supabase
      .from("prescription_templates")
      .select("*")
      .eq("is_active", true);

    if (specialization) {
      query = query.eq("specialization", specialization);
    }
    if (appointment_type) {
      query = query.eq("appointment_type", appointment_type);
    }

    const { data: templates, error } = await query;
    if (error) throw error;

    // If no templates found, return default structure
    if (templates.length === 0) {
      const defaultTemplate = getDefaultTemplate(specialization, appointment_type);
      return Response.json(
        {
          success: true,
          template: defaultTemplate,
          is_default: true
        },
        { headers: corsHeaders }
      );
    }

    // Return templates with or without defaults based on parameter
    const responseTemplates = include_defaults 
      ? templates 
      : templates.map(({ default_values, ...rest }) => rest);

    return Response.json(
      {
        success: true,
        templates: responseTemplates,
        count: templates.length
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Template API Error:", err);
    return Response.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Helper function for default template structure
function getDefaultTemplate(specialization = "general", appointment_type = "clinic_visit") {
  const baseStructure = {
    specialization,
    appointment_type,
    name: `${specialization} ${appointment_type.replace('_', ' ')} Form`,
    template_structure: {
      sections: {
        doctor_details: {
          fields: ["name", "qualification", "specialization", "registration_number", "contact"]
        },
        patient_details: {
          fields: ["name", "age", "gender", "weight", "contact"]
        },
        diagnosis: {
          type: "textarea",
          label: "Diagnosis"
        },
        vital_signs: {
          fields: ["bp", "pulse", "temperature"]
        },
        examination: {
          type: "textarea",
          label: "Examination Findings"
        },
        treatment: {
          type: "medicines"
        },
        instructions: {
          type: "textarea",
          label: "Special Instructions"
        },
        follow_up: {
          fields: ["return_after", "next_appointment"]
        }
      }
    },
    default_values: {
      vital_signs: {
        bp: "120/80 mmHg",
        temperature: "98.6°F"
      },
      follow_up: {
        return_after: "1 week"
      }
    }
  };

  // Specialization-specific adjustments
  if (specialization === "cardiology") {
    baseStructure.template_structure.sections.vital_signs.fields.push("spo2", "respiratory_rate", "weight_bmi");
    baseStructure.template_structure.sections.examination = {
      fields: ["general_appearance", "breathlessness", "chest_pain", "palpitations", "leg_swelling"]
    };
    baseStructure.default_values.vital_signs.spo2 = "98%";
  }

  if (specialization === "dermatology") {
    baseStructure.template_structure.sections.examination = {
      fields: ["site", "lesion_type", "morphology", "distribution", "scalp_hair", "nails"]
    };
  }

  // Appointment type adjustments
  if (appointment_type === "video_call") {
    baseStructure.template_structure.sections.teleconsultation_note = {
      type: "note",
      text: "This prescription is based on teleconsultation without physical examination. Seek in-person care if symptoms worsen."
    };
  }

  return baseStructure;
}