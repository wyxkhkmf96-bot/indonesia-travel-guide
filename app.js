const days = [
  {
    tab:'抵达泗水',date:'DAY 01 · 09.28 MON',title:'上海出发，抵达东爪哇',route:'上海浦东 → 泗水朱安达机场 → 市区酒店',energy:'低\n恢复日',cost:'¥4,850—6,500',hotel:'Mövenpick Surabaya City',hotelPrice:'两间约 ¥900—1,400',safety:'落地后不再赶 4 小时山路；第一晚必须睡在泗水。',
    agenda:[['上午','上海浦东出发','接受 1 次转机，优先行李直挂、总时长 10—14 小时。'],['16:00—20:00','抵达泗水','入境、取行李、ATM 小额取现；司机举姓名牌接机。'],['落地后 90min','酒店入住','只在酒店附近吃熟食，和 Java 团确认次日 07:00 接车。'],['22:30 前','睡觉','整理瀑布防滑鞋和速干衣，主箱留车上。']],
    points:[['上海',121.805,31.144],['泗水机场',112.787,-7.379],['泗水酒店',112.735,-7.289]],segments:['flight','road'],photos:[['bromo.jpg','明天开始进入东爪哇火山带'],['tumpak-sewu.jpg','先瀑布，后火山'],['ijen-blue-fire.jpg','全程唯一凌晨留给伊真']]
  },
  {
    tab:'赛武瀑布',date:'DAY 02 · 09.29 TUE',title:'赛武瀑布，住进布罗莫脚下',route:'泗水 → Tumpak Sewu → Blue Cotton → Bromo',energy:'高\n湿滑徒步',cost:'¥1,400—1,900',hotel:'Jiwa Jawa Resort Bromo',hotelPrice:'两间约 ¥1,600—2,400（Java团可含）',safety:'瀑布峡谷湿滑；只跟持证当地向导，下暴雨或上游涨水立即取消。',
    agenda:[['07:00','泗水酒店出发','早餐打包，专车约 3.5—4.5 小时到瀑布。'],['11:30','赛武观景台 + 谷底','先看体力再下谷；戴头盔，手机进防水袋。'],['14:30','Blue Cotton 瀑布','只在水位安全时加走，身体发冷就直接撤。'],['16:00—20:00','前往布罗莫','车程约 4 小时；途中吃晚饭，到酒店后不加夜游。']],
    points:[['泗水',112.735,-7.289],['赛武瀑布',112.917,-8.230],['Blue Cotton',112.920,-8.215],['布罗莫',112.953,-7.943]],segments:['road','road','road'],photos:[['tumpak-sewu.jpg','Tumpak Sewu · 环形水帘'],['bromo.jpg','Jiwa Jawa · 火山脚下睡一晚'],['tumpak-sewu.jpg','峡谷路滑，天气决定是否下谷']]
  },
  {
    tab:'布罗莫',date:'DAY 03 · 09.30 WED',title:'不追日出，也能看懂布罗莫',route:'Bromo 观景台 → 沙海 → 火山口 → Banyuwangi',energy:'中高\n长车程',cost:'¥1,200—1,700',hotel:'Kokoon Hotel Banyuwangi',hotelPrice:'两间约 ¥800—1,300（Java团可含）',safety:'不骑无保护的马、不靠近火山口护栏；火山警戒升级就取消登口。',
    agenda:[['07:00','正常起床吃早餐','这是为了把全程凌晨起床次数控制在一次。'],['08:30','吉普进入布罗莫','先去视野好的观景点，再进沙海；避开日出车流。'],['10:30','步行至火山口','风沙大时戴 N95；台阶按自己的节奏走。'],['13:00—20:00','横穿东爪哇去外南梦','约 6—7 小时；途中午晚餐，抵达后开 3 日内健康证明。']],
    points:[['布罗莫酒店',112.953,-7.943],['观景台',112.950,-7.907],['火山口',112.950,-7.942],['外南梦',114.369,-8.219]],segments:['road','road','road'],photos:[['bromo.jpg','布罗莫 · 日出后依然壮阔'],['bromo.jpg','沙海吉普环线'],['ijen-blue-fire.jpg','今晚为伊真准备装备']]
  },
  {
    tab:'伊真蓝火',date:'DAY 04 · 10.01 THU',title:'唯一一次凌晨：伊真蓝火',route:'Banyuwangi → Ijen → Ketapang → Gilimanuk → Lovina',energy:'高\n凌晨徒步',cost:'¥1,650—2,150',hotel:'The Damai Lovina',hotelPrice:'两间约 ¥1,900—2,500',safety:'官方要求 3 日内健康证明；硫磺浓度高、头晕恶心或风向不利，立即折返。',
    agenda:[['00:30','酒店出发','带健康证明、头灯、防滑鞋、外套和合格防毒面具。'],['02:00','从 Paltuding 登山口进入','跟向导慢走；蓝火能否进入由现场管制与风向决定。'],['07:30','下山吃早餐','洗脸换衣，不穿带硫磺味的外套进入车厢。'],['10:30—16:00','轮渡进入巴厘岛','Ketapang→Gilimanuk 约1小时，再包车约2.5小时到 Lovina。']],
    points:[['外南梦',114.369,-8.219],['伊真火山',114.242,-8.058],['吉打邦港',114.402,-8.160],['吉利马努克',114.437,-8.165],['洛维纳',115.024,-8.161]],segments:['road','road','boat','road'],photos:[['ijen-blue-fire.jpg','伊真蓝火 · 受风向和管制影响'],['ijen-blue-fire.jpg','10/1 进入，避开 10/2 官方关闭'],['bromo.jpg','火山后去 Lovina 完整休息']]
  },
  {
    tab:'北巴厘→乌布',date:'DAY 05 · 10.02 FRI',title:'火山后的恢复型穿越',route:'Lovina → Kintamani → Leke Leke → Ubud',energy:'中\n轻徒步',cost:'¥950—1,500',hotel:'Dinara Ubud',hotelPrice:'两间约 ¥1,800—2,400',safety:'不安排凌晨追海豚；今天睡够再走，司机连续驾驶需明确休息。',
    agenda:[['09:00','自然醒 + 酒店早餐','取消参考路线的日出海豚，避免第二次凌晨。'],['11:30','Kintamani 火山景观午餐','选面向 Batur 火山的咖啡馆，天气差就缩短停留。'],['14:30','Leke Leke 瀑布','往返约 60—90 分钟，雨后不穿拖鞋。'],['17:30','抵达乌布','入住两晚；酒店晚餐或 SPA，不去拥挤夜店。']],
    points:[['洛维纳',115.024,-8.161],['金塔马尼',115.354,-8.245],['Leke Leke',115.133,-8.330],['乌布',115.263,-8.506]],segments:['road','road','road'],photos:[['batur.jpg','金塔马尼远眺 Batur'],['jatiluwih.jpg','北巴厘山谷公路'],['ubud_temple.jpg','傍晚抵达乌布']]
  },
  {
    tab:'乌布行动日',date:'DAY 06 · 10.03 SAT',title:'乌布不是缓冲，是行动日',route:'Ubud → ATV → Saba 黑沙滩 → Ubud',energy:'中高\nATV',cost:'¥1,400—2,200',hotel:'Dinara Ubud',hotelPrice:'同房连住 · 两间约 ¥1,800—2,400',safety:'ATV 必须戴全盔并试刹车；拒绝无保险、混行公路或让游客竞速的运营商。',
    agenda:[['08:00','早餐后出发','不塞王宫与市场的泛景点，把时间留给体验。'],['09:30','ATV 山谷线','选 90—120 分钟小团；穿包脚鞋、长裤，手机固定。'],['13:00','乌布午餐 + 回酒店洗澡','不湿衣乘车，休息 1 小时。'],['16:00','Saba 黑沙滩 + SPA','看落日，不下浪；晚餐后整理佩尼达一日小包。']],
    points:[['乌布',115.263,-8.506],['ATV山谷',115.279,-8.451],['Saba黑沙滩',115.298,-8.604],['乌布',115.263,-8.506]],segments:['road','road','road'],photos:[['ubud_temple.jpg','乌布作为两晚稳定基地'],['tegallalang.jpg','ATV 选有保险的小团'],['jatiluwih.jpg','山谷与稻田地貌']]
  },
  {
    tab:'精灵坠崖',date:'DAY 07 · 10.04 SUN',title:'佩尼达西线，当天往返',route:'Ubud → Sanur → Nusa Penida 西线 → Sanur',energy:'中高\n船+盘山路',cost:'¥1,650—2,400',hotel:'ARTOTEL Sanur',hotelPrice:'两间约 ¥1,700—2,400',safety:'精灵坠崖只在上方观景，不下陡坡；晕船药遵医嘱，返程不抢最后一班船。',
    agenda:[['06:20','乌布出发去 Sanur','行李送当晚酒店寄存；提前 45 分钟到码头。'],['09:30','Kelingking 精灵坠崖','只走护栏内观景位，不为照片跨越悬崖边。'],['11:30','Broken Beach + Angel’s Billabong','涨潮和大浪时不进入天然池。'],['14:00—17:30','可控浮潜 + 返岛','水流合适才下水；回 Sanur 入住，不再跨区。']],
    points:[['乌布',115.263,-8.506],['Sanur港',115.263,-8.690],['精灵坠崖',115.474,-8.751],['Broken Beach',115.450,-8.733],['Sanur',115.263,-8.690]],segments:['road','boat','road','boat'],photos:[['kelingking.jpg','Kelingking · 只看上方观景台'],['kelingking.jpg','佩尼达西线当天往返'],['manta.jpg','水流合适才浮潜']]
  },
  {
    tab:'飞科莫多',date:'DAY 08 · 10.05 MON',title:'先飞到，再谈出海',route:'Sanur → DPS → Labuan Bajo',energy:'低\n缓冲日',cost:'¥1,900—3,000',hotel:'Loccal Collection Komodo',hotelPrice:'两间约 ¥2,100—2,500',safety:'必须搭上午/中午航班；当天不订不能退的出海或日落船。',
    agenda:[['08:30','酒店早餐 + 退房','主行李正常托运，移动电源随身。'],['10:30','提前 2.5 小时到 DPS','境内航班也不压缩机场时间。'],['13:00—14:15','DPS 直飞 LBJ','选不晚于 14:00 起飞的班次，延误仍有缓冲。'],['16:00','入住 + 看海湾日落','向船方复核次日接车、路线、救生衣、费用与天气。']],
    points:[['Sanur',115.263,-8.690],['巴厘机场',115.167,-8.748],['拉布安巴焦',119.889,-8.496]],segments:['road','flight'],photos:[['labuan_bajo.jpg','Labuan Bajo · 出海前完整住一晚'],['padar.jpg','明天才是科莫多主场'],['komodo_dragon.jpg','先确认 ranger 与园区费']]
  },
  {
    tab:'科莫多大日',date:'DAY 09 · 10.06 TUE',title:'帕达尔、粉沙与史前巨兽',route:'LBJ → Padar → Pink Beach → Komodo → Taka/Manta → LBJ',energy:'高\n出海+登山',cost:'¥2,600—4,300',hotel:'Loccal Collection Komodo',hotelPrice:'同房连住 · 两间约 ¥2,100—2,500',safety:'看到蝠鲼是运气，下水是选择；强流时全员留船上。科莫多龙必须始终跟 ranger。',
    agenda:[['05:50','酒店接车去码头','快艇小团 06:30 前后出发；检查救生衣和天气。'],['08:00','Padar 登顶','按体力到中段或顶端；每人 1L 水，烈日下不硬撑。'],['10:30','Pink Beach + Komodo National Park','先粉沙，后跟 ranger 看龙；不跑、不蹲近拍。'],['14:00—17:00','Taka Makassar / Manta Point','只在低流速穿救生衣下水；返港后完整住一晚。']],
    points:[['拉布安巴焦',119.889,-8.496],['Padar',119.592,-8.655],['粉色沙滩',119.548,-8.603],['科莫多',119.492,-8.589],['Taka/Manta',119.606,-8.530],['拉布安巴焦',119.889,-8.496]],segments:['boat','boat','boat','boat','boat'],photos:[['padar.jpg','Padar · 当天最强视觉主场'],['pink_beach.jpg','粉色沙滩 · 不带走沙子'],['komodo_dragon.jpg','跟 ranger 观察科莫多龙']]
  },
  {
    tab:'返程缓冲',date:'DAY 10 · 10.07 WED',title:'两段飞行，把缓冲留够',route:'Labuan Bajo → Bali → Shanghai',energy:'中\n飞行日',cost:'¥9,300—19,500',hotel:'返上海',hotelPrice:'若转机间隔 <7小时：加住巴厘岛1晚',safety:'分开出票必须预留至少 7 小时并重新托运行李；国际段起飞前 3 小时到值机柜台。',
    agenda:[['06:30','酒店退房去 LBJ','选当天最早一档 LBJ→DPS，避免天气延误吞掉缓冲。'],['08:30—09:45','飞抵巴厘岛','取行李后进入国际出发流程，不安排购物或跨区。'],['至少 7H','自转缓冲','若实售航班做不到，D10 住机场酒店，D11 再直飞上海。'],['晚间','DPS 直飞 PVG','优先吉祥/东航直飞；保险与所有票据保留至回国后。']],
    points:[['拉布安巴焦',119.889,-8.496],['巴厘机场',115.167,-8.748],['上海',121.805,31.144]],segments:['flight','flight'],photos:[['labuan_bajo.jpg','早班离开 Labuan Bajo'],['padar.jpg','不把科莫多出海塞在返程日'],['batur.jpg','巴厘只转机，不再加景点']]
  }
];

const tabs = document.getElementById('dayTabs');
days.forEach((day,index)=>{
  const btn=document.createElement('button');
  btn.className='day-tab';btn.type='button';btn.role='tab';btn.dataset.index=index;
  btn.setAttribute('aria-selected',index===0?'true':'false');
  btn.innerHTML=`<b>${String(index+1).padStart(2,'0')}</b><span>${day.tab}</span>`;
  btn.addEventListener('click',()=>selectDay(index));tabs.appendChild(btn);
});

let indonesiaFeature=null;
const svg=d3.select('#routeMap');
const tooltip=document.getElementById('mapTooltip');
const fmt=n=>'¥'+Math.round(n).toLocaleString('zh-CN');

fetch('assets/maps/countries-50m.json').then(r=>r.json()).then(world=>{
  const countries=topojson.feature(world,world.objects.countries).features;
  indonesiaFeature=countries.find(d=>String(d.id)==='360');
  renderMap(days[0]);
}).catch(()=>renderMap(days[0]));

function selectDay(index){
  const day=days[index];
  [...tabs.children].forEach((b,i)=>b.setAttribute('aria-selected',i===index?'true':'false'));
  document.getElementById('mapDay').textContent=`DAY ${String(index+1).padStart(2,'0')}`;
  document.getElementById('mapTitle').textContent=`第 ${index+1} 天路线图 · ${day.route}`;
  document.getElementById('dayDate').textContent=day.date;
  document.getElementById('dayTitle').textContent=day.title;
  document.getElementById('dayRoute').textContent=day.route;
  document.getElementById('dayEnergy').innerHTML=day.energy.replace('\n','<br>');
  document.getElementById('dayHotel').textContent=day.hotel;
  document.getElementById('dayHotelPrice').textContent=day.hotelPrice;
  document.getElementById('dayCost').textContent=day.cost;
  document.getElementById('daySafety').textContent=day.safety;
  document.getElementById('agenda').innerHTML=day.agenda.map(a=>`<li><time>${a[0]}</time><div><b>${a[1]}</b><span>${a[2]}</span></div></li>`).join('');
  document.getElementById('photoStrip').innerHTML=day.photos.map((p,i)=>`<figure class="photo"><img src="assets/indonesia/${p[0]}" alt="${p[1]}" loading="lazy"><span>${p[1]}</span></figure>`).join('');
  renderMap(day);
}

function renderMap(day){
  const node=document.getElementById('routeMap');
  const width=node.clientWidth||860,height=node.clientHeight||640;
  svg.attr('viewBox',`0 0 ${width} ${height}`).selectAll('*').remove();
  const coords=day.points.map(p=>[p[1],p[2]]);
  const lineFeature={type:'Feature',geometry:{type:'LineString',coordinates:coords}};
  const collection={type:'FeatureCollection',features:indonesiaFeature?[indonesiaFeature,lineFeature]:[lineFeature]};
  const projection=d3.geoMercator().fitExtent([[65,60],[width-65,height-58]],collection);
  const path=d3.geoPath(projection);
  svg.append('path').datum(d3.geoGraticule10()).attr('class','graticule').attr('d',path);
  if(indonesiaFeature) svg.append('path').datum(indonesiaFeature).attr('class','land').attr('d',path);
  day.segments.forEach((type,i)=>{
    const seg={type:'LineString',coordinates:[coords[i],coords[i+1]]};
    const p=svg.append('path').datum(seg).attr('class',`route-line ${type}`).attr('d',path);
    const len=p.node().getTotalLength();p.attr('stroke-dasharray',`${len} ${len}`).attr('stroke-dashoffset',len).transition().duration(700).delay(i*120).attr('stroke-dashoffset',0).on('end',()=>p.attr('stroke-dasharray',type==='boat'?'8 6':type==='flight'?'2 8':null));
  });
  const labelOffsets=[[9,-12],[9,18],[-10,-13],[10,19],[-10,-13],[10,18]];
  day.points.forEach((p,i)=>{
    const [x,y]=projection([p[1],p[2]]);const g=svg.append('g');
    g.append('circle').attr('class',`map-point ${i===day.points.length-1?'final':''}`).attr('cx',x).attr('cy',y).attr('r',10)
      .on('mouseenter',ev=>showTip(ev,p[0],node)).on('mousemove',ev=>showTip(ev,p[0],node)).on('mouseleave',()=>tooltip.classList.remove('show'));
    g.append('text').attr('class','map-number').attr('x',x).attr('y',y+.5).text(i+1);
    const off=labelOffsets[i%labelOffsets.length];
    g.append('text').attr('class','map-label').attr('x',x+off[0]).attr('y',y+off[1]).attr('text-anchor',off[0]<0?'end':'start').text(p[0]);
  });
}

function showTip(ev,label,node){
  const r=node.getBoundingClientRect();tooltip.textContent=label;tooltip.style.left=`${ev.clientX-r.left}px`;tooltip.style.top=`${ev.clientY-r.top}px`;tooltip.classList.add('show');
}

function updateCalc(){
  const ret=+document.getElementById('returnFare').value;
  const dom=+document.getElementById('domesticFare').value;
  const hotel=+document.getElementById('hotelFare').value;
  document.getElementById('returnOut').textContent=fmt(ret);
  document.getElementById('domesticOut').textContent=fmt(dom);
  document.getElementById('hotelOut').textContent=fmt(hotel);
  const flights=(1509+ret+dom)*3;
  const total=flights+hotel*6+5500+13200;
  document.getElementById('tripTotal').textContent=fmt(total);
  const ratio=flights/total;
  document.getElementById('buyVerdict').textContent=ratio<.38?'值得买：机票占比健康':ratio<.48?'可以接受：接近价格上沿':'先等等：机票挤压酒店与体验预算';
}
['returnFare','domesticFare','hotelFare'].forEach(id=>document.getElementById(id).addEventListener('input',updateCalc));
window.addEventListener('resize',()=>{const i=[...tabs.children].findIndex(b=>b.getAttribute('aria-selected')==='true');renderMap(days[Math.max(0,i)])});
selectDay(0);updateCalc();
