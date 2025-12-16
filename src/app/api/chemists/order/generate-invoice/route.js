import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { order_id, chemist_id } = await req.json();

    if (!order_id || !chemist_id) {
      return failure("order_id and chemist_id required", null, 400, {
        headers: corsHeaders,
      });
    }

    /* ---------------------------------------
       1️⃣ FETCH ORDER + VALIDATE
    --------------------------------------- */
    const { data: order, error } = await supabase
      .from("medicine_orders")
      .select(`
        id, unid, status, total_amount, patient_id,
        chemist:chemist_id(
          pharmacy_name, gst_number, address, phone
        ),
        patient:patient_id(
          phone_number,
          patient_details(full_name, address)
        ),
        medicine_order_items(
          medicine_name, quantity, price
        )
      `)
      .eq("id", order_id)
      .eq("chemist_id", chemist_id)
      .single();

    if (error || !order) {
      return failure("Order not found", null, 404, {
        headers: corsHeaders,
      });
    }

    if (order.status !== "completed") {
      return failure(
        "Invoice can be generated only after payment verification",
        null,
        409,
        { headers: corsHeaders }
      );
    }

    /* ---------------------------------------
       2️⃣ CHECK EXISTING INVOICE
    --------------------------------------- */
    const { data: existing } = await supabase
      .from("medicine_order_invoices")
      .select("id, invoice_number")
      .eq("order_id", order_id)
      .maybeSingle();

    if (existing) {
      return success("Invoice already exists", existing, 200, {
        headers: corsHeaders,
      });
    }

    /* ---------------------------------------
       3️⃣ BUILD INVOICE DATA JSON
    --------------------------------------- */
    const items = order.medicine_order_items.map(i => ({
      name: i.medicine_name,
      quantity: i.quantity,
      unit_price: i.price,
      total: Number(i.price || 0) * Number(i.quantity || 1)
    }));

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const taxAmount = 0;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const invoiceNumber = `INV-${chemist_id.slice(0, 4)}-${dateStr}-${order.unid}`;

    const invoiceData = {
      invoice_number: invoiceNumber,
      invoice_date: today.toISOString().slice(0, 10),

      chemist: {
        name: order.chemist.pharmacy_name,
        gst_number: order.chemist.gst_number,
        address: order.chemist.address,
        phone: order.chemist.phone
      },

      patient: {
        name: order.patient.patient_details?.[0]?.full_name || "",
        phone: order.patient.phone_number,
        address: order.patient.patient_details?.[0]?.address || ""
      },

      items,
      subtotal,
      tax: taxAmount,
      grand_total: subtotal + taxAmount,
      payment_mode: "UPI",
      order_id
    };

    /* ---------------------------------------
       4️⃣ SAVE INVOICE
    --------------------------------------- */
    const { data: invoice, error: invErr } = await supabase
      .from("medicine_order_invoices")
      .insert({
        order_id,
        chemist_id,
        patient_id: order.patient_id,
        invoice_number: invoiceNumber,
        subtotal,
        tax_amount: taxAmount,
        total_amount: subtotal + taxAmount,
        invoice_data: invoiceData
      })
      .select()
      .single();

    if (invErr) throw invErr;

    return success("E-invoice generated successfully", invoice, 200, {
      headers: corsHeaders,
    });

  } catch (err) {
    console.error("Invoice generation error:", err);
    return failure("Failed to generate invoice", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
