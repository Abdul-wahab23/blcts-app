/*
# Fix regional_pricing: replace towns with proper counties

## Problem
The `regional_pricing` table contained "Thika" and "Eldoret" as counties.
These are towns, not counties:
- Thika is a town in Kiambu county
- Eldoret is a town in Uasin Gishu county

The acceptance criteria explicitly require:
"County hierarchy correctly uses Kiambu as the county and Thika as the town."

## Changes
1. Update the row with county = 'Thika' to county = 'Kiambu' (preserving its 0.95 multiplier).
2. Update the row with county = 'Eldoret' to county = 'Uasin Gishu' (preserving its 0.90 multiplier).
3. Add a `town` column to record the associated town for reference, and set Thika for Kiambu and Eldoret for Uasin Gishu.
4. Backfill `town` as NULL for other rows (no specific town recorded).

## Notes
- No rows are deleted; data is preserved.
- The `county` column has a UNIQUE constraint, so the UPDATE must avoid collisions.
  There is no existing 'Kiambu' or 'Uasin Gishu' row, so the rename is safe.
- RLS is already enabled on this table; no policy changes are needed.
*/

-- Add a nullable town column for reference (idempotent)
ALTER TABLE regional_pricing ADD COLUMN IF NOT EXISTS town text;

-- Rename Thika -> Kiambu (Thika is a town in Kiambu county)
UPDATE regional_pricing
SET county = 'Kiambu', town = COALESCE(town, 'Thika')
WHERE county = 'Thika';

-- Rename Eldoret -> Uasin Gishu (Eldoret is a town in Uasin Gishu county)
UPDATE regional_pricing
SET county = 'Uasin Gishu', town = COALESCE(town, 'Eldoret')
WHERE county = 'Eldoret';
