import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";
import admin from "@/lib/firebaseAdmin";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { doctor_id, patient_id } = await req.json();

    if (!doctor_id || !patient_id) {
      return failure("doctor_id & patient_id required", null, 400, {
        headers: corsHeaders,
      });
    }

    // Generate IST time
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const dateStr = nowIST.toISOString().split("T")[0];
    const timeStr = nowIST.toTimeString().slice(0, 5);

    // ------------------------------------------
    // 1) Create instant appointment
    // ------------------------------------------
    const { data: appointment, error: aptErr } = await supabase
      .from("appointments")
      .insert({
        doctor_id,
        patient_id,
        appointment_date: dateStr,
        appointment_time: timeStr,
        status: "booked",
      })
      .select()
      .single();

    if (aptErr) throw aptErr;

    const callRoomId = appointment.id; // call room = appointment ID

    // ------------------------------------------
    // 2) Notify doctor via DB
    // ------------------------------------------
    await supabase.from("notifications").insert({
      user_id: doctor_id,
      title: "Incoming Instant Consultation",
      message: "A patient is requesting a video consultation.",
      type: "instant_call",
      metadata: {
        appointment_id: appointment.id,
        patient_id,
        call_room_id: callRoomId,
      },
    });

    // ------------------------------------------
    // 3) Send FCM to doctor
    // ------------------------------------------
    const { data: doctorUser } = await supabase
      .from("users")
      .select("fcm_token")
      .eq("id", doctor_id)
      .single();

    if (doctorUser?.fcm_token) {
      await admin.messaging().send({
        token: doctorUser.fcm_token,
        notification: {
          title: "Incoming Instant Consultation",
          body: "A patient is requesting for a video consultation.",
        },
        data: {
          type: "instant_call",
          appointment_id: appointment.id,
          patient_id,
          call_room_id: callRoomId,
        },
      });
    }

    return success(
      "Instant call initiated",
      {
        appointment,
        call_room_id: callRoomId,
      },
      200,
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Instant-call error:", err);
    return failure("Failed to start instant call", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
