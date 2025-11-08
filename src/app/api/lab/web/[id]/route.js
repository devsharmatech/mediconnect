import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

/* -------------------- GET Lab Details -------------------- */
export async function GET(_, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return failure("Missing lab ID.", "validation_error", 400, { headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("lab_details")
      .select(
        `*,
         users:users!inner(
           id,
           phone_number,
           profile_picture,
           role,
           is_verified,
           created_at,
           updated_at
         )`
      )
      .eq("id", id)
      .single();

    if (error) {
      // handle not found separately if needed
      if (error?.code === "PGRST116" || /Results contain 0 rows/.test(error.message || "")) {
        return failure("Lab not found.", "not_found", 404, { headers: corsHeaders });
      }
      throw error;
    }

    return success("Lab details fetched successfully.", data, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Lab detail error:", error);
    return failure("Failed to fetch lab details. " + (error?.message || ""), "lab_detail_failed", 500, {
      headers: corsHeaders,
    });
  }
}



/* -------------------- DELETE Lab (remove DB + all docs) -------------------- */
export async function DELETE(_, { params }) {
  try {
    const { id } = params;

    // Fetch all document URLs before deletion
    const { data: lab, error: fetchErr } = await supabase
      .from("lab_details")
      .select("pan_card_url, aadhaar_card_url, lab_license_url, gst_certificate_url, owner_photo_url, signature_url")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    // Delete lab record
    const { error } = await supabase.from("lab_details").delete().eq("id", id);
    if (error) throw error;

    // Remove documents from storage
    const paths = Object.values(lab)
      .filter((url) => url)
      .map((url) => url.split("/lab-documents/")[1]);
    if (paths.length)
      await supabase.storage.from("lab-documents").remove(paths);

    return success("Lab and associated documents deleted.", { id }, 200, {
      headers: corsHeaders,
    });
  } catch (error) {
    return failure("Failed to delete lab. " + error.message, "lab_delete_failed", 500, {
      headers: corsHeaders,
    });
  }
}
