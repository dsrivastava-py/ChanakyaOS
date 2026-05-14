# Phase 1 Verification Playbook

## Objective
Verify that the hardened `SyncProvider` and centralized persistence logic correctly handle data updates without race conditions or data loss.

## Manual Test Cases

### 1. Profile Name Update
- **Action**: Open the Edit Profile modal, change the name, and click save.
- **Expected**:
  - Console logs show `💾 Intentional change detected. UPSERTING to DB...` after a 2-second debounce.
  - Console logs show `✅ Successfully UPSERTED all data!`.
  - Database `user_profiles` table reflects the new name.

### 2. Rapid Task Updates (Race Condition Test)
- **Action**: Quickly check and uncheck 5-10 tasks in the workspace or LMS checklist.
- **Expected**:
  - Only ONE `UPSERT` operation is triggered after the final interaction (due to debounce).
  - All checked/unchecked states are correctly reflected in the database.
  - No `🚨 SYNC ERROR` messages in the console.

### 3. Pathway Locking
- **Action**: Lock a new career pathway from the Explorer or Onboarding.
- **Expected**:
  - The `locked_pathway` field in the store is updated.
  - `SyncProvider` detects the change and updates the `career_pathways` table where `status = 'locked'`.
  - `user_profiles` table is also updated (if necessary, though we centralized it to use the profile upsert).

## Technical Verification
- [ ] Run `grep -r "supabase" src/store` and verify no `update` or `upsert` calls remain.
- [ ] Verify that `SyncProvider.tsx` contains the `isSaving` ref/logic to prevent overlapping requests.
- [ ] Check Supabase logs (in the dashboard) to confirm `UPSERT` operations are hitting the correct tables.
