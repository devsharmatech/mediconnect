import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

/* ------------------------- 🟢 GET: List Labs ------------------------- */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("lab_details")
      .select("*, users!inner(id, phone_number, profile_picture, role)", { count: "exact" })
      .eq("users.role", "lab")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("lab_name", `%${search}%`);
    if (status) query = query.eq("onboarding_status", status);

    const { data, count, error } = await query;
    if (error) throw error;

    return success(
      "Labs fetched successfully.",
      {
        labs: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET Labs Error:", error);
    return failure("Failed to fetch labs. " + error.message, "lab_list_failed", 500, {
      headers: corsHeaders,
    });
  }
}

/* ------------------------- 🟢 POST: Create Lab ------------------------- */
export async function POST(req) {
  let createdUserId = null;
  const uploadedFiles = [];

  try {
    const formData = await req.formData();

    // Required field validation
    const required = ["lab_name", "owner_name", "phone_number", "email"];
    for (const f of required) {
      if (!formData.get(f)) {
        return failure(`Missing required field: ${f}`, "validation_error", 400, {
          headers: corsHeaders,
        });
      }
    }

    const phone_number = formData.get("phone_number").trim();
    const email = formData.get("email").trim();

    // Check if user already registered
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (existing)
      return failure(
        "User already registered with this phone.",
        "user_already_registered",
        409,
        { headers: corsHeaders }
      );

    // Create user
    const { data: user, error: userErr } = await supabase
      .from("users")
      .insert({
        phone_number,
        role: "lab",
        is_verified: true,
      })
      .select()
      .single();
    if (userErr) throw new Error(userErr.message);
    createdUserId = user.id;

    // Helper: upload documents
    async function upload(file, field) {
      if (!file || !file.name) return null;
      const path = `${field}/${field}_${Date.now()}_${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from("lab-documents")
        .upload(path, buffer, { contentType: file.type });
      if (error) throw new Error(`Failed to upload ${field}: ${error.message}`);
      uploadedFiles.push(path);
      const { data } = supabase.storage.from("lab-documents").getPublicUrl(path);
      return data.publicUrl;
    }

    // Upload files
    const pan_card_url = await upload(formData.get("pan_card"), "pan_card");
    const aadhaar_card_url = await upload(formData.get("aadhaar_card"), "aadhaar_card");
    const lab_license_url = await upload(formData.get("lab_license"), "lab_license");
    const gst_certificate_url = await upload(formData.get("gst_certificate"), "gst_certificate");
    const owner_photo_url = await upload(formData.get("owner_photo"), "owner_photo");
    const signature_url = await upload(formData.get("signature"), "signature");

    const json = (f) =>
      formData.get(f) ? JSON.parse(formData.get(f)) : null;

    // Insert into lab_details
    const { data, error } = await supabase
      .from("lab_details")
      .insert([
        {
          id: createdUserId,
          lab_name: formData.get("lab_name"),
          owner_name: formData.get("owner_name"),
          email,
          phone_number,
          contact_person: formData.get("contact_person"),
          address: formData.get("address"),
          license_number: formData.get("license_number"),
          registration_number: formData.get("registration_number"),
          gst_number: formData.get("gst_number"),
          pan_number: formData.get("pan_number"),
          latitude: formData.get("latitude"),
          longitude: formData.get("longitude"),
          opening_hours: json("opening_hours"),
          services: json("services") || [],
          accepts_home_collection: formData.get("accepts_home_collection") === "true",
          general_turnaround: formData.get("general_turnaround"),
          onboarding_status: "pending",
          pan_card_url,
          aadhaar_card_url,
          lab_license_url,
          gst_certificate_url,
          owner_photo_url,
          signature_url,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return success("Lab created successfully.", data, 201, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Create Lab Error:", error);

    if (createdUserId)
      await supabase.from("users").delete().eq("id", createdUserId);
    if (uploadedFiles.length)
      await supabase.storage.from("lab-documents").remove(uploadedFiles);

    return failure("Failed to create lab. " + error.message, "lab_creation_failed", 500, {
      headers: corsHeaders,
    });
  }
}
