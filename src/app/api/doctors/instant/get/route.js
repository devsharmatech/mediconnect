import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

function getTodaySlug() {
  const d = new Date().getDay();
  return ["Sun","Mon","Tues","Wed","Thu","Fri","Sat"][d];
}

function nowHHMM() {
  return new Date().toTimeString().slice(0, 5);
}

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function GET(req) {
  try {
    const today = getTodaySlug();
    const currentTime = nowHHMM();

    // STEP 1: get only APPROVED doctors
    const { data: doctors, error: doctorErr } = await supabase
      .from("doctor_details")
      .select("*") // <-- FULL doctor info as you requested
      .eq("onboarding_status", "approved");

    if (doctorErr) throw doctorErr;
    // console.log("Total approved doctors:", doctors);
    // STEP 2: Filter based on availability (today + between time)
    const availableDoctors = (doctors || []).filter((doc) => {
      if (!doc.available_days || !doc.available_time) return false;

      const isToday =
        Array.isArray(doc.available_days)
          ? doc.available_days.includes(today)
          : String(doc.available_days).includes(today);

      if (!isToday) return false;

      const { start, end } = doc.available_time;
      if (!start || !end) return false;

      return currentTime >= start && currentTime <= end;
    });

    if (availableDoctors.length === 0) {
      return success("No available doctors right now.", [], 200, {
        headers: corsHeaders,
      });
    }
    
    // STEP 3: check for blocked appointment statuses
    const blockedStatuses = [
      "booked",
      "approved",
      "completed",
      "freezed",
    ];

    // get today's appointments
    const { data: todaysAppointments, error: appErr } = await supabase
      .from("appointments")
      .select("doctor_id, appointment_date, appointment_time, status")
      .in("status", blockedStatuses);

    if (appErr) throw appErr;

    const todayDate = new Date();

    // STEP 4: exclude doctors who have ANY appointment at current time
    const instantDoctors = availableDoctors.filter((doc) => {
      const isBusy = (todaysAppointments || []).some((apt) => {
        if (apt.doctor_id !== doc.id) return false;

        const aptDate = new Date(apt.appointment_date);
        const sameDay =
          aptDate.getFullYear() === todayDate.getFullYear() &&
          aptDate.getMonth() === todayDate.getMonth() &&
          aptDate.getDate() === todayDate.getDate();

        if (!sameDay) return false;

        const aptTime = apt.appointment_time?.slice(0, 5);
        return aptTime === currentTime;
      });

      return !isBusy;
    });

    return success("Instant available doctors", instantDoctors, 200, {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Instant doctor error:", err);
    return failure("Failed to fetch instant doctors", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
