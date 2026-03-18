-- Purane signups (auth.users mein jo users hain, profiles mein nahi) ko profiles mein daalne ke liye.
-- Supabase SQL Editor mein is project par run karo (jiska URL .env.local mein hai).

insert into public.profiles (
  id,
  username,
  role,
  email,
  company_name,
  website,
  company_description,
  payment_email,
  tax_id,
  address,
  city,
  country,
  approval_status
)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'username'), ''),
    split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 8)
  ),
  coalesce(
    nullif(u.raw_user_meta_data->>'role', ''),
    'publisher'
  ),
  coalesce(u.email, ''),
  nullif(trim(u.raw_user_meta_data->>'company_name'), ''),
  nullif(trim(u.raw_user_meta_data->>'website'), ''),
  nullif(trim(u.raw_user_meta_data->>'company_description'), ''),
  nullif(trim(u.raw_user_meta_data->>'payment_email'), ''),
  nullif(trim(u.raw_user_meta_data->>'tax_id'), ''),
  nullif(trim(u.raw_user_meta_data->>'address'), ''),
  nullif(trim(u.raw_user_meta_data->>'city'), ''),
  nullif(trim(u.raw_user_meta_data->>'country'), ''),
  'pending'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
