// 這個檔案存放 Supabase 專案設定。
// 請到 https://supabase.com/ 建立專案 → Project Settings → API →
// 把 "Project URL" 和 "anon public" key 貼到下面取代 YOUR_XXX，然後存檔即可。
// anon key 本來就是設計給前端公開使用的（不是密碼），可以放心 commit 到 GitHub，
// 真正的存取權限是由資料庫的 RLS policy 決定（見 supabase-schema.sql）。

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ujxaabxlmqlpreyijdxy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_aN7G_CbsP1lwyNDDSXdI9w_IZ332AVU";

export const supabaseReady = SUPABASE_URL !== "YOUR_SUPABASE_URL";
export const supabase = supabaseReady
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
