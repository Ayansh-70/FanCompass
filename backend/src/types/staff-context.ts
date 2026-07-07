/**
 * Context provided by staff members when querying the dashboard.
 */
export interface StaffContext {
  /** The specific gate the staff member is stationed at or querying about. */
  gate_id: string;
  /** The role of the staff member making the request. */
  requesting_role: 'volunteer' | 'organizer' | 'security';
}
