import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { min_rating, city, license_number, store_name } = body || {};

    let query = supabase
      .from("chemist_details")
      .select(`
        id,
        store_name,
        owner_name,
        email,
        gst_number,
        license_number,
        address,
        open_hours,
        latitude,
        longitude,
        rating,
        total_reviews,
        users:users!inner(
          id,
          profile_picture,
          role
        )
      `)
      .eq("users.role", "chemist");

    if (min_rating) query = query.gte("rating", Number(min_rating));
    if (city) query = query.ilike("address", `%${city}%`);
    if (license_number) query = query.ilike("license_number", `%${license_number}%`);
    if (store_name) query = query.ilike("store_name", `%${store_name}%`);

    query = query.order("rating", { ascending: false });

    const { data: chemists, error } = await query;
    if (error) throw error;

    if (!chemists || chemists.length === 0) {
      const { data: allChemists, error: allError } = await supabase
        .from("chemist_details")
        .select(`
          id,
          store_name,
          owner_name,
          email,
          address,
          rating,
          users:users!inner(
            id,
            profile_picture,
            role
          )
        `)
        .eq("users.role", "chemist")
        .order("rating", { ascending: false });

      if (allError) throw allError;
      return success("No filters or no match — returning all chemists.", allChemists, 200, { headers: corsHeaders });
    }

    return success("Chemists fetched successfully.", chemists, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Fetch chemists error:", error);
    return failure("Failed to fetch chemist list.", error.message, 500, { headers: corsHeaders });
  }
}
