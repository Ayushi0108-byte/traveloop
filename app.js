// Traveloop client-side app — localStorage-backed "database"
const DB_KEY = 'traveloop_db_v1';
const SESSION_KEY = 'traveloop_session';

const SEED_CITIES = [
  {id:'c1',name:'Paris',country:'France',cost:120,popularity:98,img:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'},
  {id:'c2',name:'Tokyo',country:'Japan',cost:140,popularity:97,img:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'},
  {id:'c3',name:'Bali',country:'Indonesia',cost:60,popularity:90,img:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'},
  {id:'c4',name:'New York',country:'USA',cost:180,popularity:96,img:'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'},
  {id:'c5',name:'Rome',country:'Italy',cost:110,popularity:92,img:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800'},
  {id:'c6',name:'Barcelona',country:'Spain',cost:100,popularity:91,img:'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'},
  {id:'c7',name:'Dubai',country:'UAE',cost:170,popularity:89,img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'},
  {id:'c8',name:'Bangkok',country:'Thailand',cost:55,popularity:88,img:'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800'},
  {id:'c9',name:'Reykjavik',country:'Iceland',cost:160,popularity:80,img:'https://images.unsplash.com/photo-1500627965408-b5f2c8793f8f?w=800'},
  {id:'c10',name:'Cape Town',country:'South Africa',cost:90,popularity:82,img:'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'},
];
const SEED_ACTIVITIES = [
  {id:'a1',name:'Eiffel Tower Visit',type:'Sightseeing',cost:30,duration:3,city:'Paris'},
  {id:'a2',name:'Louvre Museum',type:'Culture',cost:25,duration:4,city:'Paris'},
  {id:'a3',name:'Shibuya Crossing & Food Tour',type:'Food',cost:60,duration:3,city:'Tokyo'},
  {id:'a4',name:'Mt Fuji Day Trip',type:'Adventure',cost:120,duration:8,city:'Tokyo'},
  {id:'a5',name:'Ubud Rice Terraces',type:'Nature',cost:20,duration:5,city:'Bali'},
  {id:'a6',name:'Surf Lesson Kuta',type:'Adventure',cost:35,duration:2,city:'Bali'},
  {id:'a7',name:'Statue of Liberty Tour',type:'Sightseeing',cost:45,duration:3,city:'New York'},
  {id:'a8',name:'Broadway Show',type:'Entertainment',cost:120,duration:3,city:'New York'},
  {id:'a9',name:'Colosseum Tour',type:'Culture',cost:30,duration:3,city:'Rome'},
  {id:'a10',name:'Vatican Museums',type:'Culture',cost:40,duration:4,city:'Rome'},
  {id:'a11',name:'Sagrada Familia',type:'Culture',cost:35,duration:2,city:'Barcelona'},
  {id:'a12',name:'Tapas Crawl',type:'Food',cost:55,duration:3,city:'Barcelona'},
  {id:'a13',name:'Burj Khalifa',type:'Sightseeing',cost:55,duration:2,city:'Dubai'},
  {id:'a14',name:'Desert Safari',type:'Adventure',cost:90,duration:6,city:'Dubai'},
  {id:'a15',name:'Floating Market',type:'Culture',cost:25,duration:4,city:'Bangkok'},
  {id:'a16',name:'Blue Lagoon Spa',type:'Wellness',cost:80,duration:4,city:'Reykjavik'},
  {id:'a17',name:'Table Mountain Hike',type:'Adventure',cost:30,duration:5,city:'Cape Town'},
];

function db(){
  let d = JSON.parse(localStorage.getItem(DB_KEY)||'null');
  if(!d){
    d = {users:[],trips:[],cities:SEED_CITIES,activities:SEED_ACTIVITIES,notes:[],packing:[]};
    localStorage.setItem(DB_KEY,JSON.stringify(d));
  }
  // ensure seeds present
  if(!d.cities||!d.cities.length) d.cities=SEED_CITIES;
  if(!d.activities||!d.activities.length) d.activities=SEED_ACTIVITIES;
  return d;
}
function save(d){ localStorage.setItem(DB_KEY,JSON.stringify(d)); }
function uid(p='id'){ return p+'_'+Math.random().toString(36).slice(2,9); }

// Session
function currentUser(){
  const s = JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
  if(!s) return null;
  return db().users.find(u=>u.id===s.userId)||null;
}
function login(email,pwd){
  const d=db();
  const u=d.users.find(u=>u.email===email && u.password===pwd);
  if(!u) return {ok:false,error:'Invalid email or password'};
  localStorage.setItem(SESSION_KEY,JSON.stringify({userId:u.id}));
  return {ok:true};
}
function signup(name,email,pwd){
  const d=db();
  if(d.users.some(u=>u.email===email)) return {ok:false,error:'Email already registered'};
  const u={id:uid('u'),name,email,password:pwd,createdAt:Date.now()};
  d.users.push(u); save(d);
  localStorage.setItem(SESSION_KEY,JSON.stringify({userId:u.id}));
  return {ok:true};
}
function logout(){ localStorage.removeItem(SESSION_KEY); location.href='index.html'; }
function requireAuth(){
  if(!currentUser()){ location.href='index.html'; return false; }
  return true;
}

// Trips
function getMyTrips(){ const u=currentUser(); return db().trips.filter(t=>t.userId===u.id); }
function getTrip(id){ return db().trips.find(t=>t.id===id); }
function saveTrip(trip){
  const d=db();
  const i=d.trips.findIndex(t=>t.id===trip.id);
  if(i>=0) d.trips[i]=trip; else d.trips.push(trip);
  save(d);
}
function deleteTrip(id){
  const d=db();
  d.trips=d.trips.filter(t=>t.id!==id);
  d.notes=d.notes.filter(n=>n.tripId!==id);
  d.packing=d.packing.filter(p=>p.tripId!==id);
  save(d);
}

function tripCost(trip){
  let total=0;
  (trip.stops||[]).forEach(s=>{
    const days = daysBetween(s.startDate,s.endDate)+1;
    const city = db().cities.find(c=>c.name===s.city);
    if(city) total += city.cost * days; // stay
    total += 50 * days; // meals avg
    (s.activities||[]).forEach(a=> total += (a.cost||0));
  });
  total += (trip.transportBudget||0);
  return total;
}
function daysBetween(a,b){
  if(!a||!b) return 0;
  return Math.max(0,Math.round((new Date(b)-new Date(a))/86400000));
}
function fmt$(n){ return '$'+Math.round(n).toLocaleString(); }
function fmtDate(d){ if(!d) return '—'; return new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }

// Notes
function getNotes(tripId){ return db().notes.filter(n=>n.tripId===tripId).sort((a,b)=>b.createdAt-a.createdAt); }
function addNote(tripId,text){ const d=db(); d.notes.push({id:uid('n'),tripId,text,createdAt:Date.now()}); save(d); }
function deleteNote(id){ const d=db(); d.notes=d.notes.filter(n=>n.id!==id); save(d); }

// Packing
function getPacking(tripId){ return db().packing.filter(p=>p.tripId===tripId); }
function addPack(tripId,name,category){ const d=db(); d.packing.push({id:uid('p'),tripId,name,category,packed:false}); save(d); }
function togglePack(id){ const d=db(); const p=d.packing.find(x=>x.id===id); if(p){ p.packed=!p.packed; save(d);} }
function delPack(id){ const d=db(); d.packing=d.packing.filter(p=>p.id!==id); save(d); }
function resetPacking(tripId){ const d=db(); d.packing.filter(p=>p.tripId===tripId).forEach(p=>p.packed=false); save(d); }

// Toast
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  clearTimeout(window._toastT); window._toastT=setTimeout(()=>t.classList.remove('show'),2200);
}

// Render shared nav
function renderNav(active){
  const u=currentUser();
  const initials = u ? u.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() : '?';
  const items=[
    ['dashboard.html','Dashboard'],
    ['trips.html','My Trips'],
    ['create-trip.html','New Trip'],
    ['cities.html','Cities'],
    ['activities.html','Activities'],
  ];
  return `<nav class="nav"><div class="nav-inner">
    <a href="dashboard.html" class="brand">✦ Traveloop</a>
    <div class="nav-links">${items.map(([h,l])=>`<a href="${h}" class="${active===h?'active':''}">${l}</a>`).join('')}</div>
    <div class="nav-user">
      <a href="profile.html" title="Profile" class="avatar">${initials}</a>
      <button class="btn sm" onclick="logout()">Logout</button>
    </div>
  </div></nav>`;
}

function getQuery(k){ return new URLSearchParams(location.search).get(k); }
