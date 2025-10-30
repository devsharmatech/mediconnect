import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { specialization, min_rating, city, onboarding_status } = body || {};

    let query = supabase
      .from("pharmacist_details")
      .select(`
        id,
        full_name,
        email,
        specialization,
        license_number,
        experience_years,
        workplace_name,
        workplace_address,
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
      .eq("users.role", "pharmacist");

    if (specialization) query = query.ilike("specialization", `%${specialization}%`);
    if (min_rating) query = query.gte("rating", Number(min_rating));
    if (city) query = query.ilike("workplace_address", `%${city}%`);
    if (onboarding_status) query = query.eq("onboarding_status", onboarding_status);

    query = query.order("rating", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      const { data: all, error: allErr } = await supabase
        .from("pharmacist_details")
        .select(`
          id,
          full_name,
          specialization,
          workplace_name,
          workplace_address,
          rating,
          total_reviews,
          users:users!inner(
            id,
            profile_picture,
            role
          )
        `)
        .eq("users.role", "pharmacist")
        .order("rating", { ascending: false });

      if (allErr) throw allErr;

      return success("No filters applied or no match found — returning all pharmacists.", all, 200, { headers: corsHeaders });
    }

    return success("Pharmacists fetched successfully.", data, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Pharmacist fetch error:", error);
    return failure("Failed to fetch pharmacist list.", error.message, 500, { headers: corsHeaders });
  }
}
