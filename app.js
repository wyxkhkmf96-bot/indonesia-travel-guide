const days = [
  {
    date: "09.27 · SUN",
    title: "抵达东爪哇",
    short: "泗水",
    route: "上海浦东 → 短转机 → 泗水机场 → 市区酒店",
    main: "落地、休息、准备 Java 段",
    accent: "#f27052",
    camera: ["12%", "7%", 1.24],
    node: ["32%", "52%"],
    photos: [
      ["assets/indonesia/bromo.jpg", "EAST JAVA · 抵达火山岛", "东爪哇火山景观"],
      ["assets/maps/daily/day-01.jpg", "DAY 01 ROUTE", "第一天飞抵泗水路线地图"]
    ],
    schedule: [
      ["上午", "上海浦东出发", "一次短转机，行李直挂；目标转机 2—4 小时、总时长 10—14 小时。"],
      ["16:00—20:00", "抵达泗水", "入境、取行李、少量取现，司机在到达厅举牌接机。"],
      ["落地后 90min", "入住，不再赶路", "酒店吃熟食，确认第二天 07:00 Java 包车。"],
      ["22:30 前", "整理瀑布装备", "防滑鞋、速干衣和防水袋单独装小包。"]
    ],
    hotel: ["Mövenpick Surabaya City", "到达日优先睡眠和接车便利，不追求景区氛围。", "约 ¥900—1,400", "备选：Four Points by Sheraton Surabaya, Pakuwon Indah"],
    notice: "只买一张联程票。落地延误也不要继续赶四小时山路；泗水过夜是为了把瀑布体力留足。",
    cost: ["¥1,100—1,800", "接机、餐饮与两间房"]
  },
  {
    date: "09.28 · MON",
    title: "赛武瀑布大日",
    short: "赛武",
    route: "泗水 → Tumpak Sewu → Kapas Biru → 布罗莫",
    main: "观景台 + 峡谷徒步 + 双瀑布",
    accent: "#80c68e",
    camera: ["7%", "5%", 1.36],
    node: ["35%", "58%"],
    photos: [
      ["assets/indonesia/scenes/tumpak-sewu.jpg", "TUMPAK SEWU · 环形水帘", "赛武瀑布环形水帘"],
      ["assets/indonesia/scenes/kapas-biru.jpg", "KAPAS BIRU · 密林高瀑", "Kapas Biru蓝棉瀑布"]
    ],
    schedule: [
      ["07:00", "泗水酒店出发", "早餐打包，专车前往赛武瀑布，预计 3.5—4.5 小时。"],
      ["11:30", "赛武观景台 + 谷底", "先看全景，再按天气和体力决定是否下谷；谷底约 2—3 小时。"],
      ["14:30", "Kapas Biru", "水位安全、没有失温迹象才加走；天气转差就返回。"],
      ["16:00—20:00", "前往布罗莫", "车程约 4 小时，途中晚饭；入住后不再夜游。"]
    ],
    hotel: ["Jiwa Jawa Resort Bromo", "火山脚下的木石设计，第二天进入布罗莫更顺。", "约 ¥1,600—2,400", "备选：Plataran Bromo / Lava View Lodge"],
    notice: "谷底湿滑，必须穿抓地鞋并跟当地向导；连续降雨或水位过高时，只看观景台，不下谷。",
    cost: ["¥1,400—1,900", "包车、向导、门票与餐饮"]
  },
  {
    date: "09.29 · TUE",
    title: "布罗莫火山",
    short: "布罗莫",
    route: "火山观景台 → 沙海 → 火山口 → 外南梦",
    main: "吉普穿越、沙海、火山口徒步",
    accent: "#e5a756",
    camera: ["2%", "4%", 1.48],
    node: ["38%", "57%"],
    photos: [
      ["assets/indonesia/scenes/bromo-sunrise.jpg", "BROMO · 火山晨光", "布罗莫火山晨光"],
      ["assets/indonesia/scenes/bromo-sea-of-sand.jpg", "SEA OF SAND · 吉普穿越", "布罗莫沙海吉普车"]
    ],
    schedule: [
      ["07:00", "酒店早餐", "这天不凌晨出发，睡够后再进入火山景区。"],
      ["08:30", "吉普穿越沙海", "先到开阔观景位，再进入火山沙海拍摄。"],
      ["10:30", "徒步布罗莫火山口", "步行与台阶合计约 1.5—2 小时，按风向停留。"],
      ["13:00—20:00", "横穿东爪哇到外南梦", "途中午餐，傍晚抵达；为伊真凌晨行程提前休息。"]
    ],
    hotel: ["Kokoon Hotel Banyuwangi", "房间稳定、餐饮方便，适合作为伊真前的功能型好酒店。", "约 ¥800—1,300", "备选：Dialoog Banyuwangi"],
    notice: "不用不安全的马匹代步；火山口风大且有硫味，若景区发布关闭或预警，立即执行替代安排。",
    cost: ["¥1,200—1,700", "吉普、门票、包车与餐饮"]
  },
  {
    date: "09.30 · WED",
    title: "唯一一次凌晨：伊真蓝火",
    short: "伊真",
    route: "外南梦 → 伊真 → 吉打邦 → 吉利马努克 → 洛维纳",
    main: "蓝火、火山湖、轮渡穿越",
    accent: "#59a8f2",
    camera: ["-4%", "4%", 1.62],
    node: ["42%", "60%"],
    photos: [
      ["assets/indonesia/scenes/ijen-blue-fire.jpg", "IJEN · 蓝色火焰", "伊真火山蓝火"],
      ["assets/indonesia/scenes/ijen-crater.jpg", "CRATER LAKE · 火山湖", "伊真火山湖"]
    ],
    schedule: [
      ["00:30", "酒店出发", "这是全程唯一一次凌晨起床；车上补眠。"],
      ["02:00", "登山口开始徒步", "看蓝火后等待天亮，再看硫磺湖；全程约 4—5 小时。"],
      ["07:30", "下山、早餐、换衣", "洗净硫磺灰，补水补碳水，不继续加景点。"],
      ["10:30—16:00", "轮渡进入巴厘岛", "吉打邦上船，经吉利马努克前往洛维纳。"]
    ],
    hotel: ["The Damai Lovina", "藏在山坡里的设计型度假村，适合蓝火之后彻底恢复。", "约 ¥1,900—2,500", "备选：The Lovina Bali Resort"],
    notice: "出发前 3 天内准备适合登山的健康证明。胸闷、哮喘、风向恶化或硫磺浓度过高时立即返回。",
    cost: ["¥1,650—2,150", "向导、防护、轮渡、接驳与餐饮"]
  },
  {
    date: "10.01 · THU",
    title: "北巴厘岛穿越",
    short: "金塔马尼",
    route: "洛维纳 → 金塔马尼 → Leke Leke → 乌布",
    main: "火山景观午餐、轻徒步、酒店恢复",
    accent: "#d8ef76",
    camera: ["-9%", "3%", 1.82],
    node: ["46%", "59%"],
    photos: [
      ["assets/indonesia/scenes/kintamani-akasa-lunch.jpg", "AKASA · 巴图尔火山午餐", "金塔马尼巴图尔火山景观餐厅"],
      ["assets/indonesia/scenes/leke-leke-pexels-v2.jpg", "LEKE LEKE · 雨林瀑布", "Leke Leke雨林瀑布"]
    ],
    schedule: [
      ["09:00", "洛维纳慢早餐", "蓝火后的恢复上午，不安排追海豚或额外早起。"],
      ["11:30", "AKASA 景观午餐", "面对巴图尔火山和火山湖，提前预约靠景观侧位置。"],
      ["14:30", "Leke Leke 轻徒步", "往返约 60—90 分钟；状态不好就在咖啡区休息。"],
      ["17:30", "入住乌布两晚", "泡泳池或 SPA，当晚不再外出赶网红餐厅。"]
    ],
    hotel: ["Dinara Ubud", "设计感与绿意平衡，连续住两晚减少收拾行李。", "约 ¥1,800—2,400", "备选：Adiwana Unagi Suites"],
    notice: "这天定位为恢复日。景观午餐和瀑布之间不再加远距离景点，避免蓝火后的疲劳累积。",
    cost: ["¥950—1,500", "包车、午餐、门票与餐饮；酒店另计"]
  },
  {
    date: "10.02 · FRI",
    title: "乌布行动日",
    short: "乌布",
    route: "乌布 → ATV 山谷 → Saba 黑沙滩 → 乌布",
    main: "ATV、黑沙滩、SPA",
    accent: "#f2a65a",
    camera: ["-12%", "5%", 2.02],
    node: ["48%", "61%"],
    photos: [
      ["assets/indonesia/scenes/ubud-valley.jpg", "UBUD · 山谷越野", "乌布山谷景观"],
      ["assets/indonesia/scenes/saba-beach.jpg", "SABA · 黑沙海岸", "Saba黑沙滩"]
    ],
    schedule: [
      ["08:00", "酒店早餐后出发", "穿可弄脏的速干衣和包脚鞋。"],
      ["09:30", "ATV 山谷路线", "选正规运营商和小团，含头盔、向导、淋浴与保险。"],
      ["13:00", "午餐、回酒店洗澡", "补水和休息，避免把项目排成连续赶场。"],
      ["16:00", "Saba 黑沙滩 + SPA", "只在岸边拍照看日落，不在浪大时下水。"]
    ],
    hotel: ["Dinara Ubud", "原酒店续住，不换房；这晚把体力恢复到海岛段。", "约 ¥1,800—2,400", "备选：Adiwana Unagi Suites"],
    notice: "ATV 不竞速、不脱队；确认保险范围。黑沙滩离岸流明显，水性一般不要进入腰线以上海水。",
    cost: ["¥1,400—2,200", "ATV、包车、SPA 与餐饮"]
  },
  {
    date: "10.03 · SAT",
    title: "精灵坠崖",
    short: "佩尼达",
    route: "乌布 → Sanur → Nusa Penida 西线 → Sanur",
    main: "精灵坠崖、Broken Beach、可控浮潜",
    accent: "#49c3c0",
    camera: ["-15%", "8%", 2.13],
    node: ["50%", "64%"],
    photos: [
      ["assets/indonesia/scenes/kelingking.jpg", "KELINGKING · 精灵坠崖", "佩尼达岛精灵坠崖"],
      ["assets/indonesia/scenes/broken-beach.jpg", "BROKEN BEACH · 海蚀拱门", "佩尼达岛破碎沙滩"]
    ],
    schedule: [
      ["06:20", "乌布出发去 Sanur", "快船前 45—60 分钟到码头，带晕船药。"],
      ["09:30", "精灵坠崖观景台", "只看顶部主景，不下危险陡梯到海滩。"],
      ["11:30", "Broken Beach + Angel's Billabong", "午餐后看海况；湿滑边缘不靠近。"],
      ["14:00—17:30", "可控浮潜 / 返回 Sanur", "穿救生衣，海况差就取消浮潜并提前返航。"]
    ],
    hotel: ["ARTOTEL Sanur Bali", "码头与机场之间的位置适合第二天飞科莫多，设计感也在线。", "约 ¥1,700—2,400", "备选：Akana Boutique Hotel"],
    notice: "精灵坠崖只在顶部观景。浮潜必须说明水性一般、全程救生衣；浪大或流急就留在船上。",
    cost: ["¥1,650—2,400", "快船、岛上包车、浮潜与餐饮"]
  },
  {
    date: "10.04 · SUN",
    title: "飞往科莫多",
    short: "拉布安巴焦",
    route: "Sanur → 登巴萨机场 → Labuan Bajo",
    main: "境内飞行、海湾日落、确认船期",
    accent: "#e57d63",
    camera: ["-22%", "7%", 2.05],
    node: ["57%", "62%"],
    photos: [
      ["assets/indonesia/scenes/labuan-bajo.jpg", "LABUAN BAJO · 海湾日落", "拉布安巴焦海湾"],
      ["assets/maps/daily/day-08.jpg", "DAY 08 ROUTE", "巴厘岛飞往拉布安巴焦路线地图"]
    ],
    schedule: [
      ["08:30", "Sanur 早餐退房", "酒店叫车，预留巴厘岛周末交通时间。"],
      ["10:30", "抵达 DPS 机场", "境内航班也至少提前 2 小时；托运行李确认额度。"],
      ["13:00—14:15", "DPS → LBJ", "这是全程唯一一段境内飞机。"],
      ["16:00", "入住、看海湾日落", "与船方确认次日接送、天气、救生衣和返港时间。"]
    ],
    hotel: ["Loccal Collection Hotel Komodo", "白色洞穴建筑和海湾视野很出片，连住两晚。", "约 ¥2,100—2,500", "备选：Sudamala Resort Komodo"],
    notice: "必须选上午或中午航班，为延误留余量。飞机落地前不要安排不可退的当日下午船程。",
    cost: ["¥1,050—2,400", "接送、机票与餐饮；酒店另计"]
  },
  {
    date: "10.05 · MON",
    title: "科莫多主场",
    short: "科莫多",
    route: "Labuan Bajo → Padar → Pink Beach → Komodo → Taka / Manta",
    main: "火山地貌、粉色沙滩、科莫多龙、浮潜",
    accent: "#f38b8e",
    camera: ["-27%", "7%", 2.23],
    node: ["60%", "62%"],
    photos: [
      ["assets/indonesia/padar.jpg", "PADAR · 火山海湾", "帕达尔岛火山海湾"],
      ["assets/indonesia/pink_beach.jpg", "PINK BEACH · 粉色海岸", "科莫多粉色沙滩"]
    ],
    schedule: [
      ["05:50", "酒店接送到码头", "快艇小团出海，早餐打包，穿防晒衣。"],
      ["08:00", "Padar Island", "清晨走阶梯看三湾地貌；不抢日出最拥挤时段。"],
      ["10:30", "粉沙 + 科莫多龙", "粉沙滩拍照浮潜；上岛后全程跟巡护员。"],
      ["14:00—17:00", "Taka Makassar / Manta Point", "看海况选择点位，傍晚回到拉布安巴焦。"]
    ],
    hotel: ["Loccal Collection Hotel Komodo", "科莫多主场后原酒店续住，回程前不再搬行李。", "约 ¥2,100—2,500", "备选：Sudamala Resort Komodo"],
    notice: "蝠鲼出现靠运气。流大时直接留船；遇到科莫多龙不脱队、不投喂，与巡护员保持同一线路。",
    cost: ["¥2,600—4,300", "小团快艇、国家公园费用、餐饮"]
  },
  {
    date: "10.06 · TUE",
    title: "从科莫多直接回家",
    short: "回家",
    route: "Labuan Bajo → Singapore → Shanghai Pudong",
    main: "开口返程，不走回头路",
    accent: "#d8ef76",
    camera: ["-8%", "-2%", 1.02],
    node: ["72%", "42%"],
    photos: [
      ["assets/indonesia/scenes/labuan-bajo.jpg", "FAREWELL · 海湾清晨", "拉布安巴焦海湾清晨"],
      ["assets/maps/daily/day-10.jpg", "OPEN-JAW ROUTE · 直接回家", "科莫多经新加坡回上海路线地图"]
    ],
    schedule: [
      ["起飞前 3h", "酒店出发去 LBJ", "退房前再次确认行李直挂上海。"],
      ["白天", "LBJ → SIN", "优先同一订单联程；若班表不可行，改经雅加达。"],
      ["转机 2—5h", "新加坡机场转机", "不入境、不重新托运，留出用餐和延误缓冲。"],
      ["夜间", "SIN → PVG", "旅程在科莫多收尾，不为了回程航班折返巴厘岛。"]
    ],
    hotel: ["今晚回家", "不再安排印尼住宿；联程票减少提取行李和误机风险。", "住宿 ¥0", "若拆票，必须预留至少 7 小时且自行承担风险"],
    notice: "只选择同一订单的通程机票。若必须分票，需重新入境、取行李和托运，不建议用短转机冒险。",
    cost: ["¥300—600", "送机与餐饮；国际机票另计"]
  }
];

const elements = {
  story: document.querySelector("#day-story"),
  date: document.querySelector("#day-date"),
  title: document.querySelector("#day-title"),
  route: document.querySelector("#day-route"),
  main: document.querySelector("#day-main"),
  schedule: document.querySelector("#schedule"),
  primary: document.querySelector("#photo-primary"),
  primaryCaption: document.querySelector("#photo-primary-caption"),
  secondary: document.querySelector("#photo-secondary"),
  secondaryCaption: document.querySelector("#photo-secondary-caption"),
  hotelName: document.querySelector("#hotel-name"),
  hotelCopy: document.querySelector("#hotel-copy"),
  hotelPrice: document.querySelector("#hotel-price"),
  hotelBackup: document.querySelector("#hotel-backup"),
  notice: document.querySelector("#day-notice"),
  cost: document.querySelector("#day-cost"),
  costNote: document.querySelector("#day-cost-note"),
  current: document.querySelector("#scene-current"),
  rail: document.querySelector("#day-rail"),
  nodes: document.querySelector("#route-nodes"),
  map: document.querySelector("#map-rig")
};

let activeDay = 0;
let wheelLocked = false;
let touchStart = null;

function buildControls() {
  days.forEach((day, index) => {
    const railButton = document.createElement("button");
    railButton.className = "rail-button";
    railButton.type = "button";
    railButton.textContent = String(index + 1).padStart(2, "0");
    railButton.dataset.label = day.short;
    railButton.setAttribute("aria-label", `第${index + 1}天：${day.title}`);
    railButton.addEventListener("click", () => setDay(index));
    elements.rail.appendChild(railButton);

    const node = document.createElement("div");
    node.className = "route-node";
    node.style.setProperty("--x", day.node[0]);
    node.style.setProperty("--y", day.node[1]);
    node.innerHTML = `<span>${String(index + 1).padStart(2, "0")} ${day.short}</span>`;
    elements.nodes.appendChild(node);
  });
}

function updateContent(day) {
  elements.date.textContent = day.date;
  elements.title.textContent = day.title;
  elements.route.textContent = day.route;
  elements.main.textContent = day.main;
  elements.primary.src = day.photos[0][0];
  elements.primary.alt = day.photos[0][2];
  elements.primaryCaption.textContent = day.photos[0][1];
  elements.secondary.src = day.photos[1][0];
  elements.secondary.alt = day.photos[1][2];
  elements.secondaryCaption.textContent = day.photos[1][1];
  elements.schedule.innerHTML = day.schedule.map(item => `
    <li>
      <time>${item[0]}</time>
      <div><b>${item[1]}</b><p>${item[2]}</p></div>
    </li>
  `).join("");
  elements.hotelName.textContent = day.hotel[0];
  elements.hotelCopy.textContent = day.hotel[1];
  elements.hotelPrice.textContent = day.hotel[2];
  elements.hotelBackup.textContent = day.hotel[3];
  elements.notice.textContent = day.notice;
  elements.cost.textContent = day.cost[0];
  elements.costNote.textContent = day.cost[1];
  elements.current.textContent = String(activeDay + 1).padStart(2, "0");
}

function updateStage(day) {
  document.documentElement.style.setProperty("--day-accent", day.accent);
  document.documentElement.style.setProperty("--camera-x", day.camera[0]);
  document.documentElement.style.setProperty("--camera-y", day.camera[1]);
  document.documentElement.style.setProperty("--camera-scale", day.camera[2]);
  elements.map.style.setProperty("--active-x", day.node[0]);
  elements.map.style.setProperty("--active-y", day.node[1]);

  [...elements.rail.children].forEach((button, index) => {
    button.classList.toggle("active", index === activeDay);
    button.classList.toggle("passed", index < activeDay);
    button.setAttribute("aria-current", index === activeDay ? "step" : "false");
  });
  [...elements.nodes.children].forEach((node, index) => {
    node.classList.toggle("active", index === activeDay);
    node.classList.toggle("passed", index < activeDay);
  });
}

function setDay(index, immediate = false) {
  const next = Math.max(0, Math.min(days.length - 1, index));
  if (next === activeDay && !immediate) return;
  activeDay = next;

  if (immediate) {
    updateContent(days[activeDay]);
    updateStage(days[activeDay]);
    return;
  }

  elements.story.classList.add("is-changing");
  window.setTimeout(() => {
    updateContent(days[activeDay]);
    updateStage(days[activeDay]);
    elements.story.scrollTop = 0;
    requestAnimationFrame(() => elements.story.classList.remove("is-changing"));
  }, 260);
}

function enterExperience() {
  document.body.classList.remove("intro-open");
  window.setTimeout(() => setDay(activeDay, true), 250);
}

document.querySelector("#start-button").addEventListener("click", enterExperience);
document.querySelector("#back-home").addEventListener("click", event => {
  event.preventDefault();
  document.body.classList.add("intro-open");
});

const planning = document.querySelector("#planning");
document.querySelector("#plan-button").addEventListener("click", () => {
  planning.classList.add("open");
  planning.setAttribute("aria-hidden", "false");
});
document.querySelector("#planning-close").addEventListener("click", () => {
  planning.classList.remove("open");
  planning.setAttribute("aria-hidden", "true");
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && planning.classList.contains("open")) {
    planning.classList.remove("open");
    planning.setAttribute("aria-hidden", "true");
    return;
  }
  if (document.body.classList.contains("intro-open")) {
    if (event.key === "Enter" || event.key === " ") enterExperience();
    return;
  }
  if (planning.classList.contains("open")) return;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") setDay(activeDay + 1);
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") setDay(activeDay - 1);
});

window.addEventListener("wheel", event => {
  if (document.body.classList.contains("intro-open") || planning.classList.contains("open")) return;
  if (window.innerWidth < 721 && elements.story.scrollHeight > elements.story.clientHeight) return;
  event.preventDefault();
  if (wheelLocked || Math.abs(event.deltaY) < 12) return;
  wheelLocked = true;
  setDay(activeDay + (event.deltaY > 0 ? 1 : -1));
  window.setTimeout(() => { wheelLocked = false; }, 850);
}, { passive: false });

window.addEventListener("touchstart", event => {
  touchStart = event.changedTouches[0].clientX;
}, { passive: true });

window.addEventListener("touchend", event => {
  if (touchStart === null || planning.classList.contains("open")) return;
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 55) setDay(activeDay + (distance < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

buildControls();
setDay(0, true);
