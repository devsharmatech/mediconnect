import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const specialization = searchParams.get('specialization');

    const offset = (page - 1) * limit;

    // First get doctor users
    let userQuery = supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor');

    // Apply status filter to users
    if (status && status !== 'all') {
      userQuery = userQuery.eq('status', parseInt(status));
    }

    // Get users with pagination
    const { data: users, error: usersError, count } = await userQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // If no users found, return empty
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // Get doctor details for these users
    const userIds = users.map(user => user.id);
    const { data: doctorDetails, error: detailsError } = await supabase
      .from('doctor_details')
      .select('*')
      .in('id', userIds);

    if (detailsError) throw detailsError;

    // Combine user data with doctor details
    const doctors = users.map(user => {
      const details = doctorDetails?.find(detail => detail.id === user.id) || {};
      return {
        ...user,
        doctor_details: details
      };
    });

    // Apply search and specialization filters after combining data
    let filteredDoctors = doctors;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.phone_number?.toLowerCase().includes(searchLower) ||
        doctor.doctor_details?.full_name?.toLowerCase().includes(searchLower) ||
        doctor.doctor_details?.email?.toLowerCase().includes(searchLower) ||
        doctor.doctor_details?.specialization?.toLowerCase().includes(searchLower) ||
        doctor.doctor_details?.license_number?.toLowerCase().includes(searchLower) ||
        doctor.doctor_details?.clinic_name?.toLowerCase().includes(searchLower)
      );
    }

    if (specialization && specialization !== 'all') {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.doctor_details?.specialization === specialization
      );
    }

    // For accurate count, we need to query separately
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'doctor');

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', parseInt(status));
    }

    const { count: totalCount, error: countError } = await countQuery;
    if (countError) throw countError;

    const totalItems = totalCount || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: filteredDoctors,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}