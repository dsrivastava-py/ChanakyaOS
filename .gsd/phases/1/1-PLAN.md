---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Harden SyncProvider & Centralize Persistence

## Objective
The goal of this plan is to eliminate race conditions and data loss by centralizing all Supabase persistence logic within the `SyncProvider` and removing ad-hoc database calls from the `useUserStore`. We will implement a robust dirty-flag mechanism and transition to forceful `.upsert()` operations for atomic updates.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/components/providers/SyncProvider.tsx
- src/store/useUserStore.ts

## Tasks

<task type="auto">
  <name>Centralize Persistence Logic</name>
  <files>
    <file>src/store/useUserStore.ts</file>
    <file>src/components/providers/SyncProvider.tsx</file>
  </files>
  <action>
    1. In `src/store/useUserStore.ts`:
       - Remove `supabase` imports.
       - Remove manual `.update()` calls in `toggleProjectCompletion` and `toggleCertCompletion`.
       - Ensure these actions only update the local state and set `hasUnsavedChanges: true`.
    2. In `src/components/providers/SyncProvider.tsx`:
       - Update the `saveToDatabase` effect to include `locked_pathway` in the primary state sync.
       - Implement a multi-table atomic update (if possible) or sequential upserts within the same transaction/logic block.
       - Ensure the `hasUnsavedChanges` flag is cleared ONLY after all updates succeed.
  </action>
  <verify>Check that `useUserStore.ts` no longer contains direct Supabase calls for data updates.</verify>
  <done>Persistence logic is fully contained within SyncProvider and store actions only trigger sync via flags.</done>
</task>

<task type="auto">
  <name>Hardening the Sync Guard</name>
  <files>
    <file>src/components/providers/SyncProvider.tsx</file>
  </files>
  <action>
    1. Refine the `useEffect` guard in `SyncProvider`:
       - Ensure `isHydrated` is strictly checked.
       - Add a `isSaving` ref/state to prevent overlapping save attempts.
       - Log specific state fields that triggered the sync for debugging.
    2. Transition all `user_profiles` and `career_pathways` updates to forceful `.upsert()` where appropriate to ensure atomic data merges.
  </action>
  <verify>Manual testing of rapid state changes should show a single debounced upsert in the console without error.</verify>
  <done>SyncProvider prevents race conditions and uses upserts for all primary data entities.</done>
</task>

## Success Criteria
- [ ] No direct Supabase `update/upsert` calls in `useUserStore.ts`.
- [ ] `SyncProvider.tsx` handles both `user_profiles` and `career_pathways` synchronization.
- [ ] Data persistence is atomic and race-condition free under rapid local state updates.
