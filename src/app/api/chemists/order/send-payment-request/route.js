import { supabase } from "@/lib/supabaseAdmin";
import admin from "@/lib/firebaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const order_id = formData.get("order_id");
    const chemist_id = formData.get("chemist_id");

    const use_saved_qr = formData.get("use_saved_qr") === "true";
    const save_qr = formData.get("save_qr") === "true";

    const qr_file = formData.get("qr_image");
    const payment_qr_payload = formData.get("payment_qr_payload");
    const qr_label = formData.get("qr_label") || "UPI";
    const chemist_notes = formData.get("chemist_notes");

    if (!order_id || !chemist_id) {
      return failure("order_id and chemist_id required", null, 400, {
        headers: corsHeaders,
      });
    }

    /* --------------------------------------------------
       1️⃣ FETCH ORDER (VALIDATION)
    -------------------------------------------------- */
    const { data: order, error: orderErr } = await supabase
      .from("medicine_orders")
      .select("id, status, total_amount, patient_id")
      .eq("id", order_id)
      .eq("chemist_id", chemist_id)
      .single();

    if (orderErr || !order) {
      return failure("Order not found", null, 404, { headers: corsHeaders });
    }

    if (!order.total_amount || order.total_amount <= 0) {
      return failure("Order amount must be greater than 0", null, 422, {
        headers: corsHeaders,
      });
    }

    if (
      !["approved", "partially_approved", "payment_declined"].includes(
        order.status
      )
    ) {
      return failure(
        `Cannot send payment request in '${order.status}' state`,
        null,
        409,
        { headers: corsHeaders }
      );
    }

    /* --------------------------------------------------
       2️⃣ RESOLVE QR (SAVED OR UPLOADED)
    -------------------------------------------------- */
    let qr_url = null;
    let qr_payload = payment_qr_payload;

    if (use_saved_qr) {
      const { data: chemist } = await supabase
        .from("chemist_details")
        .select("payment_qr_url, payment_qr_payload")
        .eq("id", chemist_id)
        .single();

      if (!chemist?.payment_qr_payload) {
        return failure("No saved QR found", null, 400, {
          headers: corsHeaders,
        });
      }

      qr_url = chemist.payment_qr_url;
      qr_payload = chemist.payment_qr_payload;
    } else {
      if (!qr_file) {
        return failure("QR image is required", null, 400, {
          headers: corsHeaders,
        });
      }

      const ext = qr_file.name.split(".").pop();
      const path = `chemist/${chemist_id}_qr-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("qr_image")
        .upload(path, qr_file, {
          contentType: qr_file.type,
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: signed } = await supabase.storage
        .from("qr_image")
        .createSignedUrl(path, 60 * 60 * 24);

      qr_url = signed.signedUrl;
    }

    if (!qr_payload) {
      return failure("QR payload required", null, 400, {
        headers: corsHeaders,
      });
    }

    /* --------------------------------------------------
       3️⃣ UPDATE ORDER → PAYMENT PENDING
    -------------------------------------------------- */
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("medicine_orders")
      .update({
        payment_qr_url: qr_url,
        payment_qr_payload: qr_payload,
        payment_requested_at: new Date(),
        status: "payment_pending",
        chemist_notes,
        updated_at: new Date(),
      })
      .eq("id", order_id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    /* --------------------------------------------------
       4️⃣ SAVE QR FOR FUTURE (OPTIONAL)
    -------------------------------------------------- */
    if (save_qr && !use_saved_qr) {
      await supabase
        .from("chemist_details")
        .update({
          payment_qr_url: qr_url,
          payment_qr_payload: qr_payload,
          payment_qr_label: qr_label,
        })
        .eq("id", chemist_id);
    }

    /* --------------------------------------------------
       5️⃣ FETCH PATIENT FCM TOKEN
    -------------------------------------------------- */
    const { data: patient } = await supabase
      .from("users")
      .select("fcm_token")
      .eq("id", order.patient_id)
      .single();

    /* --------------------------------------------------
       6️⃣ SEND PUSH NOTIFICATION (PAYMENT REQUEST)
    -------------------------------------------------- */
    if (patient?.fcm_token) {
      await admin.messaging().send({
        token: patient.fcm_token,
        notification: {
          title: "Payment Request 💳",
          body: `Please complete payment of ₹${updatedOrder.total_amount} to proceed.`,
        },
        data: {
          type: "payment_request",
          order_id: updatedOrder.id,
          amount: String(updatedOrder.total_amount),
        },
      });
    }

    return success(
      "Payment request sent to patient successfully",
      {
        order_id: updatedOrder.id,
        status: updatedOrder.status,
        total_amount: updatedOrder.total_amount,
      },
      200,
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error("Send payment request error:", err);
    return failure(
      "Failed to send payment request",
      err.message,
      500,
      { headers: corsHeaders }
    );
  }
}
