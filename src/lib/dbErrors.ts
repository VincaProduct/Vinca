interface DbError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Plain-language message for a Supabase error, including the common case of
 * a feature whose database update (migration) hasn't been run yet.
 */
export const describeDbError = (error: unknown): string => {
  const e = (error || {}) as DbError;
  const text = [e.message, e.details, e.hint].filter(Boolean).join(' ');
  if (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache/i.test(text)) {
    return "This feature's database table hasn't been created yet. Ask your Supabase admin to run its database update (migration), then try again.";
  }
  if (e.code === '42501' || /row-level security|permission denied/i.test(text)) {
    return "Your account isn't allowed to do this. Only super admins can make this change.";
  }
  if (error instanceof Error) return error.message;
  return text || e.code || 'Unknown error';
};
