import { supabase } from "@/lib/supabaseAdmin";
import { corsHeaders } from "@/lib/cors";
import dayjs from "dayjs";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'week';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range based on filter
    let start, end;
    const today = dayjs();
    
    switch (dateRange) {
      case 'today':
        start = today.startOf('day');
        end = today.endOf('day');
        break;
      case 'week':
        start = today.subtract(7, 'day').startOf('day');
        end = today.endOf('day');
        break;
      case 'month':
        start = today.subtract(1, 'month').startOf('day');
        end = today.endOf('day');
        break;
      case 'quarter':
        start = today.subtract(3, 'month').startOf('day');
        end = today.endOf('day');
        break;
      case 'year':
        start = today.subtract(1, 'year').startOf('day');
        end = today.endOf('day');
        break;
      case 'custom':
        start = startDate ? dayjs(startDate) : today.subtract(7, 'day');
        end = endDate ? dayjs(endDate) : today;
        break;
      default:
        start = today.subtract(7, 'day');
        end = today;
    }

    // Fetch all counts in parallel
    const [
      { count: totalPatients },
      { count: totalDoctors },
      { count: totalAppointments },
      { count: totalLabs },
      { count: totalChemists },
      { count: totalPharmacists }
    ] = await Promise.all([
      supabase.from("patient_details").select("id", { count: "exact", head: true }),
      supabase.from("doctor_details").select("id", { count: "exact", head: true }),
      supabase.from("appointments").select("id", { count: "exact", head: true }),
      supabase.from("lab_details").select("id", { count: "exact", head: true }),
      supabase.from("chemist_details").select("id", { count: "exact", head: true }),
      supabase.from("pharmacist_details").select("id", { count: "exact", head: true })
    ]);

    // Calculate total revenue from completed appointments
    const { data: completedAppointments } = await supabase
      .from("appointments")
      .select("doctor_id, created_at")
      .eq("status", "completed")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    let totalRevenue = 0;
    if (completedAppointments?.length) {
      const doctorIds = [...new Set(completedAppointments.map(a => a.doctor_id))];
      const { data: doctors } = await supabase
        .from("doctor_details")
        .select("id, consultation_fee")
        .in("id", doctorIds);

      totalRevenue = completedAppointments.reduce((sum, a) => {
        const doc = doctors?.find(d => d.id === a.doctor_id);
        return sum + (doc?.consultation_fee || 0);
      }, 0);
    }

    // Appointment chart data (last 7 days)
    const appointmentChart = Array.from({ length: 7 }).map((_, i) => {
      const day = dayjs().subtract(6 - i, 'day');
      const dayName = day.format('ddd');
      const dailyAppointments = completedAppointments?.filter(a => 
        dayjs(a.created_at).isSame(day, 'day')
      ) || [];
      
      return {
        day: dayName,
        appointments: dailyAppointments.length,
        completed: dailyAppointments.length // Since we're filtering completed only
      };
    });

    // Monthly revenue data (last 6 months)
    const monthlyRevenue = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const month = dayjs().subtract(5 - i, 'month');
        const monthStart = month.startOf('month');
        const monthEnd = month.endOf('month');

        const { data: monthlyAppointments } = await supabase
          .from("appointments")
          .select("doctor_id")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());

        let monthlyRevenue = 0;
        if (monthlyAppointments?.length) {
          const doctorIds = [...new Set(monthlyAppointments.map(a => a.doctor_id))];
          const { data: doctors } = await supabase
            .from("doctor_details")
            .select("id, consultation_fee")
            .in("id", doctorIds);

          monthlyRevenue = monthlyAppointments.reduce((sum, a) => {
            const doc = doctors?.find(d => d.id === a.doctor_id);
            return sum + (doc?.consultation_fee || 0);
          }, 0);
        }

        // Calculate growth (simplified - you might want more sophisticated logic)
        const prevMonth = month.subtract(1, 'month');
        let prevMonthRevenue = 0;
        // In a real scenario, you'd fetch previous month's revenue here
        
        const growth = prevMonthRevenue > 0 
          ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
          : monthlyRevenue > 0 ? 100 : 0;

        return {
          month: month.format('MMM'),
          revenue: monthlyRevenue,
          growth: growth
        };
      })
    );

    // Age distribution
    const { data: patients } = await supabase
      .from("patient_details")
      .select("date_of_birth");

    const ageGroups = { "0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "65+": 0 };
    const currentYear = new Date().getFullYear();
    
    patients?.forEach((p) => {
      if (!p.date_of_birth) return;
      const birthYear = new Date(p.date_of_birth).getFullYear();
      const age = currentYear - birthYear;
      
      if (age <= 18) ageGroups["0-18"]++;
      else if (age <= 35) ageGroups["19-35"]++;
      else if (age <= 50) ageGroups["36-50"]++;
      else if (age <= 65) ageGroups["51-65"]++;
      else ageGroups["65+"]++;
    });

    const ageDistribution = Object.entries(ageGroups).map(([name, value]) => ({
      name,
      value,
      percentage: patients?.length ? Math.round((value / patients.length) * 100) : 0
    }));

    // Recent activity
    const { data: recentAppointments } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        created_at,
        doctor:doctor_id ( full_name ),
        patient:patient_id ( full_name )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentActivity = recentAppointments?.map((a) => ({
      id: a.id,
      action: `Appointment ${a.status} - Dr. ${a.doctor?.full_name || 'Unknown'} with ${a.patient?.full_name || 'Patient'}`,
      time: dayjs(a.created_at).fromNow(),
      type: "appointment",
      user: a.doctor?.full_name || "System",
      status: a.status
    })) || [];

    // Quick stats
    const { data: todayAppointments } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", dayjs().format('YYYY-MM-DD'));

    const { data: pendingPrescriptions } = await supabase
      .from("prescriptions")
      .select("id")
      .is("ai_analysis", null);

    const { data: labReports } = await supabase
      .from("lab_reports")
      .select("id")
      .gte("created_at", dayjs().startOf('day').toISOString());

    const result = {
      stats: {
        totalPatients: totalPatients || 0,
        totalDoctors: totalDoctors || 0,
        totalAppointments: totalAppointments || 0,
        totalLabs: totalLabs || 0,
        totalChemists: totalChemists || 0,
        totalPharmacists: totalPharmacists || 0,
        totalRevenue: totalRevenue || 0,
        todayAppointments: todayAppointments?.length || 0,
        pendingPrescriptions: pendingPrescriptions?.length || 0,
        todayLabReports: labReports?.length || 0
      },
      charts: {
        appointmentChart,
        monthlyRevenue,
        ageDistribution
      },
      activity: recentActivity,
      quickStats: {
        avgAppointmentDuration: "25 mins",
        patientSatisfaction: "92%",
        followUpRate: "76%",
        emergencyCases: "8",
        labTestsToday: labReports?.length || 0,
        prescriptionsToday: pendingPrescriptions?.length || 0
      }
    };

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to fetch dashboard data", 
        error: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}