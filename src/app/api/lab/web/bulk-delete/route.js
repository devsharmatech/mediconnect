import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || !ids.length)
      return failure("No lab IDs provided.", "validation_error", 400, {
        headers: corsHeaders,
      });

    const { data: labs, error: fetchErr } = await supabase
      .from("lab_details")
      .select("pan_card_url, aadhaar_card_url, lab_license_url, gst_certificate_url, owner_photo_url, signature_url")
      .in("id", ids);
    if (fetchErr) throw fetchErr;

    const { error } = await supabase.from("lab_details").delete().in("id", ids);
    if (error) throw error;

    const paths = labs
      .flatMap((lab) =>
        Object.values(lab)
          .filter((url) => url)
          .map((url) => url.split("/lab-documents/")[1])
      )
      .filter(Boolean);

    if (paths.length)
      await supabase.storage.from("lab-documents").remove(paths);

    return success("Labs and documents deleted successfully.", { deleted: ids }, 200, {
      headers: corsHeaders,
    });
  } catch (error) {
    return failure("Failed to delete labs. " + error.message, "lab_bulk_delete_failed", 500, {
      headers: corsHeaders,
    });
  }
}
