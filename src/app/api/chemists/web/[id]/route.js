import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}


export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("chemist_details")
      .select(
        `*,
         users:id (
            id,
            un_id,
            phone_number,
            role,
            status,
            created_at,
            profile_picture
         )`
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return failure("Chemist not found.", null, 404, { headers: corsHeaders });
      }
      throw error;
    }

    return success("Chemist details fetched successfully.", data, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Fetch Chemist Details Error:", error);
    return failure("Failed to fetch chemist details.", error.message, 500, { headers: corsHeaders });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    const updateData = {
      owner_name: formData.get("owner_name"),
      email: formData.get("email"),
      pharmacy_name: formData.get("pharmacy_name"),
      address: formData.get("address"),
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude")) : null,
      gstin: formData.get("gstin"),
      payout_mode: formData.get("payout_mode"),
      mobile: formData.get("mobile"),
      whatsapp: formData.get("whatsapp"),
      registration_no: formData.get("registration_no"),
      consent_terms: formData.get("consent_terms") === "true",
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Handle file uploads with folder organization
    const uploadFile = async (fieldName, file) => {
      if (!file || file.size === 0) return null;

      const fileExt = file.name.split(".").pop();
      // Organize by user ID and document type folder
      const fileName = `${id}/${fieldName}/${fieldName}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("chemist-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicURL } = supabase.storage
        .from("chemist-documents")
        .getPublicUrl(fileName);
      return publicURL?.publicUrl || null;
    };

    const documentFields = [
      "drug_license",
      "pharmacist_certificate",
      "pan_aadhaar",
      "gstin_certificate",
      "cancelled_cheque",
      "store_photo",
      "consent_form",
      "declaration_form",
      "digital_signature",
    ];

    for (const field of documentFields) {
      const file = formData.get(`${field}_file`);
      if (file && file.size > 0) {
        updateData[field] = await uploadFile(field, file);
      }
    }

    const { error } = await supabase
      .from("chemist_details")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    return success("Chemist details updated successfully.", null, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Update Chemist Error:", error);
    return failure("Failed to update chemist details.", error.message, 500, { headers: corsHeaders });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const { error } = await supabase.from("users").update({ status }).eq("id", id);
    if (error) throw error;

    return success("Chemist status updated successfully.", null, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Update Status Error:", error);
    return failure("Failed to change status.", error.message, 500, { headers: corsHeaders });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;

    return success("Chemist deleted successfully.", null, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Delete Chemist Error:", error);
    return failure("Failed to delete chemist.", error.message, 500, { headers: corsHeaders });
  }
}
