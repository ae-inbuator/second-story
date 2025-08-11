/**
 * Script to check the current data in the database
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bnnabuwcojrctjhnwcmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ5NjUsImV4cCI6MjA3MDQ3MDk2NX0.3tXkx5K1HLgl5sUif1_cUuXay7t-UwtU9_Z-NN4N8EA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Checking current database state...\n');

  try {
    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, brand, price, images')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    console.log(`📦 Products (${products.length} found):`);
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.brand} - ${product.name} ($${product.price})`);
      console.log(`     Images: ${product.images ? product.images.length : 0} image(s)`);
      if (product.images && product.images.length > 0) {
        console.log(`     First image: ${product.images[0]}`);
      }
    });

    // Check looks
    const { data: looks, error: looksError } = await supabase
      .from('looks')
      .select(`
        id,
        look_number,
        name,
        active,
        hero_image,
        look_products(
          display_order,
          products(name, brand)
        )
      `)
      .order('look_number');

    if (looksError) throw looksError;

    console.log(`\n✨ Looks (${looks.length} found):`);
    looks.forEach((look) => {
      console.log(`  Look ${look.look_number}: ${look.name} ${look.active ? '(ACTIVE)' : ''}`);
      console.log(`     Hero image: ${look.hero_image ? 'Yes' : 'No'}`);
      console.log(`     Products: ${look.look_products.length}`);
      look.look_products
        .sort((a, b) => a.display_order - b.display_order)
        .forEach((lp, index) => {
          console.log(`       ${index + 1}. ${lp.products.brand} - ${lp.products.name}`);
        });
    });

    // Check events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*');

    if (eventsError) throw eventsError;

    console.log(`\n📅 Events (${events.length} found):`);
    events.forEach((event) => {
      console.log(`  ${event.name} - Chapter ${event.chapter_number} (${event.status})`);
    });

    console.log('\n✅ Data check complete!');

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
}

checkData();