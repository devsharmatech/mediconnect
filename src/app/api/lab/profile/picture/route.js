import { supabase } from "@/lib/supabaseAdmin";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const lab_id = formData.get("lab_id");
    const file = formData.get("file");

    if (!lab_id)
      return new Response(
        JSON.stringify({ status: false, message: "lab_id required" }),
        { headers: corsHeaders }
      );

    if (!file)
      return new Response(
        JSON.stringify({ status: false, message: "file required" }),
        { headers: corsHeaders }
      );

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const filePath = `lab_${lab_id}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, { upsert: true });

    if (uploadErr) throw uploadErr;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save URL in users table
    const { error } = await supabase
      .from("users")
      .update({ profile_picture: publicUrl })
      .eq("id", lab_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        status: true,
        message: "Profile picture updated",
        profile_picture: publicUrl,
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({ status: false, message: err.message }),
      { headers: corsHeaders }
    );
  }
}
