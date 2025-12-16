import { supabase } from "@/lib/supabaseAdmin";
import admin from "@/lib/firebaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { order_id, chemist_id } = await req.json();

    if (!order_id || !chemist_id) {
      return failure("order_id & chemist_id required", null, 400, {
        headers: corsHeaders,
      });
    }

    /* --------------------------------------------------
       1️⃣ UPDATE ORDER STATUS → COMPLETED
    -------------------------------------------------- */
    const { data: order, error } = await supabase
      .from("medicine_orders")
      .update({
        status: "completed",
        updated_at: new Date(),
      })
      .eq("id", order_id)
      .eq("chemist_id", chemist_id)
      .select("id, patient_id, total_amount")
      .single();

    if (error || !order) {
      return failure("Order not found or not authorized", null, 404, {
        headers: corsHeaders,
      });
    }

    /* --------------------------------------------------
       2️⃣ FETCH PATIENT FCM TOKEN
    -------------------------------------------------- */
    const { data: patient } = await supabase
      .from("users")
      .select("fcm_token")
      .eq("id", order.patient_id)
      .single();

    /* --------------------------------------------------
       3️⃣ SEND FIREBASE PUSH TO PATIENT
    -------------------------------------------------- */
    if (patient?.fcm_token) {
      await admin.messaging().send({
        token: patient.fcm_token,
        notification: {
          title: "Payment Verified ✅",
          body: `Your payment of ₹${order.total_amount} has been verified successfully.`,
        },
        data: {
          type: "payment_verified",
          order_id: order.id,
          amount: String(order.total_amount),
        },
      });
    }

    return success(
      "Payment verified, order completed",
      {
        order_id: order.id,
        status: "completed",
      },
      200,
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error("Verify payment error:", err);
    return failure("Failed to verify payment", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
