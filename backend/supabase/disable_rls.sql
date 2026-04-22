-- Disable RLS on all MedsNear tables
-- Safe to do because access is controlled by the Express backend (JWT auth)
-- The DB is never accessed directly from the browser

alter table agents disable row level security;
alter table admins disable row level security;
alter table pharmacies disable row level security;
alter table inventory disable row level security;
alter table orders disable row level security;
alter table payouts disable row level security;
