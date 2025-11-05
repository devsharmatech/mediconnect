import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function GET(req, { params }) {
  try {
     const { id } = await params; 

    if (!id) {
      return failure("Appointment ID is required.", null, 400, { headers: corsHeaders });
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id (
          id,
          phone_number,
          un_id,
          profile_picture,
          created_at,
          patient_details (
            full_name,
            email,
            gender,
            date_of_birth,
            blood_group,
            address,
            emergency_contact
          )
        ),
        doctor:doctor_id (
          id,
          phone_number,
          un_id,
          profile_picture,
          created_at,
          doctor_details (
            full_name,
            email,
            specialization,
            experience_years,
            license_number,
            clinic_name,
            clinic_address,
            available_days,
            available_time,
            consultation_fee,
            rating,
            total_reviews,
            qualification,
            latitude,
            longitude
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure("Appointment not found.", null, 404, { headers: corsHeaders });
      }
      throw error;
    }

    const transformedAppointment = {
      id: appointment.id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      disease_info: appointment.disease_info,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      
      patient: {
        id: appointment.patient?.id,
        un_id: appointment.patient?.un_id,
        phone_number: appointment.patient?.phone_number,
        profile_picture: appointment.patient?.profile_picture,
        created_at: appointment.patient?.created_at,
        full_name: appointment.patient?.patient_details?.full_name,
        email: appointment.patient?.patient_details?.email,
        gender: appointment.patient?.patient_details?.gender,
        date_of_birth: appointment.patient?.patient_details?.date_of_birth,
        blood_group: appointment.patient?.patient_details?.blood_group,
        address: appointment.patient?.patient_details?.address,
        emergency_contact: appointment.patient?.patient_details?.emergency_contact
      },
      
      doctor: {
        id: appointment.doctor?.id,
        un_id: appointment.doctor?.un_id,
        phone_number: appointment.doctor?.phone_number,
        profile_picture: appointment.doctor?.profile_picture,
        created_at: appointment.doctor?.created_at,
        full_name: appointment.doctor?.doctor_details?.full_name,
        email: appointment.doctor?.doctor_details?.email,
        specialization: appointment.doctor?.doctor_details?.specialization,
        experience_years: appointment.doctor?.doctor_details?.experience_years,
        license_number: appointment.doctor?.doctor_details?.license_number,
        clinic_name: appointment.doctor?.doctor_details?.clinic_name,
        clinic_address: appointment.doctor?.doctor_details?.clinic_address,
        available_days: appointment.doctor?.doctor_details?.available_days,
        available_time: appointment.doctor?.doctor_details?.available_time,
        consultation_fee: appointment.doctor?.doctor_details?.consultation_fee,
        rating: appointment.doctor?.doctor_details?.rating,
        total_reviews: appointment.doctor?.doctor_details?.total_reviews,
        qualification: appointment.doctor?.doctor_details?.qualification,
        latitude: appointment.doctor?.doctor_details?.latitude,
        longitude: appointment.doctor?.doctor_details?.longitude
      }
    };

    return success(
      "Appointment details fetched successfully.",
      {
        appointment: transformedAppointment
      },
      200,
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("Appointment details fetch error:", error);
    return failure("Failed to fetch appointment details.", error.message, 500, { headers: corsHeaders });
  }
}