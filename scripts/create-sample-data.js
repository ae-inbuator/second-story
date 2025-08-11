/**
 * Script to create sample data for Second Story
 * Run with: node scripts/create-sample-data.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bnnabuwcojrctjhnwcmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ5NjUsImV4cCI6MjA3MDQ3MDk2NX0.3tXkx5K1HLgl5sUif1_cUuXay7t-UwtU9_Z-NN4N8EA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample products with luxury fashion items
const sampleProducts = [
  {
    name: 'Silk Midi Dress',
    brand: 'GABRIELA HEARST',
    price: 2850.00,
    size: 'M',
    condition: 'Excellent',
    description: 'Elegant silk dress with subtle draping. Perfect for evening events or sophisticated dinners.',
    measurements: {
      length: 125,
      width: 45,
      bust: 92
    },
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1200&fit=crop']
  },
  {
    name: 'Cashmere Blazer',
    brand: 'THE ROW',
    price: 3200.00,
    size: 'S',
    condition: 'Excellent',
    description: 'Timeless cashmere blazer with impeccable tailoring. A wardrobe staple for the modern professional.',
    measurements: {
      length: 68,
      width: 52,
      shoulders: 42
    },
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=1200&fit=crop']
  },
  {
    name: 'Leather Ankle Boots',
    brand: 'BOTTEGA VENETA',
    price: 1450.00,
    size: '38',
    condition: 'Very Good',
    description: 'Buttery soft leather boots with architectural heel. Worn only a few times.',
    measurements: {
      heel: 8,
      platform: 2
    },
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=1200&fit=crop']
  },
  {
    name: 'Structured Handbag',
    brand: 'CELINE',
    price: 2900.00,
    size: 'ONE SIZE',
    condition: 'Excellent',
    description: 'Iconic structured bag in pristine condition. Comes with dust bag and authenticity cards.',
    measurements: {
      length: 30,
      width: 15,
      height: 20,
      strapDrop: 12
    },
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1200&fit=crop']
  },
  {
    name: 'Wool Trench Coat',
    brand: 'MAX MARA',
    price: 1800.00,
    size: 'M',
    condition: 'Excellent',
    description: 'Classic double-breasted trench in camel wool. The perfect transitional piece.',
    measurements: {
      length: 115,
      shoulders: 44,
      chest: 106
    },
    images: ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&h=1200&fit=crop']
  },
  {
    name: 'Silk Scarf',
    brand: 'HERMÈS',
    price: 420.00,
    size: '90CM',
    condition: 'Excellent',
    description: 'Signature silk twill scarf with equestrian motif. Never worn, tags attached.',
    measurements: {
      length: 90,
      width: 90
    },
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=1200&fit=crop']
  },
  {
    name: 'Pearl Drop Earrings',
    brand: 'MIKIMOTO',
    price: 1200.00,
    size: 'ONE SIZE',
    condition: 'Excellent',
    description: 'Classic Akoya pearl earrings with 18k gold setting. Timeless elegance.',
    measurements: {
      length: 2.5,
      pearlSize: 8
    },
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1200&fit=crop']
  },
  {
    name: 'Wide-Leg Trousers',
    brand: 'KHAITE',
    price: 980.00,
    size: '28',
    condition: 'Excellent',
    description: 'High-waisted wool trousers with impeccable fit. Perfect for creating a sophisticated silhouette.',
    measurements: {
      waist: 72,
      inseam: 78,
      leg: 28
    },
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop']
  },
  {
    name: 'Knit Sweater',
    brand: 'BRUNELLO CUCINELLI',
    price: 1650.00,
    size: 'S',
    condition: 'Excellent',
    description: 'Luxurious cashmere sweater with subtle embellishments. Incredibly soft and warm.',
    measurements: {
      length: 58,
      chest: 96,
      sleeves: 62
    },
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1200&fit=crop']
  },
  {
    name: 'Pointed-Toe Pumps',
    brand: 'MANOLO BLAHNIK',
    price: 895.00,
    size: '37.5',
    condition: 'Very Good',
    description: 'Iconic pointed-toe pumps in nude patent leather. Some light wear on soles.',
    measurements: {
      heel: 10,
      platform: 1
    },
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=1200&fit=crop&rotation=180']
  }
];

// Sample looks
const sampleLooks = [
  {
    look_number: 1,
    name: 'Evening Elegance',
    hero_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop',
    active: false,
    products: [0, 3, 2, 6] // Silk dress, handbag, boots, pearls
  },
  {
    look_number: 2,
    name: 'Street Sophistication',
    hero_image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop',
    active: false,
    products: [1, 7, 9, 5] // Blazer, trousers, pumps, scarf
  },
  {
    look_number: 3,
    name: 'Boardroom Power',
    hero_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop',
    active: true, // This will be the active look
    products: [4, 1, 8, 3] // Trench, blazer, sweater, handbag
  }
];

async function createSampleData() {
  console.log('🚀 Creating sample data for Second Story...\n');

  try {
    // First, check if we have an event
    let { data: events, error: eventError } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    let eventId;
    if (eventError || !events || events.length === 0) {
      console.log('📅 Creating default event...');
      const { data: newEvent, error: createEventError } = await supabase
        .from('events')
        .insert({
          name: 'Chapter I',
          chapter_number: 1,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming'
        })
        .select()
        .single();

      if (createEventError) throw createEventError;
      eventId = newEvent.id;
      console.log('✅ Event created with ID:', eventId);
    } else {
      eventId = events[0].id;
      console.log('✅ Using existing event with ID:', eventId);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing sample data...');
    await supabase.from('look_products').delete().gte('look_id', '');
    await supabase.from('looks').delete().gte('look_number', 1);
    await supabase.from('products').delete().gte('price', 0);
    console.log('✅ Existing data cleared');

    // Insert products
    console.log('\n📦 Creating products...');
    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (productsError) throw productsError;
    console.log(`✅ Created ${insertedProducts.length} products`);

    // Insert looks
    console.log('\n✨ Creating looks...');
    for (const [index, lookData] of sampleLooks.entries()) {
      const { products: productIndices, ...lookInfo } = lookData;
      
      // Insert look
      const { data: insertedLook, error: lookError } = await supabase
        .from('looks')
        .insert({
          ...lookInfo,
          event_id: eventId
        })
        .select()
        .single();

      if (lookError) throw lookError;

      // Insert look-product relationships
      const lookProducts = productIndices.map((productIndex, order) => ({
        look_id: insertedLook.id,
        product_id: insertedProducts[productIndex].id,
        display_order: order + 1
      }));

      const { error: relationError } = await supabase
        .from('look_products')
        .insert(lookProducts);

      if (relationError) throw relationError;

      console.log(`✅ Created look "${lookInfo.name}" with ${productIndices.length} products`);
    }

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`• ${insertedProducts.length} luxury products`);
    console.log(`• ${sampleLooks.length} curated looks`);
    console.log(`• 1 active look ready for show`);
    console.log('\n🔗 Next steps:');
    console.log('1. Visit http://localhost:3000/admin to manage products');
    console.log('2. Visit http://localhost:3000/show to see the live experience');
    console.log('3. Use the admin panel to advance through looks during your show');

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    process.exit(1);
  }
}

// Run the script
createSampleData();