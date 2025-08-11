import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // First, delete all relationships in look_products
    const { data: deletedRelations, error: relationError } = await supabase
      .from('look_products')
      .delete()
      .eq('product_id', productId)
      .select()

    if (relationError) {
      console.error('Failed to delete product from looks:', relationError)
      // Continue anyway - the product might not be in any looks
    }

    const affectedLooks = deletedRelations ? deletedRelations.length : 0

    // Now delete the product itself
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (productError) {
      console.error('Failed to delete product:', productError)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Product deleted successfully',
        affectedLooks: affectedLooks,
        details: affectedLooks > 0 
          ? `Product was removed from ${affectedLooks} look(s)` 
          : 'Product was not associated with any looks'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}