/**
 * Test script to verify look activation logic works correctly
 * This will simulate activating different looks and verify only one is active
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bnnabuwcojrctjhnwcmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ5NjUsImV4cCI6MjA3MDQ3MDk2NX0.3tXkx5K1HLgl5sUif1_cUuXay7t-UwtU9_Z-NN4N8EA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the improved activateLook function from the admin page
async function testActivateLook(lookId, lookName) {
  try {
    console.log(`\n🎯 Testing activation of: ${lookName}`);

    // Get all currently active looks
    const { data: activeLooks, error: activeError } = await supabase
      .from('looks')
      .select('id, name')
      .eq('active', true);

    if (activeError) throw activeError;

    console.log(`   Current active looks: ${activeLooks.length}`);
    if (activeLooks.length > 0) {
      activeLooks.forEach(look => console.log(`   - ${look.name}`));
    }

    // Deactivate all active looks
    for (const activeLook of activeLooks) {
      const { error: deactivateError } = await supabase
        .from('looks')
        .update({ active: false })
        .eq('id', activeLook.id);
      
      if (deactivateError) throw deactivateError;
    }

    // Activate the target look
    const { error: activateError } = await supabase
      .from('looks')
      .update({ active: true })
      .eq('id', lookId);

    if (activateError) throw activateError;

    // Verify only one look is active
    const { data: verifyLooks, error: verifyError } = await supabase
      .from('looks')
      .select('id, name, active');

    if (verifyError) throw verifyError;

    const activeCount = verifyLooks.filter(look => look.active).length;
    const activeLook = verifyLooks.find(look => look.active);

    console.log(`   ✅ Activation successful!`);
    console.log(`   📊 Total active looks: ${activeCount} (should be 1)`);
    console.log(`   🎬 Currently active: ${activeLook ? activeLook.name : 'None'}`);

    if (activeCount === 1 && activeLook?.id === lookId) {
      console.log(`   ✅ TEST PASSED: Only ${lookName} is active`);
      return true;
    } else {
      console.log(`   ❌ TEST FAILED: Expected 1 active look, got ${activeCount}`);
      return false;
    }

  } catch (error) {
    console.error(`   ❌ Error activating ${lookName}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Look Activation Tests...\n');

  try {
    // Get all available looks
    const { data: looks, error } = await supabase
      .from('looks')
      .select('id, look_number, name')
      .order('look_number');

    if (error) throw error;

    console.log(`📋 Found ${looks.length} looks to test with:`);
    looks.forEach(look => {
      console.log(`   - Look ${look.look_number}: ${look.name} (${look.id})`);
    });

    if (looks.length === 0) {
      console.log('❌ No looks found to test with!');
      return;
    }

    let passedTests = 0;
    const totalTests = Math.min(looks.length, 3); // Test with first 3 looks

    // Test activating each look
    for (let i = 0; i < totalTests; i++) {
      const look = looks[i];
      const success = await testActivateLook(look.id, look.name);
      if (success) passedTests++;
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const { data: finalLooks } = await supabase
      .from('looks')
      .select('name, active');

    const finalActive = finalLooks.filter(look => look.active);
    console.log(`📊 Final state: ${finalActive.length} active look(s)`);
    finalActive.forEach(look => console.log(`   🎬 ${look.name} is LIVE`));

    // Test results
    console.log('\n📈 Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`📊 Final active looks: ${finalActive.length}`);
    
    if (passedTests === totalTests && finalActive.length <= 1) {
      console.log('🎉 ALL TESTS PASSED! Look activation is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the logic.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

runTests();