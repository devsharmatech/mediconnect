import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { chemist_id, medicine_id, batch_no, expiry_date, stock_qty, purchase_price, selling_price } =
      await req.json();

    if (!chemist_id || !medicine_id || !batch_no || !expiry_date || !stock_qty)
      return failure("Required fields missing", null, 400, { headers: corsHeaders });

    // Insert batch
    const { data: batch, error: batchErr } = await supabase
      .from("chemist_inventory_batches")
      .insert([{ chemist_id, medicine_id, batch_no, expiry_date, stock_qty, purchase_price, selling_price }])
      .select()
      .single();

    if (batchErr) throw batchErr;

    // Update inventory total stock
    await supabase.rpc("update_inventory_total_stock", {
      p_medicine_id: medicine_id,
      p_chemist_id: chemist_id,
    });

    return success("Stock added", batch, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Stock add failed", err.message, 500, { headers: corsHeaders });
  }
}
