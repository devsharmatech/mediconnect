import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(request) {
  try {
    const formData = await request.formData();

    const id = formData.get("id");
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
    const digital_consent = formData.get("digital_consent");
    const onboarding_status = formData.get("onboarding_status");

    // Array fields
    const available_days = formData.get("available_days")?.split(",") || [];
    const speciality_tags = formData.get("speciality_tags")?.split(",") || [];

    // JSON fields
    const available_time = formData.get("available_time")
      ? JSON.parse(formData.get("available_time"))
      : undefined;

    const bank_account_details = formData.get("bank_account_details")
      ? JSON.parse(formData.get("bank_account_details"))
      : undefined;

    // File uploads
    const dmc_mci_certificate_file = formData.get("dmc_mci_certificate_file");
    const aadhaar_pan_license_file = formData.get("aadhaar_pan_license_file");
    const address_proof_file = formData.get("address_proof_file");
    const passport_photo_file = formData.get("passport_photo_file");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Get current doctor details to preserve existing file URLs
    const { data: currentDoctor, error: fetchError } = await supabase
      .from("doctor_details")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const updateData = {
      full_name,
      email,
      specialization,
      experience_years: experience_years
        ? parseInt(experience_years)
        : undefined,
      license_number,
      clinic_name,
      clinic_address,
      available_days: available_days.length > 0 ? available_days : undefined,
      available_time,
      speciality_tags: speciality_tags.length > 0 ? speciality_tags : undefined,
      consultation_fee: consultation_fee
        ? parseFloat(consultation_fee)
        : undefined,
      qualification,
      indemnity_insurance: indemnity_insurance
        ? parseFloat(indemnity_insurance)
        : undefined,
      bank_account_details,
      digital_consent:
        digital_consent !== undefined ? Boolean(digital_consent) : undefined,
      onboarding_status,
      updated_at: new Date().toISOString(),
    };

    // Handle file uploads

    // Upload DMC/MCI Certificate to dmc-certificates folder
    if (dmc_mci_certificate_file) {
      const fileName = `${id}-${Date.now()}.${dmc_mci_certificate_file.name
        .split(".")
        .pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("doctor-documents")
        .upload(`dmc-certificates/${fileName}`, dmc_mci_certificate_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("doctor-documents")
          .getPublicUrl(`dmc-certificates/${fileName}`);
        updateData.dmc_mci_certificate = publicUrl.publicUrl;
      }
    }

    // Upload Aadhaar/PAN/License to aadhaar-pan folder
    if (aadhaar_pan_license_file) {
      const fileName = `${id}-${Date.now()}.${aadhaar_pan_license_file.name
        .split(".")
        .pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("doctor-documents")
        .upload(`aadhaar-pan/${fileName}`, aadhaar_pan_license_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("doctor-documents")
          .getPublicUrl(`aadhaar-pan/${fileName}`);
        updateData.aadhaar_pan_license = publicUrl.publicUrl;
      }
    }

    // Upload Address Proof to address-proofs folder
    if (address_proof_file) {
      const fileName = `${id}-${Date.now()}.${address_proof_file.name
        .split(".")
        .pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("doctor-documents")
        .upload(`address-proofs/${fileName}`, address_proof_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("doctor-documents")
          .getPublicUrl(`address-proofs/${fileName}`);
        updateData.address_proof = publicUrl.publicUrl;
      }
    }

    // Upload Passport Photo to passport-photos folder
    if (passport_photo_file) {
      const fileName = `${id}-${Date.now()}.${passport_photo_file.name
        .split(".")
        .pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("doctor-documents")
        .upload(`passport-photos/${fileName}`, passport_photo_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("doctor-documents")
          .getPublicUrl(`passport-photos/${fileName}`);
        updateData.passport_photo = publicUrl.publicUrl;
      }
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update doctor details
    const { data: doctorDetails, error: detailsError } = await supabase
      .from("doctor_details")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (detailsError) throw detailsError;

    return NextResponse.json({
      success: true,
      data: doctorDetails,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
