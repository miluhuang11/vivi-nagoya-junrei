import { supabase, supabaseReady } from "./supabase-config.js";
import { seedDays } from "./seed-data.js";

const CATEGORY_ICON = { spot: "📍", food: "🍽️", transport: "🚃", hotel: "🏨", note: "📝" };

const DAY_THEMES = [
  { emoji: "🏮", from: "#8a4a2b", to: "#c9704f" }, // 高山老街
  { emoji: "🏡", from: "#3f6b4f", to: "#7fa66b" }, // 白川鄉合掌村
  { emoji: "🎏", from: "#2f7d76", to: "#c9a24a" }, // 金澤兼六園・金箔
  { emoji: "🏔️", from: "#2d4f7c", to: "#7ea6d6" }, // 立山黑部
  { emoji: "🍁", from: "#3f7a4f", to: "#e0954f" }, // 上高地・諏訪湖夕陽
  { emoji: "🌇", from: "#6a4a8c", to: "#d4708c" }, // 諏訪湖・名古屋夜景
  { emoji: "🏯", from: "#8a6a2d", to: "#c9a24a" }, // 名古屋城
  { emoji: "✈️", from: "#2d6a8c", to: "#6bb3d6" }, // 返台
];

function themeFor(day) {
  return DAY_THEMES[(day.order_num - 1) % DAY_THEMES.length];
}

function openMapsFor(item) {
  const query = (item.map_query && item.map_query.trim()) || item.text;
  window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query), "_blank", "noopener");
}

const el = {
  app: document.getElementById("app"),
  tabs: document.getElementById("day-tabs"),
  loading: document.getElementById("loading-msg"),
  syncStatus: document.getElementById("sync-status"),
  addDayBtn: document.getElementById("add-day-btn"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalTitle: document.getElementById("modal-title"),
  itemForm: document.getElementById("item-form"),
  fieldPeriod: document.getElementById("field-period"),
  fieldCategory: document.getElementById("field-category"),
  fieldText: document.getElementById("field-text"),
  fieldMap: document.getElementById("field-map"),
  modalCancel: document.getElementById("modal-cancel"),
  modalCloseX: document.getElementById("modal-close-x"),
};

let state = { days: [] }; // each day: {..., items: [...] } sorted
let activeDayId = null;
let editingCtx = null; // { dayId, itemId } itemId null = adding new

function setSyncStatus(text, cls) {
  el.syncStatus.textContent = text;
  el.syncStatus.className = "sync-status" + (cls ? " " + cls : "");
}

async function init() {
  if (!supabaseReady) {
    el.loading.remove();
    el.app.innerHTML = `<div class="config-warning">
      ⚠️ 尚未設定 Supabase。<br/><br/>
      請打開 <code>supabase-config.js</code>，把 <code>YOUR_SUPABASE_URL</code> 和
      <code>YOUR_SUPABASE_ANON_KEY</code> 換成你自己 Supabase 專案的值，存檔後重新整理頁面。
    </div>`;
    setSyncStatus("未設定", "err");
    return;
  }

  try {
    await loadData();
  } catch (e) {
    console.error(e);
    setSyncStatus("連線失敗", "err");
    el.loading.textContent = "載入失敗，請確認 supabase-config.js 設定是否正確（詳見 README）。";
    return;
  }

  el.addDayBtn.hidden = false;
  render();
  subscribeRealtime();
}

async function loadData() {
  let { data: days, error: daysErr } = await supabase.from("days").select("*").order("order_num");
  if (daysErr) throw daysErr;

  if (!days || days.length === 0) {
    await seedDatabase();
    ({ data: days } = await supabase.from("days").select("*").order("order_num"));
  }

  const { data: items, error: itemsErr } = await supabase.from("items").select("*").order("position");
  if (itemsErr) throw itemsErr;

  state.days = (days || []).map((d) => ({
    ...d,
    items: (items || []).filter((i) => i.day_id === d.id),
  }));

  if (!activeDayId && state.days.length) activeDayId = state.days[0].id;
}

async function seedDatabase() {
  const dayRows = seedDays.map(({ items, ...d }) => d);
  const { error: e1 } = await supabase.from("days").insert(dayRows);
  if (e1) throw e1;

  const itemRows = [];
  for (const day of seedDays) {
    day.items.forEach((item, idx) => {
      itemRows.push({ day_id: day.id, period: item.period, category: item.category, text: item.text, map_query: item.map_query || null, position: idx });
    });
  }
  const { error: e2 } = await supabase.from("items").insert(itemRows);
  if (e2) throw e2;
}

let refetchTimer = null;
function subscribeRealtime() {
  const scheduleRefetch = () => {
    clearTimeout(refetchTimer);
    refetchTimer = setTimeout(async () => {
      try {
        await loadData();
        render();
      } catch (e) {
        console.error(e);
      }
    }, 150);
  };

  supabase
    .channel("public:items")
    .on("postgres_changes", { event: "*", schema: "public", table: "items" }, scheduleRefetch)
    .subscribe((status) => {
      if (status === "SUBSCRIBED") setSyncStatus("已連線・自動保存 ✓", "ok");
    });

  supabase
    .channel("public:days")
    .on("postgres_changes", { event: "*", schema: "public", table: "days" }, scheduleRefetch)
    .subscribe();
}

function render() {
  el.loading?.remove();
  renderTabs();
  renderDays();
}

function renderTabs() {
  el.tabs.innerHTML = "";
  state.days.forEach((day) => {
    const btn = document.createElement("button");
    btn.className = "day-tab" + (day.id === activeDayId ? " active" : "");
    btn.textContent = day.date;
    btn.addEventListener("click", () => {
      activeDayId = day.id;
      render();
    });
    el.tabs.appendChild(btn);
  });
}

function renderDays() {
  el.app.innerHTML = "";
  state.days.forEach((day) => {
    const section = document.createElement("section");
    section.className = "day-section" + (day.id === activeDayId ? " active" : "");
    section.appendChild(renderDayCard(day));
    el.app.appendChild(section);
  });
}

function renderDayCard(day) {
  const card = document.createElement("div");
  card.className = "day-card";

  const theme = themeFor(day);
  const banner = document.createElement("div");
  banner.className = "day-banner";
  banner.style.background = `linear-gradient(135deg, ${theme.from}, ${theme.to})`;

  const bannerEmoji = document.createElement("div");
  bannerEmoji.className = "day-banner-emoji";
  bannerEmoji.textContent = theme.emoji;

  const dateEl = document.createElement("div");
  dateEl.className = "day-date";
  dateEl.textContent = day.date;

  const titleEl = document.createElement("div");
  titleEl.className = "day-title";
  titleEl.contentEditable = "true";
  titleEl.textContent = day.title;
  titleEl.addEventListener("blur", () => {
    const newVal = titleEl.textContent.trim();
    if (newVal && newVal !== day.title) updateDay(day.id, { title: newVal });
  });

  const hotelEl = document.createElement("div");
  hotelEl.className = "day-hotel";
  hotelEl.contentEditable = "true";
  hotelEl.textContent = day.hotel || "";
  hotelEl.setAttribute("data-placeholder", "🏨 點此新增住宿資訊…");
  hotelEl.addEventListener("blur", () => {
    const newVal = hotelEl.textContent.trim();
    if (newVal !== (day.hotel || "")) updateDay(day.id, { hotel: newVal });
  });

  banner.append(bannerEmoji, dateEl, titleEl, hotelEl);
  card.appendChild(banner);

  const body = document.createElement("div");
  body.className = "day-body";
  card.appendChild(body);

  const list = document.createElement("ul");
  list.className = "item-list";

  if (day.items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "這天還沒有行程，點下面新增一個吧！";
    list.appendChild(empty);
  }

  day.items.forEach((item) => list.appendChild(renderItemRow(day, item)));
  body.appendChild(list);

  const addBtnWrap = document.createElement("div");
  addBtnWrap.className = "add-item-wrap";
  const addBtn = document.createElement("button");
  addBtn.className = "add-item-btn";
  addBtn.textContent = "＋ 新增行程";
  addBtn.addEventListener("click", () => openModal({ dayId: day.id, item: null }));
  addBtnWrap.appendChild(addBtn);
  body.appendChild(addBtnWrap);

  return card;
}

function renderItemRow(day, item) {
  const li = document.createElement("li");
  li.className = "item-row cat-" + (item.category || "spot");

  const badge = document.createElement("div");
  badge.className = "item-badge";
  badge.textContent = CATEGORY_ICON[item.category] || "📍";

  const body = document.createElement("div");
  body.className = "item-body";
  body.title = "點一下在 Google 地圖開啟";
  body.addEventListener("click", () => openMapsFor(item));

  const period = document.createElement("div");
  period.className = "item-period";
  period.textContent = item.period + " 🗺️";
  const text = document.createElement("div");
  text.className = "item-text";
  text.textContent = item.text;
  body.append(period, text);

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn";
  editBtn.title = "編輯";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal({ dayId: day.id, item });
  });

  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn";
  delBtn.title = "刪除";
  delBtn.textContent = "🗑️";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteItem(item);
  });

  actions.append(editBtn, delBtn);
  li.append(badge, body, actions);
  return li;
}

function openModal({ dayId, item }) {
  editingCtx = { dayId, itemId: item ? item.id : null };
  el.modalTitle.textContent = item ? "編輯行程" : "新增行程";
  el.fieldPeriod.value = item ? item.period : "";
  el.fieldCategory.value = item ? item.category : "spot";
  el.fieldText.value = item ? item.text : "";
  el.fieldMap.value = item ? item.map_query || "" : "";
  el.modalOverlay.hidden = false;
  el.fieldPeriod.focus();
}

function closeModal() {
  el.modalOverlay.hidden = true;
  editingCtx = null;
  el.itemForm.reset();
}

el.modalCancel.addEventListener("click", closeModal);
el.modalCloseX.addEventListener("click", closeModal);
el.modalOverlay.addEventListener("click", (e) => {
  if (e.target === el.modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !el.modalOverlay.hidden) closeModal();
});

el.itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const period = el.fieldPeriod.value.trim();
  const category = el.fieldCategory.value;
  const text = el.fieldText.value.trim();
  const map_query = el.fieldMap.value.trim() || null;
  if (!period || !text) return;

  const { dayId, itemId } = editingCtx;
  try {
    if (itemId) {
      await supabase.from("items").update({ period, category, text, map_query }).eq("id", itemId);
    } else {
      const day = state.days.find((d) => d.id === dayId);
      const maxPos = day.items.reduce((m, i) => Math.max(m, i.position ?? 0), -1);
      await supabase.from("items").insert({ day_id: dayId, period, category, text, map_query, position: maxPos + 1 });
    }
    closeModal();
    await loadData();
    render();
  } catch (err) {
    console.error(err);
    alert("儲存失敗，請檢查網路連線或 Supabase 設定。");
  }
});

async function deleteItem(item) {
  if (!confirm("確定要刪除這個行程項目嗎？")) return;
  try {
    await supabase.from("items").delete().eq("id", item.id);
    await loadData();
    render();
  } catch (err) {
    console.error(err);
    alert("刪除失敗，請檢查網路連線或 Supabase 設定。");
  }
}

async function updateDay(dayId, fields) {
  try {
    await supabase.from("days").update(fields).eq("id", dayId);
    await loadData();
    render();
  } catch (err) {
    console.error(err);
    alert("更新失敗，請檢查網路連線或 Supabase 設定。");
  }
}

el.addDayBtn.addEventListener("click", async () => {
  const date = prompt("日期（例如：9/03（四））");
  if (!date) return;
  const title = prompt("這天的標題（例如：D9：延伸行程）");
  if (!title) return;
  const maxOrder = state.days.reduce((m, d) => Math.max(m, d.order_num), 0);
  const id = "day" + Date.now();
  try {
    await supabase.from("days").insert({ id, order_num: maxOrder + 1, date, title, hotel: "" });
    activeDayId = id;
    await loadData();
    render();
  } catch (err) {
    console.error(err);
    alert("新增失敗，請檢查網路連線或 Supabase 設定。");
  }
});

init();
