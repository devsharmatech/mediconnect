import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // First, get doctor details to find file paths
    const { data: doctorDetails, error: fetchError } = await supabase
      .from("doctor_details")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw fetchError;
    }

    // Collect all file paths to delete from storage
    const filesToDelete = [];

    if (doctorDetails) {
      // Extract file paths from document URLs
      if (doctorDetails.dmc_mci_certificate) {
        const dmcPath = extractFilePathFromUrl(
          doctorDetails.dmc_mci_certificate
        );
        if (dmcPath) filesToDelete.push(dmcPath);
      }
      if (doctorDetails.aadhaar_pan_license) {
        const aadhaarPath = extractFilePathFromUrl(
          doctorDetails.aadhaar_pan_license
        );
        if (aadhaarPath) filesToDelete.push(aadhaarPath);
      }
      if (doctorDetails.address_proof) {
        const addressPath = extractFilePathFromUrl(doctorDetails.address_proof);
        if (addressPath) filesToDelete.push(addressPath);
      }
      if (doctorDetails.passport_photo) {
        const passportPath = extractFilePathFromUrl(
          doctorDetails.passport_photo
        );
        if (passportPath) filesToDelete.push(passportPath);
      }
    }

    // Delete files from storage if any exist
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("doctor-documents")
        .remove(filesToDelete);

      if (storageError) {
        console.error("Error deleting files from storage:", storageError);
        // Continue with database deletion even if file deletion fails
      }
    }

    const { error: detailsError } = await supabase
      .from("doctor_details")
      .delete()
      .eq("id", id);

    if (detailsError) throw detailsError;

    // Then delete user
    const { error: usersError } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("role", "doctor");

    if (usersError) throw usersError;

    return NextResponse.json({
      success: true,
      message: "Doctor and associated files deleted successfully",
      deletedFiles: filesToDelete.length,
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to extract file path from Supabase storage URL
function extractFilePathFromUrl(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    const bucketIndex = pathParts.indexOf("public") + 1;
    if (bucketIndex > 0 && bucketIndex < pathParts.length) {
      // Join all parts after 'public' to get the full path
      return pathParts.slice(bucketIndex).join("/");
    }

    const directMatch = url.match(/doctor-documents\/(.+)$/);
    if (directMatch) return directMatch[1];

    return null;
  } catch (error) {
    console.error("Error extracting file path from URL:", error);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data: doctor, error } = await supabase
      .from("users")
      .select(
        `
        *,
        doctor_details (*)
      `
      )
      .eq("id", id)
      .eq("role", "doctor")
      .single();

    if (error) throw error;

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
