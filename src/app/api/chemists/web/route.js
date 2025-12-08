import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const phone_number = formData.get("phone_number");
    const owner_name = formData.get("owner_name");
    const email = formData.get("email");
    const pharmacy_name = formData.get("pharmacy_name");
    const address = formData.get("address");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");
    const gstin = formData.get("gstin");
    const payout_mode = formData.get("payout_mode");
    const mobile = formData.get("mobile");
    const whatsapp = formData.get("whatsapp");
    const registration_no = formData.get("registration_no");

    const consent_terms = formData.get("consent_terms") === "true";

    if (!phone_number || !owner_name || !pharmacy_name || !registration_no) {
      return failure("Missing required fields.", null, 400, {
        headers: corsHeaders,
      });
    }

    if (!consent_terms) {
      return failure("Please accept terms and conditions.", null, 400, {
        headers: corsHeaders,
      });
    }
    const { data: existingPhone } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (existingPhone) {
      return failure(
        "A chemist with this phone number already exists.",
        null,
        409,
        { headers: corsHeaders }
      );
    }

    const { data: existingReg } = await supabase
      .from("chemist_details")
      .select("id")
      .eq("registration_no", registration_no)
      .maybeSingle();

    if (existingReg) {
      return failure(
        "A chemist with this registration number already exists.",
        null,
        409,
        { headers: corsHeaders }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          phone_number,
          role: "chemist",
          is_verified: true,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    const uploadFile = async (fieldName, file) => {
      if (!file || file.size === 0) return null;

      const fileExt = file.name.split(".").pop();
      const fileName = `${fieldName}/${fieldName}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chemist-documents")
        .upload(fileName, file, { upsert: false });

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

    const uploadedDocs = {};
    for (const field of documentFields) {
      const file = formData.get(field);
      if (file && file.size > 0) {
        uploadedDocs[field] = await uploadFile(field, file);
      }
    }

    // 🔸 Step 3: Insert chemist details
    const { error: chemistError } = await supabase
      .from("chemist_details")
      .insert([
        {
          id: user.id,
          owner_name,
          email,
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          gstin,
          kyc_data: parseJSON(formData.get("kyc_data") || []),
          payout_mode,
          mobile,
          whatsapp,
          pharmacy_name,
          registration_no,
          consent_terms,
          ...uploadedDocs,
        },
      ]);

    if (chemistError) throw chemistError;

    return success("Chemist onboarded successfully.", { id: user.id }, 201, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Chemist Onboarding Error:", error);
    return failure("Failed to onboard chemist.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const payout_mode = searchParams.get("payout_mode") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase.from("chemist_details").select(
      `*,
   users!chemist_details_id_fkey (
      id,
      un_id,
      phone_number,
      role,
      status,
      created_at,
      profile_picture
   )`,
      { count: "exact" }
    );

    // Apply search filter
    if (search) {
      query = query.or(
        `owner_name.ilike.%${search}%,pharmacy_name.ilike.%${search}%,email.ilike.%${search}%,users.phone_number.ilike.%${search}%,registration_no.ilike.%${search}%`
      );
    }

    // Apply status filter
    if (status) {
      if (status === "active") {
        query = query.eq("users.status", 1);
      } else if (status === "inactive") {
        query = query.eq("users.status", 0);
      }
    }

    // Apply payout mode filter
    if (payout_mode) {
      query = query.eq("payout_mode", payout_mode);
    }

    // Apply sorting
    if (sortBy === "name") {
      query = query.order("owner_name", { ascending: sortOrder === "asc" });
    } else if (sortBy === "pharmacy_name") {
      query = query.order("pharmacy_name", { ascending: sortOrder === "asc" });
    } else if (sortBy === "registration_no") {
      query = query.order("registration_no", {
        ascending: sortOrder === "asc",
      });
    } else {
      query = query.order("created_at", { ascending: sortOrder === "asc" });
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return success(
      "Chemists fetched successfully.",
      {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search,
          status,
          payout_mode,
          sortBy,
          sortOrder,
        },
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Fetch Chemists Error:", error);
    return failure("Failed to fetch chemists.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}
