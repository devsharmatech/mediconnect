import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(req, { params }) {
  try {
    const screening_id = params.id;

    const { data: screening } = await supabase
      .from("screening_sessions")
      .select("analysis, patient_id")
      .eq("id", screening_id)
      .single();

    if (!screening?.analysis) {
      return NextResponse.json({ error: "No analysis found" }, { status: 404 });
    }

    const specialties = screening.analysis.recommended_specialties || [];

    const { data: doctors } = await supabase
      .from("doctors")
      .select("id, name, specialty, rating, latitude, longitude, available_slots")
      .in("specialty", specialties);

    return NextResponse.json({
      screening_id,
      recommended_specialties: specialties,
      doctors: doctors || [],
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
