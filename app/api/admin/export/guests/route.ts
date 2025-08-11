import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const eventId = searchParams.get('eventId') || '1';

    // Fetch all guests with their wishlist data
    const { data: guests, error } = await supabase
      .from('guests')
      .select(`
        *,
        wishlists (
          id,
          position,
          wish_type,
          products (
            name,
            brand,
            price
          ),
          looks (
            name,
            look_number
          )
        )
      `)
      .order('registered_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Format data for export
    const exportData = guests?.map(guest => {
      const wishlistItems = guest.wishlists?.map((wish: any) => 
        `${wish.products?.brand || wish.looks?.name || 'Unknown'} - Position ${wish.position}`
      ).join('; ') || 'No items';

      const totalWishes = guest.wishlists?.length || 0;
      const topPosition = guest.wishlists?.length > 0 
        ? Math.min(...guest.wishlists.map((w: any) => w.position))
        : null;

      return {
        'Guest Name': guest.name,
        'Email': guest.email,
        'Registration Date': guest.registered_at ? new Date(guest.registered_at).toLocaleDateString() : 'N/A',
        'Check-in Time': guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleTimeString() : 'Not checked in',
        'Total Wishes': totalWishes,
        'Best Queue Position': topPosition || 'N/A',
        'Wishlist Items': wishlistItems,
        'Device ID': guest.device_id || 'N/A'
      };
    }) || [];

    if (format === 'csv') {
      // Generate CSV
      const fields = [
        'Guest Name',
        'Email',
        'Registration Date',
        'Check-in Time',
        'Total Wishes',
        'Best Queue Position',
        'Wishlist Items',
        'Device ID'
      ];
      
      const csv = parse(exportData, { fields });
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="second-story-guests-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'excel') {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
      
      // Add summary sheet
      const summaryData = [
        { Metric: 'Total Registered', Value: guests?.length || 0 },
        { Metric: 'Checked In', Value: guests?.filter(g => g.checked_in_at).length || 0 },
        { Metric: 'Total Wishes', Value: guests?.reduce((sum, g) => sum + (g.wishlists?.length || 0), 0) || 0 },
        { Metric: 'Average Wishes per Guest', Value: (guests?.reduce((sum, g) => sum + (g.wishlists?.length || 0), 0) / (guests?.length || 1)).toFixed(2) },
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="second-story-guests-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}