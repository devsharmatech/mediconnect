import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id } = params;
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      phone_number,
      created_at,
      profile_picture,
      patient_details (
        full_name,
        email,
        gender,
        date_of_birth,
        blood_group,
        address,
        emergency_contact
      )
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_, { params }) {
  const { id } = params;
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: "Patient deleted" });
}
