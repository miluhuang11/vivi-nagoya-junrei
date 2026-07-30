// 首次開啟網站、資料庫還是空的時候，會用這份資料自動建立初始行程。
// 之後大家在網站上做的新增/編輯/刪除都會存進 Supabase，不會再用到這份檔案。

export const seedDays = [
  {
    id: "day1",
    order_num: 1,
    date: "8/26（三）",
    title: "D1：抵達名古屋 ➔ 直奔高山（《冰菓》聖地巡禮）",
    hotel: "🏨 宿：高山（建議住：JR 高山站東口周邊）",
    items: [
      { period: "上午", category: "transport", text: "06:00 抵達中部國際機場 ➔ 搭名鐵至名古屋站 ➔ 轉乘 07:43（或 08:43）JR 特急 Hida 直奔高山（車上補眠）。約 10:30~11:00 抵達高山。", map_query: "高山駅" },
      { period: "下午", category: "spot", text: "飯店寄行李 ➔ 宮川朝市 / 鍛冶橋（《冰菓》OP1 景象）➔ 喫茶 Bagpipe（點維也納咖啡重現「我好在意！」）➔ 高山老街（三町筋）散策 ➔ 高山市圖書館（煥章館）➔ 日枝神社。", map_query: "宮川朝市" },
      { period: "晚餐", category: "food", text: "品嚐飛驒牛燒肉或飛驒牛壽喜燒。", map_query: "飛騨牛 高山 焼肉" },
    ],
  },
  {
    id: "day2",
    order_num: 2,
    date: "8/27（四）",
    title: "D2：《你的名字》聖地巡禮 ➔ 白川鄉合掌村 ➔ 富山",
    hotel: "🏨 宿：富山（第 1 晚，建議住：電鐵富山站 / JR 富山站南口）",
    items: [
      { period: "上午", category: "spot", text: "快閃 斐太高校（神山高校原型校門口）➔ 搭 JR 高山線至 飛驒古川，進行《你的名字》場景巡禮（古川站、飛驒市圖書館、瀨戶川與白壁土藏）。", map_query: "飛騨古川駅" },
      { period: "中午", category: "transport", text: "搭乘 濃飛巴士 前往 白川鄉（合掌村）。", map_query: "白川郷バスターミナル" },
      { period: "下午", category: "spot", text: "巴士總站寄放行李 ➔ 逛合掌村（城山展望台俯瞰全景、參觀和田家、吃飛驒牛串燒與消暑冰品）。", map_query: "白川郷合掌造り集落" },
      { period: "傍晚", category: "transport", text: "搭乘巴士直達 富山，前往 富岩運河環水公園 欣賞世界最美星巴克與夜景。", map_query: "富岩運河環水公園" },
    ],
  },
  {
    id: "day3",
    order_num: 3,
    date: "8/28（五）",
    title: "D3：雨晴海岸觀光列車 ➔ 高岡古城公園 ➔ 金澤市區一日遊",
    hotel: "🏨 宿：富山（第 2 晚）",
    items: [
      { period: "上午", category: "spot", text: "搭乘電車前往 雨晴海岸，遠眺海天一色的富山灣與立山連峰 ➔ 搭電車返回高岡，漫步至 高岡古城公園（高岡城跡，欣賞水堀與綠意森林）順遊哆啦A夢故鄉散策。", map_query: "雨晴海岸" },
      { period: "中午", category: "food", text: "搭乘新幹線（僅需 14 分鐘）前往 金澤，於近江町市場享用鮮美海鮮丼。", map_query: "近江町市場" },
      { period: "下午", category: "spot", text: "走訪 兼六園、金澤城公園、21世紀美術館 或 東茶屋街 品嚐金箔冰淇淋。", map_query: "兼六園" },
      { period: "晚餐/傍晚", category: "food", text: "在金澤享用晚餐後，搭乘北陸新幹線（約 20 分鐘）輕鬆返回富山。", map_query: "金沢駅" },
    ],
  },
  {
    id: "day4",
    order_num: 4,
    date: "8/29（六）",
    title: "D4：【穿越立山黑部阿爾卑斯路線】➔ 松本",
    hotel: "🏨 宿：松本（建議住：JR 松本站東口/Alpico巴士總站周邊）",
    items: [
      { period: "07:00前", category: "transport", text: "於富山站辦理 立山黑部當日行李託運（寄往松本飯店）。", map_query: "富山駅" },
      { period: "全日", category: "spot", text: "橫跨立山黑部 6~7 種交通工具：富山地鐵 ➔ 立山站（纜車）➔ 美女平（高原巴士）➔ 室堂（御庫裏池健行、欣賞雄偉山景）➔ 大觀峰（空中纜車）➔ 黑部平 ➔ 黑部水壩（觀看震撼放水）。", map_query: "黒部ダム" },
      { period: "傍晚", category: "transport", text: "搭巴士至扇澤，轉乘路線巴士/電車至 JR 松本站，取行李並辦理入住。", map_query: "松本駅" },
    ],
  },
  {
    id: "day5",
    order_num: 5,
    date: "8/30（日）",
    title: "D5：上高地絕景健行 ➔ 諏訪湖溫泉（《你的名字》系守湖夕陽）",
    hotel: "🏨 宿：諏訪湖 / 上諏訪溫泉飯店（建議住：上諏訪站前 / 諏訪湖畔）",
    items: [
      { period: "上午", category: "spot", text: "從松本搭乘松本電鐵與 Alpico 巴士，於「大正池」站下車，開啟上高地健行。經典路線：大正池 ➔ 田代池 ➔ 梓川沿岸步道 ➔ 河童橋（純步行約 2.5~3 小時，加拍照休息約 4 小時）。", map_query: "大正池" },
      { period: "下午", category: "food", text: "於河童橋周邊享用午餐與蘋果派，搭乘巴士返回松本。", map_query: "河童橋" },
      { period: "傍晚", category: "spot", text: "從松本搭乘 JR 中央本線（約 30 分鐘）前往 上諏訪（諏訪湖），前往 立石公園 俯瞰《你的名字》系守湖原型夕陽絕景。", map_query: "立石公園 諏訪湖" },
    ],
  },
  {
    id: "day6",
    order_num: 6,
    date: "8/31（一）",
    title: "D6：諏訪湖散策 ➔ 返回名古屋",
    hotel: "🏨 宿：名古屋（第 1 晚，建議住：榮商圈或名古屋站周邊）",
    items: [
      { period: "上午", category: "spot", text: "諏訪湖畔散步、體驗足湯、參觀諏訪大社。", map_query: "諏訪大社" },
      { period: "下午", category: "transport", text: "搭乘 JR 特急 Shinano（信濃號）直達返回名古屋。", map_query: "名古屋駅" },
      { period: "傍晚/晚上", category: "spot", text: "前往 榮商圈 購物，登上 綠洲 21（Oasis 21）欣賞名古屋電視塔夜景。", map_query: "オアシス21" },
      { period: "晚餐", category: "food", text: "品嚐名古屋地雞手羽先（世界之山）或鰻魚飯三吃。", map_query: "世界の山ちゃん 名古屋" },
    ],
  },
  {
    id: "day7",
    order_num: 7,
    date: "9/01（二）",
    title: "D7：名古屋市區深度一日遊",
    hotel: "🏨 宿：名古屋（第 2 晚）",
    items: [
      { period: "全日", category: "spot", text: "參觀 名古屋城（本丸御殿）、熱田神宮，或前往大須商店街漫步採購。", map_query: "名古屋城" },
      { period: "晚餐", category: "food", text: "山本屋總本家味噌鍋燒烏龍麵或矢場豚味噌豬排。", map_query: "山本屋総本家" },
    ],
  },
  {
    id: "day8",
    order_num: 8,
    date: "9/02（三）",
    title: "D8：名古屋市區最後採買 ➔ 返台",
    hotel: "",
    items: [
      { period: "白天", category: "spot", text: "名鐵百貨 / 名古屋站周邊採買伴手禮與藥妝。", map_query: "名鉄百貨店 名古屋" },
      { period: "18:30前", category: "transport", text: "搭乘名鐵特急（μ-SKY）抵達中部國際機場。", map_query: "中部国際空港" },
      { period: "21:00", category: "transport", text: "搭乘航班順利返台。", map_query: "中部国際空港" },
    ],
  },
];
