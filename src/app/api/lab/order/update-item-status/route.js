import { supabase } from "@/lib/supabaseAdmin";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { item_id, status } = await req.json();

    if (!item_id || !status)
      return new Response(JSON.stringify({ status: false, message: "Missing fields" }), {
        headers: corsHeaders,
      });

    const { error } = await supabase
      .from("lab_test_order_items")
      .update({ status })
      .eq("id", item_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: true, message: "Item status updated" }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ status: false, message: err.message }), {
      headers: corsHeaders,
    });
  }
}
