import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

// Update order status
export async function POST(req, { params }) {
  try {
    const action = params.action;
    const { order_id, lab_id, status, notes, items } = await req.json();

    if (!order_id || !lab_id) {
      return failure("order_id and lab_id required", null, 400, { headers: corsHeaders });
    }

    const validActions = ['update-status', 'update-items', 'complete'];
    
    if (!validActions.includes(action)) {
      return failure("Invalid action", null, 400, { headers: corsHeaders });
    }

    switch (action) {
      case 'update-status':
        if (!status) {
          return failure("status required", null, 400, { headers: corsHeaders });
        }

        const { data, error } = await supabase
          .from("lab_test_orders")
          .update({
            status,
            lab_notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", order_id)
          .eq("lab_id", lab_id)
          .select()
          .single();

        if (error) throw error;

        // Create notification for patient
        await supabase.from("notifications").insert({
          user_id: data.patient_id,
          title: "Lab Order Status Updated",
          message: `Your lab test order #${data.unid} is now ${status}`,
          type: "lab_order",
          metadata: { order_id, status }
        });

        return success("Order status updated", data, 200, { headers: corsHeaders });

      case 'update-items':
        if (!items || !Array.isArray(items)) {
          return failure("items array required", null, 400, { headers: corsHeaders });
        }

        // Update order items
        const updatePromises = items.map(item =>
          supabase
            .from("lab_test_order_items")
            .update({
              status: item.status,
              price: item.price
            })
            .eq("id", item.id)
            .eq("order_id", order_id)
        );

        await Promise.all(updatePromises);

        // Calculate total amount
        const { data: updatedItems } = await supabase
          .from("lab_test_order_items")
          .select("price")
          .eq("order_id", order_id)
          .eq("status", "approved");

        const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);

        // Update order total
        await supabase
          .from("lab_test_orders")
          .update({
            total_amount: totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq("id", order_id);

        return success("Order items updated", { totalAmount }, 200, { headers: corsHeaders });

      case 'complete':
        const { data: orderData, error: orderError } = await supabase
          .from("lab_test_orders")
          .update({
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", order_id)
          .eq("lab_id", lab_id)
          .select()
          .single();

        if (orderError) throw orderError;

        // Create lab report record
        const { error: reportError } = await supabase
          .from("lab_reports")
          .insert({
            lab_id: lab_id,
            patient_id: orderData.patient_id,
            test_type: "Blood Test", // You can make this dynamic
            result_summary: "Test completed successfully",
            report_url: null // Add your report upload logic here
          });

        if (reportError) throw reportError;

        return success("Order marked as completed", orderData, 200, { headers: corsHeaders });
    }
  } catch (err) {
    return failure("Failed to process action", err.message, 500, { headers: corsHeaders });
  }
}