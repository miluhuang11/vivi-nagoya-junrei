-- 在 Supabase 專案的 SQL Editor 貼上這整份，按 Run 執行一次即可。
-- 會建立兩張表：days（每天的標題/日期/住宿）與 items（每個景點/行程項目）。

create table if not exists days (
  id text primary key,
  order_num int not null,
  date text not null,
  title text not null,
  hotel text default ''
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  day_id text not null references days(id) on delete cascade,
  period text not null,
  category text not null default 'spot',
  text text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

-- 開啟 Row Level Security，並允許任何人（含未登入的訪客）讀寫。
-- 這是為了讓大家打開網站就能直接編輯，不需要登入帳號。
-- 提醒：這代表任何拿到你網站網址的人都可以修改/刪除資料，
-- 適合單純的個人/親友行程規劃用途，不要拿來存放機密或重要資料。

alter table days enable row level security;
alter table items enable row level security;

create policy "public read days" on days for select using (true);
create policy "public write days" on days for insert with check (true);
create policy "public update days" on days for update using (true);
create policy "public delete days" on days for delete using (true);

create policy "public read items" on items for select using (true);
create policy "public write items" on items for insert with check (true);
create policy "public update items" on items for update using (true);
create policy "public delete items" on items for delete using (true);

-- 開啟 Realtime，讓所有人打開網站時能即時看到彼此的新增/修改/刪除
alter publication supabase_realtime add table days;
alter publication supabase_realtime add table items;
