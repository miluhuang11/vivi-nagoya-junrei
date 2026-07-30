import { supabase, supabaseReady } from "./supabase-config.js";
import { seedDays } from "./seed-data.js";

const CATEGORY_META = {
  spot: { badge: "badge-green", label: "景點" },
  food: { badge: "badge-pink", label: "美食" },
  transport: { badge: "badge-blue", label: "交通" },
  hotel: { badge: "badge-teal", label: "住宿" },
  note: { badge: "badge-orange", label: "備註" },
};

const el = {
  dayPills: document.getElementById("day-pills"),
  dayList: document.getElementById("day-list"),
  loading: document.getElementById("loading-msg"),
  syncStatus: document.getElementById("sync-status"),
  searchInput: document.getElementById("trip-search"),
  searchClear: document.getElementById("search-clear"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalTitle: document.getElementById("modal-title"),
  itemForm: document.getElementById("item-form"),
  fieldPeriod: document.getElementById("field-period"),
  fieldCategory: document.getElementById("field-category"),
  fieldName: document.getElementById("field-name"),
  fieldText: document.getElementById("field-text"),
  fieldMap: document.getElementById("field-map"),
  modalCancel: document.getElementById("modal-cancel"),
  modalCloseX: document.getElementById("modal-close-x"),
};

let state = { days: [] };
let editingCtx = null;
let activeDayId = null;

function setSyncStatus(text, cls) {
  el.syncStatus.textContent = text;
  el.syncStatus.className = "sync-status" + (cls ? " " + cls : "");
}

function openMapsFor(item) {
  const query = (item.map_query && item.map_query.trim()) || item.name || item.text || "";
  window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query), "_blank", "noopener");
}

async function init() {
  if (!supabaseReady) {
    el.loading.remove();
    el.dayList.innerHTML = `<div class="config-warning">
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
}

async function seedDatabase() {
  const dayRows = seedDays.map(({ items, ...d }) => d);
  const { error: e1 } = await supabase.from("days").insert(dayRows);
  if (e1) throw e1;

  const itemRows = [];
  for (const day of seedDays) {
    day.items.forEach((item, idx) => {
      itemRows.push({
        day_id: day.id,
        period: item.period,
        name: item.name,
        category: item.category,
        text: item.text || null,
        map_query: item.map_query || null,
        position: idx,
      });
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
  renderPills();
  renderDayList();
  applyFilter();
}

function renderPills() {
  if (!activeDayId || !state.days.some((d) => d.id === activeDayId)) {
    activeDayId = state.days[0]?.id || null;
  }

  el.dayPills.innerHTML = "";
  state.days.forEach((day) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "pill";
    pill.dataset.dayId = day.id;
    pill.textContent = day.date;
    pill.addEventListener("click", () => setActiveDay(day.id));
    el.dayPills.appendChild(pill);
  });
  setActivePill(activeDayId);
}

function setActivePill(dayId) {
  el.dayPills.querySelectorAll(".pill").forEach((p) => {
    p.classList.toggle("on", p.dataset.dayId === dayId);
  });
}

function setActiveDay(dayId) {
  activeDayId = dayId;
  setActivePill(dayId);
  document.querySelectorAll(".day-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.dayId === dayId);
  });
  el.dayList.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
  applyFilter();
}

function renderDayList() {
  el.dayList.innerHTML = "";
  state.days.forEach((day, idx) => {
    const card = renderDayCard(day, idx + 1);
    if (day.id === activeDayId) card.classList.add("active");
    el.dayList.appendChild(card);
  });
}

function renderDayCard(day, dayNum) {
  const card = document.createElement("div");
  card.className = "day-card";
  card.id = "day-" + day.id;
  card.dataset.dayId = day.id;

  const hd = document.createElement("div");
  hd.className = "day-hd";

  const main = document.createElement("div");
  main.className = "day-hd-main";

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

  main.append(dateEl, titleEl, hotelEl);

  const badge = document.createElement("div");
  badge.className = "day-badge";
  badge.textContent = "Day " + dayNum;

  hd.append(main, badge);
  card.appendChild(hd);

  if (day.items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "這天還沒有行程";
    card.appendChild(empty);
  }

  day.items.forEach((item) => card.appendChild(renderItemRow(day, item)));

  const addWrap = document.createElement("div");
  addWrap.className = "add-item-wrap";
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "add-item-btn";
  addBtn.innerHTML = `<i class="ti ti-plus"></i> 新增`;
  addBtn.addEventListener("click", () => openModal({ dayId: day.id, item: null }));
  addWrap.appendChild(addBtn);
  card.appendChild(addWrap);

  return card;
}

function renderItemRow(day, item) {
  const row = document.createElement("div");
  row.className = "item";
  row.addEventListener("click", () => openMapsFor(item));

  const time = document.createElement("div");
  time.className = "item-time";
  time.textContent = item.period;

  const body = document.createElement("div");
  body.className = "item-body";

  const meta = CATEGORY_META[item.category] || CATEGORY_META.spot;
  const name = document.createElement("div");
  name.className = "item-name";
  const badge = document.createElement("span");
  badge.className = "badge " + meta.badge;
  badge.textContent = meta.label;
  name.appendChild(badge);
  name.appendChild(document.createTextNode(item.name || item.text || ""));
  body.appendChild(name);

  if (item.text && item.name) {
    const note = document.createElement("div");
    note.className = "item-note";
    note.textContent = item.text;
    body.appendChild(note);
  }

  const mapHint = document.createElement("div");
  mapHint.className = "item-map";
  mapHint.innerHTML = `<i class="ti ti-map-pin"></i> 點擊開啟地圖`;
  body.appendChild(mapHint);

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "icon-btn";
  editBtn.title = "編輯";
  editBtn.innerHTML = `<i class="ti ti-pencil"></i>`;
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal({ dayId: day.id, item });
  });

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "icon-btn";
  delBtn.title = "刪除";
  delBtn.innerHTML = `<i class="ti ti-trash"></i>`;
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteItem(item);
  });

  actions.append(editBtn, delBtn);
  row.append(time, body, actions);
  return row;
}

function openModal({ dayId, item }) {
  editingCtx = { dayId, itemId: item ? item.id : null };
  el.modalTitle.textContent = item ? "編輯行程" : "新增行程";
  el.fieldPeriod.value = item ? item.period : "";
  el.fieldCategory.value = item ? item.category : "spot";
  el.fieldName.value = item ? item.name || "" : "";
  el.fieldText.value = item ? item.text || "" : "";
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
  const name = el.fieldName.value.trim();
  const text = el.fieldText.value.trim() || null;
  const map_query = el.fieldMap.value.trim() || null;
  if (!period || !name) return;

  const { dayId, itemId } = editingCtx;
  try {
    if (itemId) {
      await supabase.from("items").update({ period, category, name, text, map_query }).eq("id", itemId);
    } else {
      const day = state.days.find((d) => d.id === dayId);
      const maxPos = day.items.reduce((m, i) => Math.max(m, i.position ?? 0), -1);
      await supabase.from("items").insert({ day_id: dayId, period, category, name, text, map_query, position: maxPos + 1 });
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

function applyFilter() {
  const query = el.searchInput.value.toLowerCase().trim();
  el.searchClear.hidden = !query;

  const activeCard = document.querySelector(".day-card.active");
  if (!activeCard) return;
  activeCard.querySelectorAll(".item").forEach((item) => {
    const match = !query || item.textContent.toLowerCase().includes(query);
    item.style.display = match ? "flex" : "none";
  });
}

el.searchInput.addEventListener("input", applyFilter);
el.searchClear.addEventListener("click", () => {
  el.searchInput.value = "";
  applyFilter();
});

init();
