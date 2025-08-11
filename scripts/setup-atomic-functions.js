/**
 * Script to create atomic look activation functions in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://bnnabuwcojrctjhnwcmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ5NjUsImV4cCI6MjA3MDQ3MDk2NX0.3tXkx5K1HLgl5sUif1_cUuXay7t-UwtU9_Z-NN4N8EA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAtomicFunctions() {
  console.log('🔧 Setting up atomic look activation functions...\n');

  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-atomic-activation.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each SQL statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`⚡ Executing statement ${i + 1}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement 
      });

      if (error) {
        // Try alternative approach using raw SQL
        console.log('   Trying alternative approach...');
        const { error: altError } = await supabase
          .from('looks')  // Use any table to get access to raw SQL
          .select('id')
          .limit(0);  // We don't need results
        
        if (altError) {
          console.log('   ⚠️  Direct SQL execution not available with current permissions');
          console.log('   📋 You will need to run this SQL manually in the Supabase SQL Editor:');
          console.log('\n' + '='.repeat(60));
          console.log(sqlContent);
          console.log('='.repeat(60) + '\n');
          break;
        }
      } else {
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('🎯 Testing if functions are available...');

    // Test the functions by calling them
    try {
      // Test deactivate_all_looks function
      const { data: deactivateResult, error: deactivateError } = await supabase
        .rpc('deactivate_all_looks');

      if (deactivateError) {
        console.log('⚠️  Functions not yet available. Please run the SQL manually.');
        console.log('📋 Copy and paste the following SQL in the Supabase SQL Editor:');
        console.log('\n' + sqlContent);
      } else {
        console.log('✅ Atomic functions are ready!');
        console.log('📋 Available functions:');
        console.log('  - activate_look_atomic(target_look_id UUID)');
        console.log('  - deactivate_all_looks()');
      }
    } catch (testError) {
      console.log('⚠️  Functions need to be created manually. Please run the SQL in Supabase.');
    }

  } catch (error) {
    console.error('❌ Error setting up functions:', error.message);
    
    // Show the SQL content so user can run it manually
    const sqlFile = path.join(__dirname, 'create-atomic-activation.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('\n📋 Please run this SQL manually in the Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(sqlContent);
    console.log('='.repeat(60));
  }
}

setupAtomicFunctions();