import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || status === undefined) {
      return NextResponse.json(
        { success: false, error: "Doctor ID and status are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .update({ 
        status: parseInt(status),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'doctor')
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}