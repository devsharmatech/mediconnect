import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

function getTodayName() {
  return new Date().toLocaleString("en-US", { weekday: "long" });
}

function nowHHMM() {
  return new Date().toTimeString().slice(0, 5);
}

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST() {
  try {
    const today = getTodayName();      // "Monday"
    const currentTime = nowHHMM();     // "14:32"

    // STEP 1: fetch only approved doctors
    const { data: doctors, error } = await supabase
      .from("doctor_details")
      .select("*")
      .eq("onboarding_status", "approved");

    if (error) throw error;

    const available = doctors.filter((doc) => {
      const slots = doc.clinic_slots || {};
      const todaySlot = slots[today];

      if (!todaySlot) return false;

      const start = todaySlot.start;
      const end = todaySlot.end;

      if (!start || !end || start === "" || end === "") return false;

      return currentTime >= start && currentTime <= end;
    });

    return success("Clinic available doctors", available, 200, {
      headers: corsHeaders,
    });

  } catch (err) {
    console.error("Clinic doctor error:", err);
    return failure("Failed to fetch clinic available doctors", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
