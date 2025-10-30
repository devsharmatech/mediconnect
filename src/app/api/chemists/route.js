import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { city, min_rating, onboarding_status } = body || {};

    let query = supabase
      .from("chemist_details")
      .select(`
        id,
        name,
        email,
        license_number,
        shop_name,
        address,
        contact_number,
        rating,
        total_reviews,
        onboarding_status,
        latitude,
        longitude,
        users:users!inner(
          id,
          profile_picture,
          role
        )
      `)
      .eq("users.role", "chemist");

    if (city) query = query.ilike("address", `%${city}%`);
    if (min_rating) query = query.gte("rating", Number(min_rating));
    if (onboarding_status) query = query.eq("onboarding_status", onboarding_status);

    query = query.order("rating", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      const { data: all, error: allErr } = await supabase
        .from("chemist_details")
        .select(`
          id,
          name,
          shop_name,
          address,
          contact_number,
          rating,
          total_reviews,
          users:users!inner(
            id,
            profile_picture,
            role
          )
        `)
        .eq("users.role", "chemist")
        .order("rating", { ascending: false });

      if (allErr) throw allErr;

      return success("No filters applied or no match found — returning all chemists.", all, 200, { headers: corsHeaders });
    }

    return success("Chemists fetched successfully.", data, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Chemist fetch error:", error);
    return failure("Failed to fetch chemist list.", error.message, 500, { headers: corsHeaders });
  }
}
