import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { batch_id, batch_no, expiry_date, stock_qty, purchase_price, selling_price, reason } = body || {};

    if (!batch_id) {
      return failure("batch_id required", null, 400, { headers: corsHeaders });
    }

    // 1) fetch existing batch
    const { data: existingBatch, error: fetchErr } = await supabase
      .from("chemist_inventory_batches")
      .select("*")
      .eq("id", batch_id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existingBatch) {
      return failure("Batch not found", null, 404, { headers: corsHeaders });
    }

    const chemist_id = existingBatch.chemist_id;
    const medicine_id = existingBatch.medicine_id;
    const oldStock = Number(existingBatch.stock_qty || 0);
    const newStock = typeof stock_qty === "number" ? Number(stock_qty) : oldStock;
    const delta = newStock - oldStock;

    // 2) update the batch
    const updatePayload = {};
    if (batch_no !== undefined) updatePayload.batch_no = batch_no;
    if (expiry_date !== undefined) updatePayload.expiry_date = expiry_date;
    if (stock_qty !== undefined) updatePayload.stock_qty = newStock;
    if (purchase_price !== undefined) updatePayload.purchase_price = purchase_price;
    if (selling_price !== undefined) updatePayload.selling_price = selling_price;
    updatePayload.updated_at = new Date();

    const { data: updatedBatch, error: updateErr } = await supabase
      .from("chemist_inventory_batches")
      .update(updatePayload)
      .eq("id", batch_id)
      .select()
      .maybeSingle();

    if (updateErr) throw updateErr;

    // 3) recompute total stock for this medicine & chemist (sum of batches)
    const { data: allBatches, error: batchesErr } = await supabase
      .from("chemist_inventory_batches")
      .select("stock_qty")
      .eq("chemist_id", chemist_id)
      .eq("medicine_id", medicine_id);

    if (batchesErr) throw batchesErr;

    const totalStock = (allBatches || []).reduce((s, r) => s + Number(r.stock_qty || 0), 0);

    // 4) upsert chemist_inventory (update total_stock or insert)
    const { data: existingInventory, error: invFetchErr } = await supabase
      .from("chemist_inventory")
      .select("*")
      .eq("chemist_id", chemist_id)
      .eq("medicine_id", medicine_id)
      .maybeSingle();

    if (invFetchErr) throw invFetchErr;

    let inventoryRes = null;
    if (existingInventory) {
      const { data: invUpd, error: invUpdErr } = await supabase
        .from("chemist_inventory")
        .update({ total_stock: totalStock, updated_at: new Date() })
        .eq("id", existingInventory.id)
        .select()
        .maybeSingle();

      if (invUpdErr) throw invUpdErr;
      inventoryRes = invUpd;
    } else {
      const { data: invIns, error: invInsErr } = await supabase
        .from("chemist_inventory")
        .insert([{ chemist_id, medicine_id, total_stock: totalStock, updated_at: new Date() }])
        .select()
        .maybeSingle();

      if (invInsErr) throw invInsErr;
      inventoryRes = invIns;
    }

    // 5) Write a stock log entry if qty changed
    let logRes = null;
    if (delta !== 0) {
      const change_type = delta > 0 ? "stock_in" : "stock_out";
      const { data: logData, error: logErr } = await supabase
        .from("chemist_stock_logs")
        .insert([
          {
            chemist_id,
            medicine_id,
            batch_id,
            change_type,
            qty_changed: Math.abs(delta),
            reason: reason || (delta > 0 ? "stock adjustment (increase)" : "stock adjustment (decrease)"),
          },
        ])
        .select()
        .maybeSingle();

      if (logErr) throw logErr;
      logRes = logData;
    }

    // 6) return updated batch, inventory summary and log (if created)
    const result = { updatedBatch, inventory: inventoryRes, stockLog: logRes };

    return success("Batch updated and inventory recalculated", result, 200, { headers: corsHeaders });
  } catch (err) {
    console.error("update-stock error:", err);
    return failure("Error updating stock", err.message, 500, { headers: corsHeaders });
  }
}
