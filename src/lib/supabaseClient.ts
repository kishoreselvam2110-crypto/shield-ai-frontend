import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://pvmknlhdbsoiyzsegjpo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bWtubGhkYnNvaXl6c2VnanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODQ5MDYsImV4cCI6MjA5NjU2MDkwNn0.RxKaDwd0uuxWE6qtSUMirAqzwzIq-qYqmYWvHN4BeJs'
);
