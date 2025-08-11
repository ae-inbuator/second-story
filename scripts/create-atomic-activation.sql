-- SQL script to create atomic look activation function
-- This ensures only one look can be active at any time using a single database transaction

CREATE OR REPLACE FUNCTION activate_look_atomic(target_look_id UUID)
RETURNS JSON AS $$
DECLARE
  look_exists BOOLEAN;
  look_data JSON;
BEGIN
  -- Check if the target look exists
  SELECT EXISTS(
    SELECT 1 FROM looks WHERE id = target_look_id
  ) INTO look_exists;
  
  IF NOT look_exists THEN
    RETURN json_build_object('success', false, 'error', 'Look not found');
  END IF;
  
  -- Deactivate all looks and activate the target in a single atomic operation
  UPDATE looks SET active = false WHERE active = true;
  UPDATE looks SET active = true WHERE id = target_look_id;
  
  -- Get the activated look data to return
  SELECT json_build_object(
    'id', id,
    'look_number', look_number,
    'name', name,
    'active', active
  ) INTO look_data
  FROM looks 
  WHERE id = target_look_id;
  
  RETURN json_build_object('success', true, 'look', look_data);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to deactivate all looks
CREATE OR REPLACE FUNCTION deactivate_all_looks()
RETURNS JSON AS $$
BEGIN
  UPDATE looks SET active = false WHERE active = true;
  
  RETURN json_build_object('success', true, 'message', 'All looks deactivated');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;