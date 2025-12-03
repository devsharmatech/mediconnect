import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

/* ---------------------------------------
   ALWAYS GET INDIA TIME ON LIVE SERVER
------------------------------------------*/
function getISTDate() {
  const nowIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return nowIST;
}

function getTodaySlugIST() {
  const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  return days[getISTDate().getDay()];
}

function getISTTimeHHMM() {
  return getISTDate().toTimeString().slice(0, 5); // "HH:MM"
}

/* Convert time string to minutes for safe comparison */
function toMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function GET(req) {
  try {
    const today = getTodaySlugIST();      // IST day
    const currentTime = getISTTimeHHMM(); // IST time

    // ---------------------------------------
    // 1) FETCH APPROVED DOCTORS
    // ---------------------------------------
    const { data: doctors, error: doctorErr } = await supabase
      .from("doctor_details")
      .select("*")
      .eq("onboarding_status", "approved");

    if (doctorErr) throw doctorErr;

    // ---------------------------------------
    // 2) FILTER DOCTORS BY AVAILABLE DAY & TIME
    // ---------------------------------------
    const availableDoctors = (doctors || []).filter((doc) => {
      if (!doc.available_days || !doc.available_time) return false;

      // DAY CHECK
      const isToday = Array.isArray(doc.available_days)
        ? doc.available_days.includes(today)
        : String(doc.available_days).includes(today);

      if (!isToday) return false;

      // TIME CHECK – support both JSON & plain string
      let start, end;

      if (typeof doc.available_time === "string") {
        try {
          const parsed = JSON.parse(doc.available_time);
          start = parsed.start;
          end = parsed.end;
        } catch {
          return false;
        }
      } else {
        ({ start, end } = doc.available_time);
      }

      if (!start || !end) return false;

      // Compare using minutes
      const nowMin = toMinutes(currentTime);
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);

      return nowMin >= startMin && nowMin <= endMin;
    });

    if (availableDoctors.length === 0) {
      return success("No available doctors right now.", [], 200, {
        headers: corsHeaders,
      });
    }

    // ---------------------------------------
    // 3) GET TODAY’S APPOINTMENTS (BLOCKED)
    // ---------------------------------------
    const blockedStatuses = ["booked", "approved", "completed", "freezed"];

    const todayIST = getISTDate();
    const yyyy = todayIST.getFullYear();
    const mm = String(todayIST.getMonth() + 1).padStart(2, "0");
    const dd = String(todayIST.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const { data: todaysAppointments, error: appErr } = await supabase
      .from("appointments")
      .select("doctor_id, appointment_date, appointment_time, status")
      .eq("appointment_date", todayStr)
      .in("status", blockedStatuses);

    if (appErr) throw appErr;

    // ---------------------------------------
    // 4) REMOVE DOCTORS WHO ARE BUSY RIGHT NOW
    // ---------------------------------------
    const instantDoctors = availableDoctors.filter((doc) => {
      const isBusy = (todaysAppointments || []).some((apt) => {
        if (apt.doctor_id !== doc.id) return false;

        const aptTime = apt.appointment_time?.slice(0, 5);
        return aptTime === currentTime; // IST time
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
