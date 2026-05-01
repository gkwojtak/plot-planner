import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user from the Supabase session, or null.
 * Use in Server Components and route handlers.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
