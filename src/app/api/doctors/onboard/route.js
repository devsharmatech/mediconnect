import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Text fields
    const full_name = formData.get('full_name');
    const email = formData.get('email');
    const specialization = formData.get('specialization');
    const experience_years = formData.get('experience_years');
    const license_number = formData.get('license_number');
    const clinic_name = formData.get('clinic_name');
    const clinic_address = formData.get('clinic_address');
    const consultation_fee = formData.get('consultation_fee');
    const qualification = formData.get('qualification');
    const indemnity_insurance = formData.get('indemnity_insurance');
    const dmc_mci_certificate_text = formData.get('dmc_mci_certificate');
    const aadhaar_pan_license_text = formData.get('aadhaar_pan_license');
    const digital_consent = formData.get('digital_consent');
    const onboarding_status = formData.get('onboarding_status') || 'pending';
    const phone_number = formData.get('phone_number');

    // Array fields
    const available_days = formData.get('available_days')?.split(',') || [];
    const speciality_tags = formData.get('speciality_tags')?.split(',') || [];

    // JSON fields
    const available_time = formData.get('available_time') 
      ? JSON.parse(formData.get('available_time'))
      : { start: "09:00", end: "17:00" };
    
    const bank_account_details = formData.get('bank_account_details')
      ? JSON.parse(formData.get('bank_account_details'))
      : { account_no: "", ifsc: "", bank_name: "" };

    // File uploads
    const dmc_mci_certificate_file = formData.get('dmc_mci_certificate_file');
    const aadhaar_pan_license_file = formData.get('aadhaar_pan_license_file');
    const address_proof_file = formData.get('address_proof_file');
    const passport_photo_file = formData.get('passport_photo_file');

    // Validate required fields
    if (!full_name || !email || !specialization || !phone_number) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start by creating user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          phone_number,
          role: 'doctor',
          is_verified: false,
          status: 1,
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    const doctorId = user.id;

    // Upload files and get their URLs
    let dmc_mci_certificate_url = dmc_mci_certificate_text;
    let aadhaar_pan_license_url = aadhaar_pan_license_text;
    let address_proof_url = null;
    let passport_photo_url = null;

    // Upload DMC/MCI Certificate to dmc-certificates folder
    if (dmc_mci_certificate_file) {
      const fileName = `${doctorId}-${Date.now()}.${dmc_mci_certificate_file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doctor-documents')
        .upload(`dmc-certificates/${fileName}`, dmc_mci_certificate_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from('doctor-documents')
          .getPublicUrl(`dmc-certificates/${fileName}`);
        dmc_mci_certificate_url = publicUrl.publicUrl;
      }
    }

    // Upload Aadhaar/PAN/License to aadhaar-pan folder
    if (aadhaar_pan_license_file) {
      const fileName = `${doctorId}-${Date.now()}.${aadhaar_pan_license_file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doctor-documents')
        .upload(`aadhaar-pan/${fileName}`, aadhaar_pan_license_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from('doctor-documents')
          .getPublicUrl(`aadhaar-pan/${fileName}`);
        aadhaar_pan_license_url = publicUrl.publicUrl;
      }
    }

    // Upload Address Proof to address-proofs folder
    if (address_proof_file) {
      const fileName = `${doctorId}-${Date.now()}.${address_proof_file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doctor-documents')
        .upload(`address-proofs/${fileName}`, address_proof_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from('doctor-documents')
          .getPublicUrl(`address-proofs/${fileName}`);
        address_proof_url = publicUrl.publicUrl;
      }
    }

    // Upload Passport Photo to passport-photos folder
    if (passport_photo_file) {
      const fileName = `${doctorId}-${Date.now()}.${passport_photo_file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doctor-documents')
        .upload(`passport-photos/${fileName}`, passport_photo_file);

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from('doctor-documents')
          .getPublicUrl(`passport-photos/${fileName}`);
        passport_photo_url = publicUrl.publicUrl;
      }
    }

    const { data: doctorDetails, error: detailsError } = await supabase
      .from('doctor_details')
      .insert([
        {
          id: doctorId,
          full_name,
          email,
          specialization,
          experience_years: parseInt(experience_years) || 0,
          license_number,
          clinic_name,
          clinic_address,
          available_days,
          available_time,
          speciality_tags,
          consultation_fee: parseFloat(consultation_fee) || 0,
          qualification,
          indemnity_insurance: parseFloat(indemnity_insurance) || 0,
          dmc_mci_certificate: dmc_mci_certificate_url,
          aadhaar_pan_license: aadhaar_pan_license_url,
          address_proof: address_proof_url,
          passport_photo: passport_photo_url,
          bank_account_details,
          digital_consent: Boolean(digital_consent),
          onboarding_status,
        }
      ])
      .select()
      .single();

    if (detailsError) {
      // Rollback: delete user and uploaded files
      await supabase.from('users').delete().eq('id', doctorId);

      const filesToDelete = [];
      if (dmc_mci_certificate_file) filesToDelete.push(`dmc-certificates/${doctorId}-*`);
      if (aadhaar_pan_license_file) filesToDelete.push(`aadhaar-pan/${doctorId}-*`);
      if (address_proof_file) filesToDelete.push(`address-proofs/${doctorId}-*`);
      if (passport_photo_file) filesToDelete.push(`passport-photos/${doctorId}-*`);

      for (const filePath of filesToDelete) {
        await supabase.storage.from('doctor-documents').remove([filePath]);
      }
      
      throw detailsError;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        doctor_details: doctorDetails
      }
    });
  } catch (error) {
    console.error('Error onboarding doctor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}