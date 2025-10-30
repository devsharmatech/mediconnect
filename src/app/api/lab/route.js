import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { test_type, min_rating, city, onboarding_status } = body || {};

    let query = supabase
      .from("lab_details")
      .select(`
        id,
        lab_name,
        email,
        contact_number,
        test_type,
        address,
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
      .eq("users.role", "lab");

    if (test_type) query = query.ilike("test_type", `%${test_type}%`);
    if (min_rating) query = query.gte("rating", Number(min_rating));
    if (city) query = query.ilike("address", `%${city}%`);
    if (onboarding_status) query = query.eq("onboarding_status", onboarding_status);

    query = query.order("rating", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      const { data: all, error: allErr } = await supabase
        .from("lab_details")
        .select(`
          id,
          lab_name,
          address,
          test_type,
          rating,
          total_reviews,
          users:users!inner(
            id,
            profile_picture,
            role
          )
        `)
        .eq("users.role", "lab")
        .order("rating", { ascending: false });

      if (allErr) throw allErr;

      return success("No filters applied or no match found — returning all labs.", all, 200, { headers: corsHeaders });
    }

    return success("Labs fetched successfully.", data, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Lab fetch error:", error);
    return failure("Failed to fetch lab list.", error.message, 500, { headers: corsHeaders });
  }
}
