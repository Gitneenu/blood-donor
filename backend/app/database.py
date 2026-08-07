from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

# Single shared client using the service_role key.
# This is server-side only - it bypasses RLS, so this file must
# never be imported into anything exposed directly to the browser.
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
