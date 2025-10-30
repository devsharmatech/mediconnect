import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function PUT(req) {
  try {
    const formData = await req.formData();

    // 🧾 Basic fields
    const user_id = formData.get("user_id");
    const full_name = formData.get("full_name");
    const email = formData.get("email");
    const specialization = formData.get("specialization");
    const experience_years = formData.get("experience_years");
    const license_number = formData.get("license_number");
    const clinic_name = formData.get("clinic_name");
    const clinic_address = formData.get("clinic_address");
    const consultation_fee = formData.get("consultation_fee");
    const qualification = formData.get("qualification");
    const indemnity_insurance = formData.get("indemnity_insurance");
    const bank_account_details = formData.get("bank_account_details");
    const digital_consent = formData.get("digital_consent") === "true";
    

    // 🗂️ File uploads
    const profile_picture = formData.get("profile_picture");
    const dmc_mci_certificate = formData.get("dmc_mci_certificate");
    const aadhaar_pan_license = formData.get("aadhaar_pan_license");
    const address_proof = formData.get("address_proof");
    const passport_photo = formData.get("passport_photo");

    // ✅ Required validation
    if (!user_id || !full_name || !email) {
      return failure("Missing required fields: user_id, full_name, or email.", null, 400, { headers: corsHeaders });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure("Invalid email format.", null, 400, { headers: corsHeaders });
    }

    // ✅ Fetch user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, profile_picture, role")
      .eq("id", user_id)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) return failure("User not found.", null, 404, { headers: corsHeaders });
    if (userData.role !== "doctor") return failure("Invalid role for this endpoint.", null, 403, { headers: corsHeaders });

    // 🔄 Helper: upload a single file and return public URL
    const uploadFile = async (file, folder) => {
      if (!file || !file.name) return null;
      const ext = file.name.split(".").pop();
      const fileName = `${folder}/${user_id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("doctor-documents").upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("doctor-documents").getPublicUrl(fileName);
      return publicData?.publicUrl || null;
    };

    // 📤 Upload all file fields if present
    const uploadedFiles = {};
    uploadedFiles.profile_picture = profile_picture?.name ? await uploadFile(profile_picture, "profile") : userData.profile_picture;
    uploadedFiles.dmc_mci_certificate = dmc_mci_certificate?.name ? await uploadFile(dmc_mci_certificate, "registration") : null;
    uploadedFiles.aadhaar_pan_license = aadhaar_pan_license?.name ? await uploadFile(aadhaar_pan_license, "idproofs") : null;
    uploadedFiles.address_proof = address_proof?.name ? await uploadFile(address_proof, "address") : null;
    uploadedFiles.passport_photo = passport_photo?.name ? await uploadFile(passport_photo, "passport") : null;

    // 🏦 Parse bank details
    let bankDetailsJSON = null;
    try {
      bankDetailsJSON = bank_account_details ? JSON.parse(bank_account_details) : null;
    } catch {
      bankDetailsJSON = null;
    }

    // 🩺 Update doctor_details
    const { error: updateError } = await supabase
      .from("doctor_details")
      .update({
        full_name,
        email,
        specialization,
        experience_years: experience_years ? Number(experience_years) : null,
        license_number,
        clinic_name,
        clinic_address,
        consultation_fee: consultation_fee ? Number(consultation_fee) : 0,
        qualification,
        indemnity_insurance: indemnity_insurance ? Number(indemnity_insurance) : null,
        dmc_mci_certificate: uploadedFiles.dmc_mci_certificate,
        aadhaar_pan_license: uploadedFiles.aadhaar_pan_license,
        address_proof: uploadedFiles.address_proof,
        passport_photo: uploadedFiles.passport_photo,
        bank_account_details: bankDetailsJSON,
        digital_consent,
        updated_at: new Date(),
      })
      .eq("id", user_id);

    if (updateError) throw updateError;

    // 👤 Update profile picture
    if (uploadedFiles.profile_picture !== userData.profile_picture) {
      const { error: profileErr } = await supabase
        .from("users")
        .update({ profile_picture: uploadedFiles.profile_picture })
        .eq("id", user_id);
      if (profileErr) throw profileErr;
    }

    return success(
      "Doctor profile updated successfully.",
      {
        user_id,
        full_name,
        email,
        specialization,
        experience_years,
        license_number,
        clinic_name,
        clinic_address,
        consultation_fee,
        qualification,
        profile_picture: uploadedFiles.profile_picture,
        dmc_mci_certificate: uploadedFiles.dmc_mci_certificate,
        aadhaar_pan_license: uploadedFiles.aadhaar_pan_license,
        address_proof: uploadedFiles.address_proof,
        passport_photo: uploadedFiles.passport_photo,
        bank_account_details: bankDetailsJSON,
        digital_consent,
        onboarding_status,
      },
      200,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Doctor update error:", error);
    return failure("Failed to update doctor profile.", error.message, 500, { headers: corsHeaders });
  }
}
