import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

/* ---------------------------------------------------
   ALWAYS GET INDIA TIME ON LIVE SERVER
---------------------------------------------------*/
function getISTDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
}

function getTodayNameIST() {
  return getISTDate().toLocaleString("en-US", { weekday: "long" }); // Monday, Tuesday...
}

function getISTTimeHHMM() {
  return getISTDate().toTimeString().slice(0, 5); // "HH:MM"
}

/* Safely convert "HH:MM" into minutes */
function toMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST() {
  try {
    const today = getTodayNameIST();      // "Monday" (IST)
    const currentTime = getISTTimeHHMM(); // "14:32" (IST)

    // 1) Fetch approved doctors
    const { data: doctors, error } = await supabase
      .from("doctor_details")
      .select("*")
      .eq("onboarding_status", "approved");

    if (error) throw error;

    // 2) Filter doctors based on today's clinic slots
    const availableDoctors = doctors.filter((doc) => {
      if (!doc.clinic_slots) return false;

      let todaySlot = doc.clinic_slots[today];

      // If saved as string JSON → convert safely
      if (typeof todaySlot === "string") {
        try {
          todaySlot = JSON.parse(todaySlot);
        } catch {
          return false;
        }
      }

      if (!todaySlot) return false;

      const start = todaySlot.start;
      const end = todaySlot.end;

      if (!start || !end) return false;

      const nowMin = toMinutes(currentTime);
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);

      return nowMin >= startMin && nowMin <= endMin;
    });

    return success("Clinic available doctors", availableDoctors, 200, {
      headers: corsHeaders,
    });

  } catch (err) {
    console.error("Clinic doctor error:", err);
    return failure(
      "Failed to fetch clinic available doctors",
      err.message,
      500,
      { headers: corsHeaders }
    );
  }
}
