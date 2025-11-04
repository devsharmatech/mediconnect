import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Doctor IDs are required" },
        { status: 400 }
      );
    }
    const { data: doctorDetails, error: fetchError } = await supabase
      .from('doctor_details')
      .select('*')
      .in('id', ids);

    if (fetchError) throw fetchError;
    const filesToDelete = [];

    if (doctorDetails && doctorDetails.length > 0) {
      doctorDetails.forEach(doctor => {
        if (doctor.dmc_mci_certificate) {
          const dmcPath = extractFilePathFromUrl(doctor.dmc_mci_certificate);
          if (dmcPath) filesToDelete.push(dmcPath);
        }
        if (doctor.aadhaar_pan_license) {
          const aadhaarPath = extractFilePathFromUrl(doctor.aadhaar_pan_license);
          if (aadhaarPath) filesToDelete.push(aadhaarPath);
        }
        if (doctor.address_proof) {
          const addressPath = extractFilePathFromUrl(doctor.address_proof);
          if (addressPath) filesToDelete.push(addressPath);
        }
        if (doctor.passport_photo) {
          const passportPath = extractFilePathFromUrl(doctor.passport_photo);
          if (passportPath) filesToDelete.push(passportPath);
        }
      });
    }

    // Delete files from storage if any exist
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('doctor-documents')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
      }
    }
    const { error: detailsError } = await supabase
      .from('doctor_details')
      .delete()
      .in('id', ids);

    if (detailsError) throw detailsError;

    // Then delete users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .in('id', ids)
      .eq('role', 'doctor');

    if (usersError) throw usersError;

    return NextResponse.json({
      success: true,
      message: `${ids.length} doctor(s) and their associated files deleted successfully`,
      deletedFiles: filesToDelete.length
    });
  } catch (error) {
    console.error('Error deleting doctors:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function extractFilePathFromUrl(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('public') + 1;
    if (bucketIndex > 0 && bucketIndex < pathParts.length) {
      return pathParts.slice(bucketIndex).join('/');
    }
    
    // Alternative: Direct path extraction for simpler URLs
    const directMatch = url.match(/doctor-documents\/(.+)$/);
    if (directMatch) return directMatch[1];
    
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
}