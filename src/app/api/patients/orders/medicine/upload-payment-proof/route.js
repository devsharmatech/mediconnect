import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const order_id = formData.get("order_id");
    const file = formData.get("payment_proof");

    if (!order_id || !file) {
      return failure("order_id and payment_proof required", null, 400, {
        headers: corsHeaders,
      });
    }

    /* --------------------------------------------------
       1️⃣ FETCH ORDER (PAYMENT REQUEST SOURCE)
    -------------------------------------------------- */
    const { data: order, error: orderErr } = await supabase
      .from("medicine_orders")
      .select("id, patient_id, chemist_id, status, total_amount")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return failure("Order not found", null, 404, { headers: corsHeaders });
    }

    if (order.status !== "payment_pending") {
      return failure(
        "Payment upload allowed only after payment request",
        null,
        409,
        { headers: corsHeaders }
      );
    }

    /* --------------------------------------------------
       2️⃣ UPLOAD PAYMENT PROOF
    -------------------------------------------------- */
    const path = `payments/${order_id}/${Date.now()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from("payment_proofs")
      .upload(path, file, { upsert: true });

    if (uploadErr) throw uploadErr;

    const { data: signed } = await supabase.storage
      .from("payment_proofs")
      .createSignedUrl(path, 60 * 60 * 24);

    /* --------------------------------------------------
       3️⃣ SAVE PAYMENT (CHEMIST AUTO-RESOLVED)
    -------------------------------------------------- */
    await supabase.from("medicine_order_payments").insert({
      order_id: order.id,
      patient_id: order.patient_id,
      amount: order.total_amount,
      payment_method: "upi",
      payment_proof_url: signed.signedUrl,
      status: "submitted",
    });

    /* --------------------------------------------------
       4️⃣ UPDATE ORDER STATUS
    -------------------------------------------------- */
    await supabase
      .from("medicine_orders")
      .update({
        status: "payment_submitted",
        updated_at: new Date(),
      })
      .eq("id", order.id);

    return success(
      "Payment proof uploaded successfully",
      {
        order_id: order.id,
        chemist_id: order.chemist_id, // ✅ comes from payment request
        amount: order.total_amount,
      },
      200,
      { headers: corsHeaders }
    );

  } catch (err) {
    return failure("Failed to upload payment proof", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
