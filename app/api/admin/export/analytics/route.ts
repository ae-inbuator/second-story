import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const eventId = searchParams.get('eventId') || '1';

    // Fetch analytics data
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select(`
        *,
        guests (
          name,
          email
        ),
        products (
          name,
          brand,
          price
        ),
        looks (
          name,
          look_number
        )
      `)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Calculate metrics
    const guestActions: { [key: string]: any } = {};
    const productViews: { [key: string]: number } = {};
    const lookViews: { [key: string]: number } = {};
    
    analytics?.forEach(event => {
      // Track guest actions
      const guestId = event.guest_id;
      if (!guestActions[guestId]) {
        guestActions[guestId] = {
          views: 0,
          wishes: 0,
          removes: 0,
          guest: event.guests
        };
      }
      
      if (event.action === 'view') guestActions[guestId].views++;
      if (event.action === 'wish_add') guestActions[guestId].wishes++;
      if (event.action === 'wish_remove') guestActions[guestId].removes++;
      
      // Track product/look views
      if (event.product_id && event.action === 'view') {
        productViews[event.product_id] = (productViews[event.product_id] || 0) + 1;
      }
      if (event.look_id && event.action === 'view') {
        lookViews[event.look_id] = (lookViews[event.look_id] || 0) + 1;
      }
    });

    // Format data for export
    const exportData = analytics?.map(event => ({
      'Timestamp': new Date(event.timestamp).toLocaleString(),
      'Guest': event.guests?.name || 'Unknown',
      'Email': event.guests?.email || 'Unknown',
      'Action': event.action,
      'Product/Look': event.products?.name || event.looks?.name || 'N/A',
      'Brand': event.products?.brand || 'N/A',
      'Price': event.products?.price ? `$${event.products.price}` : 'N/A',
    })) || [];

    if (format === 'csv') {
      // Generate CSV
      const fields = [
        'Timestamp',
        'Guest',
        'Email',
        'Action',
        'Product/Look',
        'Brand',
        'Price'
      ];
      
      const csv = parse(exportData, { fields });
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="second-story-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'excel') {
      // Generate Excel with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Raw analytics sheet
      const analyticsSheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Analytics');
      
      // Guest behavior sheet
      const guestBehaviorData = Object.entries(guestActions).map(([guestId, data]) => ({
        'Guest': data.guest?.name || 'Unknown',
        'Email': data.guest?.email || 'Unknown',
        'Total Views': data.views,
        'Items Wished': data.wishes,
        'Items Removed': data.removes,
        'Engagement Rate': ((data.wishes / (data.views || 1)) * 100).toFixed(2) + '%'
      }));
      
      const guestSheet = XLSX.utils.json_to_sheet(guestBehaviorData);
      XLSX.utils.book_append_sheet(workbook, guestSheet, 'Guest Behavior');
      
      // Product performance sheet
      const productData: any[] = [];
      analytics?.forEach(event => {
        if (event.products && !productData.find(p => p['Product'] === event.products.name)) {
          const views = analytics.filter(a => a.product_id === event.product_id && a.action === 'view').length;
          const wishes = analytics.filter(a => a.product_id === event.product_id && a.action === 'wish_add').length;
          
          productData.push({
            'Product': event.products.name,
            'Brand': event.products.brand,
            'Price': `$${event.products.price}`,
            'Views': views,
            'Wishes': wishes,
            'Conversion Rate': ((wishes / (views || 1)) * 100).toFixed(2) + '%'
          });
        }
      });
      
      const productSheet = XLSX.utils.json_to_sheet(productData);
      XLSX.utils.book_append_sheet(workbook, productSheet, 'Product Performance');
      
      // Summary metrics sheet
      const totalViews = analytics?.filter(a => a.action === 'view').length || 0;
      const totalWishes = analytics?.filter(a => a.action === 'wish_add').length || 0;
      const totalRemoves = analytics?.filter(a => a.action === 'wish_remove').length || 0;
      const uniqueGuests = new Set(analytics?.map(a => a.guest_id)).size;
      
      const summaryData = [
        { Metric: 'Total Events', Value: analytics?.length || 0 },
        { Metric: 'Unique Guests', Value: uniqueGuests },
        { Metric: 'Total Views', Value: totalViews },
        { Metric: 'Total Wishes', Value: totalWishes },
        { Metric: 'Total Removes', Value: totalRemoves },
        { Metric: 'Overall Conversion Rate', Value: ((totalWishes / (totalViews || 1)) * 100).toFixed(2) + '%' },
        { Metric: 'Average Actions per Guest', Value: ((analytics?.length || 0) / (uniqueGuests || 1)).toFixed(2) }
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="second-story-analytics-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}