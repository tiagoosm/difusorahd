// Feature flags for functionality that can be temporarily turned off
// without removing its implementation. One single switch per feature —
// never scatter ad-hoc conditionals across the components that use it.

// Sweepstakes ("Sorteio"): temporarily disabled. Turns off the public
// route (/sorteio), the automatic pop-up, the "Participe do sorteio" link
// in the footer, and the admin "Sorteio" section — all in one place.
// Nothing else was touched: the table, RLS policies, RPC, services,
// hooks and components are all intact.
//
// To reactivate: flip this back to `true`. No rebuild of the feature needed.
export const SWEEPSTAKES_ENABLED = false
