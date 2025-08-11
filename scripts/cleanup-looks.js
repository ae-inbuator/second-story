/**
 * Script to cleanup inconsistent look activation states
 * This will ensure only one look (or none) can be active at a time
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bnnabuwcojrctjhnwcmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ5NjUsImV4cCI6MjA3MDQ3MDk2NX0.3tXkx5K1HLgl5sUif1_cUuXay7t-UwtU9_Z-NN4N8EA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupLooks() {
  console.log('🔧 Starting look activation cleanup...\n');

  try {
    // First, get all looks to see current state
    const { data: looks, error: fetchError } = await supabase
      .from('looks')
      .select('id, look_number, name, active')
      .order('look_number');

    if (fetchError) throw fetchError;

    console.log('📋 Current state:');
    looks.forEach((look) => {
      console.log(`  Look ${look.look_number}: ${look.name} - ${look.active ? 'ACTIVE' : 'INACTIVE'}`);
    });

    // Count how many are currently active
    const activeLooks = looks.filter(look => look.active);
    console.log(`\n⚠️  Found ${activeLooks.length} active looks (should be 0 or 1)`);

    if (activeLooks.length <= 1) {
      console.log('✅ Look activation state is already correct!');
      return;
    }

    // Deactivate ALL looks first - update each look individually to be safe
    console.log('\n🔄 Deactivating all looks...');
    for (const look of looks) {
      const { error: deactivateError } = await supabase
        .from('looks')
        .update({ active: false })
        .eq('id', look.id);

      if (deactivateError) throw deactivateError;
      console.log(`  ✓ Deactivated: ${look.name}`);
    }

    console.log('✅ All looks deactivated');

    // Optionally activate the first look (uncomment if you want one active by default)
    // if (looks.length > 0) {
    //   console.log(`🎯 Activating first look: ${looks[0].name}`);
    //   const { error: activateError } = await supabase
    //     .from('looks')
    //     .update({ active: true })
    //     .eq('id', looks[0].id);
    //   
    //   if (activateError) throw activateError;
    //   console.log('✅ First look activated');
    // }

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const { data: verifyLooks, error: verifyError } = await supabase
      .from('looks')
      .select('look_number, name, active')
      .order('look_number');

    if (verifyError) throw verifyError;

    console.log('📋 Final state:');
    verifyLooks.forEach((look) => {
      console.log(`  Look ${look.look_number}: ${look.name} - ${look.active ? 'ACTIVE' : 'INACTIVE'}`);
    });

    const finalActive = verifyLooks.filter(look => look.active).length;
    console.log(`\n✅ Cleanup complete! ${finalActive} look(s) now active`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

cleanupLooks();