import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const eventId = searchParams.get('eventId') || '1';

    // Fetch all wishlists with guest and product details
    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        guests (
          name,
          email,
          checked_in_at
        ),
        products (
          name,
          brand,
          price,
          size,
          condition
        ),
        looks (
          name,
          look_number
        )
      `)
      .order('position', { ascending: true })
      .order('added_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Group by product to show queue
    const productQueues: { [key: string]: any[] } = {};
    
    wishlists?.forEach(wish => {
      const productKey = wish.product_id || wish.look_id;
      if (!productQueues[productKey]) {
        productQueues[productKey] = [];
      }
      productQueues[productKey].push(wish);
    });

    // Format data for export
    const exportData = wishlists?.map(wish => ({
      'Guest Name': wish.guests?.name || 'Unknown',
      'Guest Email': wish.guests?.email || 'Unknown',
      'Product/Look': wish.products?.name || wish.looks?.name || 'Unknown',
      'Brand': wish.products?.brand || 'N/A',
      'Price': wish.products?.price ? `$${wish.products.price}` : 'N/A',
      'Size': wish.products?.size || 'N/A',
      'Condition': wish.products?.condition || 'N/A',
      'Queue Position': wish.position,
      'Wish Type': wish.wish_type === 'full_look' ? 'Full Look' : 'Individual Item',
      'Added At': new Date(wish.added_at).toLocaleString(),
      'Guest Checked In': wish.guests?.checked_in_at ? 'Yes' : 'No'
    })) || [];

    if (format === 'csv') {
      // Generate CSV
      const fields = [
        'Guest Name',
        'Guest Email',
        'Product/Look',
        'Brand',
        'Price',
        'Size',
        'Condition',
        'Queue Position',
        'Wish Type',
        'Added At',
        'Guest Checked In'
      ];
      
      const csv = parse(exportData, { fields });
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="second-story-wishlists-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'excel') {
      // Generate Excel with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Main wishlist sheet
      const wishlistSheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, wishlistSheet, 'Wishlists');
      
      // Product queue sheet
      const queueData: any[] = [];
      Object.entries(productQueues).forEach(([productId, wishes]) => {
        const firstWish = wishes[0];
        const productName = firstWish.products?.name || firstWish.looks?.name || 'Unknown';
        const brand = firstWish.products?.brand || 'N/A';
        const price = firstWish.products?.price || 0;
        
        wishes.forEach((wish, index) => {
          queueData.push({
            'Product': productName,
            'Brand': brand,
            'Price': `$${price}`,
            'Position': index + 1,
            'Guest': wish.guests?.name || 'Unknown',
            'Email': wish.guests?.email || 'Unknown',
            'Status': index === 0 ? 'First in line' : `Position ${index + 1}`
          });
        });
      });
      
      const queueSheet = XLSX.utils.json_to_sheet(queueData);
      XLSX.utils.book_append_sheet(workbook, queueSheet, 'Product Queues');
      
      // Summary statistics sheet
      const summaryData = [
        { Metric: 'Total Wishlist Items', Value: wishlists?.length || 0 },
        { Metric: 'Unique Products Wished', Value: Object.keys(productQueues).length },
        { Metric: 'Average Queue Length', Value: (wishlists?.length / Object.keys(productQueues).length || 0).toFixed(2) },
        { Metric: 'Most Wished Item', Value: Object.entries(productQueues).sort((a, b) => b[1].length - a[1].length)[0]?.[1][0]?.products?.name || 'N/A' },
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="second-story-wishlists-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}