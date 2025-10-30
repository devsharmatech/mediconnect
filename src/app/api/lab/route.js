import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { min_rating, city, license_number, lab_name } = body || {};

    let query = supabase
      .from("lab_details")
      .select(
        `
        id,
        lab_name,
        owner_name,
        email,
        license_number,
        address,
        latitude,
        longitude,
        rating,
        total_reviews,
        opening_hours,
        users:users!inner(
          id,
          profile_picture,
          role
        )
      `
      )
      .eq("users.role", "lab");

    if (min_rating) query = query.gte("rating", Number(min_rating));
    if (city) query = query.ilike("address", `%${city}%`);
    if (license_number)
      query = query.ilike("license_number", `%${license_number}%`);
    if (lab_name) query = query.ilike("lab_name", `%${lab_name}%`);

    query = query.order("rating", { ascending: false });

    const { data: labs, error } = await query;
    if (error) throw error;

    if (!labs || labs.length === 0) {
      const { data: allLabs, error: allError } = await supabase
        .from("lab_details")
        .select(
          `
          id,
        lab_name,
        owner_name,
        email,
        license_number,
        address,
        latitude,
        longitude,
        rating,
        total_reviews,
        opening_hours,
        users:users!inner(
          id,
          profile_picture,
          role
        )
        `
        )
        .eq("users.role", "lab")
        .order("rating", { ascending: false });

      if (allError) throw allError;
      return success(
        "No filters or no match — returning all labs.",
        allLabs,
        200,
        { headers: corsHeaders }
      );
    }

    return success("Labs fetched successfully.", labs, 200, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Fetch labs error:", error);
    return failure("Failed to fetch lab list.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}
