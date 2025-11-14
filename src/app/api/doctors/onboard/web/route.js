import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
const BUCKET = "doctor-documents";

// Helper: Upload file to Supabase Storage
async function uploadFile(folder, file, doctorId) {
  if (!file) return null;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop();
  const fileName = `${doctorId}-${Date.now()}-${uuidv4()}.${ext}`;
  const path = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return publicUrlData?.publicUrl;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const phone = formData.get("phone");
    if (!phone)
      return NextResponse.json({ status: false, message: "Phone required" });

    // Ensure user exists (or create new)
    let { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", phone)
      .maybeSingle();

    let doctorId = existingUser?.id;
    if (!doctorId) {
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({ phone_number: phone, role: "doctor", is_verified: true })
        .select("id")
        .single();
      if (error) throw error;
      doctorId = newUser.id;
    }

    // Helper: Upload multiple files
    const uploadMany = async (folder, field) => {
      const files = formData.getAll(field) || [];
      const urls = [];
      for (const f of files) {
        if (f && typeof f !== "string") {
          const url = await uploadFile(folder, f, doctorId);
          if (url) urls.push(url);
        }
      }
      return urls;
    };

    // Upload sections
    const dmc = await uploadMany(
      "dmc-certificates",
      "dmc_mci_nmc_certificates"
    );
    const aadhaarPan = await uploadMany("aadhaar-pan", "aadhaar_pan_license");
    const addressProof = await uploadMany("address-proofs", "address_proof");
    const passport = await uploadMany("passport-photos", "passport_photo");
    const clinicPhotos = await uploadMany("clinic-photos", "clinic_photos");

    // Signature upload (file or dataURL)
    let signature_url = null;
    const sig = formData.get("digital_signature");
    if (sig) {
      if (typeof sig === "string" && sig.startsWith("data:")) {
        const matches = sig.match(/^data:(.+);base64,(.*)$/);
        if (matches) {
          const contentType = matches[1];
          const base64 = matches[2];
          const buffer = Buffer.from(base64, "base64");
          const filename = `${doctorId}-${Date.now()}.png`;
          const path = `signatures/${filename}`;
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, buffer, { contentType });
          if (!error) {
            const { data: urlData } = supabase.storage
              .from(BUCKET)
              .getPublicUrl(path);
            signature_url = urlData.publicUrl;
          }
        }
      } else if (sig instanceof File) {
        signature_url = await uploadFile("signatures", sig, doctorId);
      }
    }

    // Prepare structured fields
    const parseJSON = (v) => {
      try {
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    };

    const details = {
      id: doctorId,
      full_name: formData.get("doctor_name"),
      email: formData.get("email"),
      specialization: parseJSON(formData.get("speciality")),
      experience_years: parseInt(formData.get("years_experience") || 0),
      available_time: { start: "09:00", end: "17:00" },
      available_time: ["Mon", "Wed", "Fri", "Sat"],
      license_number: formData.get("doctor_registration_no"),
      clinic_name: formData.get("clinic_name"),
      clinic_address: formData.get("clinic_address"),
      latitude: parseFloat(formData.get("clinic_lat") || 0),
      longitude: parseFloat(formData.get("clinic_lng") || 0),
      qualification: parseJSON(formData.get("qualification")),
      clinic_slots: parseJSON(formData.get("clinic_slots")),
      video_slots: parseJSON(formData.get("video_slots")),
      kyc_data: parseJSON(formData.get("kyc_data")),
      home_slots: parseJSON(formData.get("home_slots")),
      leave_days: parseJSON(formData.get("leave_days")),
      speciality_tags: parseJSON(formData.get("speciality_tags")),
      consultation_fee: parseFloat(formData.get("consultation_fee") || 0),
      indemnity_insurance: parseFloat(formData.get("insurance") || 0),
      dmc_mci_certificate: dmc,
      aadhaar_pan_license: aadhaarPan,
      address_proof: addressProof,
      passport_photo: passport,
      clinic_photos: clinicPhotos,
      signature_url,
      bank_account_details: {
        account_no: formData.get("bank_account_number"),
        ifsc: formData.get("bank_ifsc_code"),
        bank_name: formData.get("bank_name"),
        branch: formData.get("bank_branch"),
      },
      digital_consent: formData.get("digital_consent") === "true",
      onboarding_status: "pending",
      updated_at: new Date().toISOString(),
      meta: {
        bpl_service_agreement: formData.get("bpl_service_agreement") === "true",
        bpl_preferred_time: formData.get("bpl_preferred_time"),
        non_disclosure_agreement:
          formData.get("non_disclosure_agreement") === "true",
        terms_conditions_agreement:
          formData.get("terms_conditions_agreement") === "true",
        super_speciality: parseJSON(formData.get("super_speciality")),
      },
    };

    // Insert/update doctor_details
    const { data: existing } = await supabase
      .from("doctor_details")
      .select("id")
      .eq("id", doctorId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("doctor_details")
        .update(details)
        .eq("id", doctorId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("doctor_details").insert([details]);
      if (error) throw error;
    }

    return NextResponse.json({
      status: true,
      message: "Doctor onboarded successfully",
      doctorId,
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { status: false, message: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
