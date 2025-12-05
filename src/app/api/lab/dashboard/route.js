import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { lab_id, start_date, end_date } = await req.json();

    if (!lab_id) {
      return failure("lab_id required", null, 400, { headers: corsHeaders });
    }

    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = end_date ? new Date(end_date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Lab Info
    const { data: labData } = await supabase
      .from("lab_details")
      .select("*")
      .eq("id", lab_id)
      .single();

    // Order Stats
    const orderStatsQuery = supabase
      .from("lab_test_orders")
      .select("status", { count: "exact" })
      .eq("lab_id", lab_id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const { data: orderStats } = await orderStatsQuery;

    const totalOrders = orderStats?.reduce((sum, o) => sum + (o.count || 0), 0);

    const pendingOrders =
      orderStats?.find((o) => o.status === "pending")?.count || 0;

    const completedOrders =
      orderStats?.find((o) => o.status === "completed")?.count || 0;

    // Recent Orders
    const { data: recentOrders } = await supabase
      .from("lab_test_orders")
      .select(
        `
        *,
        patient_details:patient_id(id, full_name),
        lab_test_order_items(count)
      `
      )
      .eq("lab_id", lab_id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Revenue (last 30 days)
    const revenueStart = new Date();
    revenueStart.setDate(revenueStart.getDate() - 30);

    const { data: revenueData } = await supabase
      .from("lab_test_orders")
      .select("total_amount, created_at")
      .eq("lab_id", lab_id)
      .eq("status", "completed")
      .gte("created_at", revenueStart.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    const dailyRevenue = {};
    revenueData?.forEach((o) => {
      const date = new Date(o.created_at).toISOString().split("T")[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (o.total_amount || 0);
    });

    const dashboardData = {
      lab: labData,
      stats: {
        total_orders: totalOrders || 0,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        revenue_30_days: Object.values(dailyRevenue).reduce((a, b) => a + b, 0),
        avg_order_value:
          totalOrders > 0
            ? revenueData?.reduce((s, o) => s + (o.total_amount || 0), 0) /
              totalOrders
            : 0,
      },
      order_stats: orderStats,
      recent_orders: recentOrders,
      daily_revenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount,
      })),
    };

    return success("Dashboard data fetched", dashboardData, 200, {
      headers: corsHeaders,
    });
  } catch (err) {
    return failure(
      "Failed fetching dashboard data",
      err.message,
      500,
      { headers: corsHeaders }
    );
  }
}
