const postgres = require('postgres');
const sql = postgres(process.env.DIRECT_URL, { prepare: false });

const USER_ID = '457fd357-3f8e-4a11-ad93-6190cec13501'; // chrispinmatiko@gmail.com
const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 9);
const mins = (n) => new Date(Date.now() - n * 60000);
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

async function rls() {
  const t = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=false`;
  for (const r of t) await sql.unsafe(`ALTER TABLE public."${r.tablename}" ENABLE ROW LEVEL SECURITY`);
  if (t.length) console.log('RLS re-enabled:', t.map(x => x.tablename).join(', '));
}

async function main() {
  await rls();

  // account state: real user, onboarded, 3-day trial active
  await sql`
    UPDATE public.users SET
      is_demo_owner = false,
      onboarded = true,
      plan = 'trial',
      subscription_status = 'trialing',
      subscription_plan = null,
      trial_ends_at = now() + interval '3 days',
      updated_at = now()
    WHERE id = ${USER_ID}
  `;

  // clean slate for this user's demo artifacts
  const convIds = (await sql`SELECT id FROM public.conversations WHERE user_id=${USER_ID}`).map(r => r.id);
  if (convIds.length) {
    await sql`DELETE FROM public.messages WHERE conversation_id = ANY(${convIds})`;
    await sql`DELETE FROM public.conversations WHERE user_id=${USER_ID}`;
  }
  await sql`DELETE FROM public.sales WHERE user_id=${USER_ID}`;
  await sql`DELETE FROM public.products WHERE user_id=${USER_ID}`;
  await sql`DELETE FROM public.services WHERE user_id=${USER_ID}`;
  await sql`DELETE FROM public.policies WHERE user_id=${USER_ID}`;

  // ── products ──
  const P = [
    ['p-tecno',  'Tecno Spark 10',     'Phones',      285000, 6,  '📱', '#E3F4E9', ['tecno','spark','phone'],            14],
    ['p-ip11',   'iPhone 11 64GB',     'Phones',      720000, 3,  '📱', '#E2F0F7', ['iphone','apple','11'],               5],
    ['p-redmi',  'Xiaomi Redmi 12',    'Phones',      380000, 0,  '📱', '#FCF0D8', ['redmi','xiaomi'],                    7],
    ['p-anker',  'Anker Fast Charger', 'Accessories',  65000, 12, '🔌', '#EFEAF7', ['charger','anker','fast'],           22],
    ['p-case',   'iPhone 11 Case',     'Accessories',  15000, 25, '🛡️', '#E3F4E9', ['case','cover','iphone'],            31],
    ['p-oraimo', 'Oraimo Earbuds',     'Accessories',  32000, 2,  '🎧', '#FBE8E8', ['earbuds','oraimo','freebud'],        4],
  ];
  for (let i = 0; i < P.length; i++) {
    const [id, name, cat, price, stock, emoji, cl, kw, sold] = P[i];
    await sql`
      INSERT INTO public.products (id,user_id,name,cat,price,stock,emoji,color,keywords,sold,hidden,sort_order)
      VALUES (${id},${USER_ID},${name},${cat},${price},${stock},${emoji},${cl},${sql.json(kw)},${sold},false,${i})
    `;
  }

  // ── services ──
  const S = [
    ['s-screen',  'Screen Replacement',   'Cracked screen? We swap it fast with genuine parts.', 25000, true,  '1–2 hours', false, '30 days'],
    ['s-flash',   'Software Flash',       'Hanging phone or virus? Full software refresh.',       15000, false, '45 minutes', false, '7 days'],
    ['s-battery', 'Battery Replacement',  'Original battery swap with a health check.',           20000, false, '1 hour',    true,  '90 days'],
  ];
  for (const [id, name, desc, price, from, dur, booking, warranty] of S) {
    await sql`
      INSERT INTO public.services (id,user_id,name,"desc",price,price_from,duration,booking,warranty)
      VALUES (${id},${USER_ID},${name},${desc},${price},${from},${dur},${booking},${warranty})
    `;
  }

  // ── policies ──
  await sql`
    INSERT INTO public.policies
      (user_id, delivery_mode, free_over, areas, payments, pay_timing, deposits, receipts, warranty, returns, refunds, hours, out_of_stock_behavior, restock_days, custom)
    VALUES (
      ${USER_ID}, 'paid', 500000,
      ${sql.json([{area:'Kariakoo (pickup)', fee:0, time:'Ready in 1 hour'},{area:'Mikocheni', fee:7000, time:'2–4 hours'},{area:'Posta / CBD', fee:5000, time:'2 hours'}])},
      ${sql.json([{name:'M-Pesa', detail:'0620 184 437'},{name:'Tigo Pesa', detail:'0620 184 437'},{name:'Cash', detail:'Pay at the shop'}])},
      'Pay on delivery or on pickup',
      '50% deposit for repair bookings',
      true,
      ${sql.json([{cat:'Phones', dur:'6 months', not:'Physical damage voids warranty'},{cat:'Accessories', dur:'1 month', not:''}])},
      'Returns accepted within 3 days if the item is unused and in original packaging.',
      'Full refund if the fault is ours. No cash refunds on opened accessories — we exchange.',
      ${sql.json({mon:'08:30 – 19:00', tue:'08:30 – 19:00', wed:'08:30 – 19:00', thu:'08:30 – 19:00', fri:'08:30 – 19:00', sat:'09:00 – 17:00', sun:'Closed'})},
      'both', 7,
      ${sql.json(['We do free phone check-up on Fridays.'])}
    )
  `;

  // ── conversations + messages ──
  async function convo(id, name, phone, status, outcome, createdAtMins) {
    await sql`
      INSERT INTO public.conversations (id,user_id,contact_name,contact_phone,status,outcome,created_at)
      VALUES (${id},${USER_ID},${name},${phone},${status},${outcome},${mins(createdAtMins)})
    `;
  }
  async function msg(convoId, role, ai, text, at) {
    await sql`
      INSERT INTO public.messages (id,conversation_id,"role",content,ai_handled,created_at)
      VALUES (${uid('m')},${convoId},${role},${text},${ai},${at})
    `;
  }

  // 1) live handoff — negotiation (waiting)
  await convo('c-neema', 'Neema Sellah', '+255 754 220 118', 'waiting', null, 150);
  const neema = [
    ['c', 145, 'Habari! iPhone 11 iko?'],
    ['ai', 143, 'Habari boss! 👋 Ndiyo, iPhone 11 64GB tuna 3 — TSh 720,000. Ukichukua leo tunakupa case ya bure! 🎁'],
    ['c', 140, 'Bei ni kidogo juu. Unaweza 750 kwa case na screen protector?'],
    ['ai', 138, 'Nimekuelewesha vizuri boss — bei ya duka ni 720k na tayari tunaongeza case FREE. Protector ni 5k tu zaidi. 😊'],
    ['c', 136, 'Mimi nataka 700k final, nakuja leo saa tano.'],
    ['sys', 134, 'Customer pushing hard on price — past discount ceiling. Handed to owner.'],
  ];
  for (const [r, m, txt] of neema) await msg('c-neema', r, r === 'ai', txt, mins(m));

  // 2) live AI-handled — charger availability
  await convo('c-juma', 'Juma Kayombo', '+255 715 903 442', 'ai', null, 70);
  const juma = [
    ['c', 68, 'Do you have Anker fast charger in stock?'],
    ['ai', 67, "Yes Juma! ⚡ Anker Fast Charger — TSh 65,000. We have 12 ready today. Delivery to your area or pickup in Kariakoo?"],
    ['c', 64, 'Delivery to Mikocheni'],
    ['ai', 63, 'Mikocheni delivery is TSh 7,000, arrives within 2–4 hours 🚚 Should I reserve one for you?'],
    ['c', 60, 'Yes reserve one, I will send M-Pesa now'],
    ['ai', 59, 'Reserved! ✅ Send to M-Pesa 0620 184 437 and share the confirmation SMS here. Receipt comes instantly.'],
  ];
  for (const [r, m, txt] of juma) await msg('c-juma', r === 'me' ? 'me' : r, r === 'ai', txt, mins(m));

  // 3) closed sold — iPhone 11 yesterday
  await convo('c-amina', 'Amina Hassan', '+255 767 551 209', 'closed', 'sold', 1600);
  const amina = [
    ['c', 1580, 'Nataka iPhone 11, bado ipo?'],
    ['ai', 1578, 'Ndiyo Amina! iPhone 11 64GB — TSh 720,000, tuna 3. Tunakupa warranty ya miezi 6 ya duka. 📱✨'],
    ['c', 1560, 'Sawa, ninakuja kesho jioni.'],
    ['ai', 1558, 'Tunakusubiri! Tutaiweka kando mpaka kesho jioni. 🙌'],
    ['c', 1490, 'Nimefika, nipo dukani'],
    ['me', 1485, 'Karibu Amina! Nimeweka case ya bure kama ahadi yetu 😄'],
    ['sys', 1440, 'Marked as SOLD via inbox.'],
  ];
  for (const [r, m, txt] of amina) await msg('c-amina', r, r === 'ai', txt, mins(m));

  // 4) closed sold — 2x Tecno 3 days ago
  await convo('c-baraka', 'Baraka Mushi', '+255 782 330 476', 'closed', 'sold', 4500);
  const baraka = [
    ['c', 4460, 'Habari, Tecno Spark 10 bei gani? Naomba mbili'],
    ['ai', 4455, 'Habari Baraka! Tecno Spark 10 — TSh 285,000 moja. Mbili = TSh 570,000, tunakupa usafirishaji bure Kariakoo! 🔥'],
    ['c', 4430, 'Poa sana, nitatuma pesa kesho mchana'],
    ['ai', 4425, 'Sawa! Tutazitunza mbili kwa jina lako. Ukishatuma M-Pesa tutathibitisha hapa. ✅'],
    ['sys', 4300, 'Marked as SOLD via inbox.'],
  ];
  for (const [r, m, txt] of baraka) await msg('c-baraka', r, r === 'ai', txt, mins(m));

  // 5) closed no-sale
  await convo('c-zawadi', 'Zawadi Lyimo', '+255 655 210 887', 'closed', 'no', 8000);
  const zawadi = [
    ['c', 7980, 'Redmi 12 iko na bei gani?'],
    ['ai', 7975, 'Redmi 12 ilikuwa TSh 380,000 lakini imeisha kwa sasa 🙏 Nikujulishe ikirudi (kawaida ndani ya siku 7)?'],
    ['c', 7960, 'Hapana, sitahitaji tena. Asante'],
    ['ai', 7955, 'Sawa Zawadi, karibu tena wakati mwingine! 🙏'],
  ];
  for (const [r, m, txt] of zawadi) await msg('c-zawadi', r, r === 'ai', txt, mins(m));

  // archived volume-history conversations spread over ~8 weeks
  const archive = [
    ['c-a1', 'Deo Nkya',      52, [['c',51,'Naomba bei ya iPhone 11?'],['ai',50,'TSh 700,000 wiki hii, tuna 2!'],['c',49,'Nitawaza, asante']],
      { status: 'closed', outcome: null } ],
    ['c-a2', 'Grace Peter',   41, [['c',40,'Tecno Spark 10 iko?'],['ai',39,'Ipo! TSh 285,000 📱'],['c',38,'Sawa nakuja'],['me',37,'Karibu Grace, tukusubiri!']],
      { status: 'closed', outcome: 'sold' } ],
    ['c-a3', 'Emmanuel S.',   33, [['c',32,'Redmi 12 bado?'],['ai',31,'Ndiyo, TSh 380,000 ✅'],['c',30,'Nimetuma M-Pesa asante']],
      { status: 'closed', outcome: 'sold' } ],
    ['c-a4', 'Fatma Ali',     25, [['c',24,'Oraimo earbuds zipo?'],['ai',23,'Zipo TSh 32,000 🎧 ukichukua mbili ni 60k'],['c',22,'Nzuri, moja kwanza']],
      { status: 'closed', outcome: 'sold' } ],
    ['c-a5', 'Peter Msigwa',  18, [['c',17,'Case ya iPhone 11?'],['ai',16,'TSh 15,000, rangi nyingi 🛡️'],['c',15,'leta tatu kesho']],
      { status: 'closed', outcome: 'sold' } ],
    ['c-a6', 'Salma J.',      12, [['c',11,'Anker charger inapatikana?'],['ai',10,'Ndiyo TSh 65,000 ⚡'],['c',9,'Sawa asante']],
      { status: 'closed', outcome: null } ],
  ];
  for (const [id, nm, anchorDays, msgsArr, meta] of archive) {
    await convo(id, nm, '+255 7xx xxx xxx', meta.status, meta.outcome, anchorDays * 1440 + 200);
    for (const [r, off, txt] of msgsArr) {
      await msg(id, r, r === 'ai', txt, daysAgo(anchorDays - off * 0.02));
    }
  }

  // ── sales history ──
  const salesRows = [
    ['c-amina',  'p-ip11',   'iPhone 11 64GB',     1, 720000, 1],
    ['c-baraka', 'p-tecno',  'Tecno Spark 10',     2, 570000, 3],
    ['c-a2',     'p-tecno',  'Tecno Spark 10',     1, 285000, 40],
    ['c-a3',     'p-redmi',  'Xiaomi Redmi 12',    1, 380000, 32],
    ['c-a4',     'p-oraimo', 'Oraimo Earbuds',     1,  32000, 24],
    ['c-a5',     'p-case',   'iPhone 11 Case',     3,  45000, 17],
    ['c-a1',     'p-anker',  'Anker Fast Charger', 1,  65000, 51],
  ];
  for (const [cid, pid, pname, qty, amount, d] of salesRows) {
    await sql`
      INSERT INTO public.sales (id,user_id,conversation_id,product_id,product_name,qty,unit_price,amount,created_at)
      VALUES (${uid('s')},${USER_ID},${cid},${pid},${pname},${qty},${Math.round(amount/qty)},${amount},${daysAgo(d)})
    `;
  }

  const counts = await sql`
    SELECT
      (SELECT count(*) FROM public.products WHERE user_id=${USER_ID}) AS products,
      (SELECT count(*) FROM public.services WHERE user_id=${USER_ID}) AS services,
      (SELECT count(*) FROM public.conversations WHERE user_id=${USER_ID}) AS convos,
      (SELECT count(*) FROM public.messages m JOIN public.conversations c ON c.id=m.conversation_id WHERE c.user_id=${USER_ID}) AS messages,
      (SELECT count(*) FROM public.sales WHERE user_id=${USER_ID}) AS sales
  `;
  console.log('Seeded:', counts[0]);
  process.exit(0);
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
