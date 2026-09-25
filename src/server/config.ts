import 'server-only';

/**
 * There is no sign-in yet: every request acts as this member of the sample workspace.
 * Replace with the authenticated user's id once authentication is added.
 */
export const CURRENT_USER_ID = 'usr-1';

export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Bogota';
