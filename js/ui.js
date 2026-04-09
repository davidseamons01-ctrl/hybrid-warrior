// ═══════════════════════════════════════════════════════════
import { EX, exById, EX_MEDIA, EX_MEDIA_FEMALE, EX_QUICK_DEMO_VIDEO, EX_MUSCLE_IDS } from "./exercises.js";

const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const TAB_TRAIN="train",TAB_PLAN="plan",TAB_YOU="you";
const PLANS=(function(){
  const G=["strength","hybrid","fat_loss","muscle"];
  const gN=["Strength","Hybrid Athlete","Fat Loss","Hypertrophy"];
  const fN=["3-4 Day","5-6 Day"];
  const dN=["Express","Full"];
  const sN=["Men's","Women's"];
  const eN=["Foundation","Advanced"];
  const base={
    strength:{"00":["FB","SR","FB"],"01":["HP","SR","HL","TR"],"10":["HP","SR","HL","TR","HB"],"11":["HP","HPL","HL","SR","PW"]},
    hybrid:{"00":["FB","SR","FB"],"01":["HP","SR","HL","TR"],"10":["HP","SR","HL","TR","HB"],"11":["HP","SR","HL","TR","HB"]},
    fat_loss:{"00":["CT","SR","FBC"],"01":["HB","SR","CT","TR"],"10":["CT","SR","HB","TR","CT"],"11":["HB","SR","HL","TR","CT"]},
    muscle:{"00":["FB","FB","FB"],"01":["HYP","HYG","HYL"],"10":["HYP","HYL","HYG","HB","CT"],"11":["HYP","HYL","HYG","HP","HL"]}
  };
  function feminizeSlots(goal,slots,isExpress){
    let out=slots.map(sl=>{
      const map={
        HP:"HYL",
        HPL:"HYL",
        HL:"GL",
        HYG:"GL",
        PW:"GL",
        SR:isExpress?"CT":"HB",
        TR:isExpress?"CT":"HB",
        FB:"HB"
      };
      return map[sl]||sl;
    });
    if(goal==="fat_loss"){
      out=out.map(sl=>sl==="HB"?"CT":sl);
    }
    if(!out.includes("GL"))out[0]="GL";
    if(!out.includes("HYL")&&!out.includes("HPL"))out[Math.min(1,out.length-1)]="HYL";
    if(!out.includes("CT"))out[Math.min(2,out.length-1)]="CT";
    return out;
  }
  const plans=[];
  for(let g=0;g<4;g++)for(let f=0;f<2;f++)for(let d=0;d<2;d++)for(let s=0;s<2;s++)for(let e=0;e<2;e++){
    let sl=[...base[G[g]][""+f+d]];
    if(s===1)sl=feminizeSlots(G[g],sl,d===0);
    if(e===0)sl=sl.map(x=>x==="PW"?"FB":x==="HPL"?"FB":x);
    plans.push({id:g*16+f*8+d*4+s*2+e,name:`${sN[s]} ${gN[g]} · ${fN[f]} ${dN[d]} (${eN[e]})`,goal:G[g],slots:sl});
  }
  return plans;
})();

function isoFromDate(d){const x=d instanceof Date?d:new Date(d);return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`}
const iso=()=>isoFromDate(new Date());
let trainSessionDate=null;
let trainFocusIdx=null;
function activeTrainIso(){
  if(trainSessionDate&&/^\d{4}-\d{2}-\d{2}$/.test(trainSessionDate)&&!Number.isNaN(parseIsoNoon(trainSessionDate).getTime()))return trainSessionDate;
  return iso();
}
const DEF={
  v:7,
  profile:{name:"",sex:"male",age:24,height:70,bench1RM:0,squat1RM:0,dead1RM:0,run4mi:0,weight:0,startWt:0,goalWt:0,waist:0,hips:0,shoulders:0,bodyFat:0,onboarded:false,prefs:{equipment:"gym",style:"balanced",lifeStage:"general",barrier:"none",womenMode:"auto",appearance:"dark",units:"imperial",quickSessionMin:0,womenSimpleUi:true}},
  goals:{bench:0,squat:0,deadlift:0,fiveK:0,fatLoss:0,focusAreas:[]},
  schedule:{days:[1,2,3,4,5],sessionMin:45},
  scheduleAdjust:{catchUpQueue:[],missChoices:{},missSnoozed:{},extraTrainingIso:null,catchUpClearedDate:null},
  program:{week:1,start:iso()},
  adapt:{bench:1,squat:1,dead:1,run:1},
  logs:[],weightLog:[],healthLog:[],
  planId:null,
  sync:{on:false,cfg:"",uid:""},
  pdfs:{"28DayPlan_FinalVersion.pdf":"","Copy of OffSeason_2ndEdition_Final.pdf":"","IN Season workouts.pdf":"","WrestlingEBook2_FINAL.compressed.pdf":""},
  lastLiftByEid:{},
  skippedEidsByDate:{},
  exerciseSwapsByDate:{},
  sessionFeelByDate:{},
  sessionAdaptedByDate:{},
  trustBannerLastShown:0,
  extraActivities:[],
  warmupDoneByDate:{},
  exerciseOrderByDate:{}
};

// Runtime state/auth/persistence extracted from inline script
// ═══════════════════════════════════════════════════════════
//  PERSISTENCE & AUTH
// ═══════════════════════════════════════════════════════════
function idbAvailable(){return typeof indexedDB!=="undefined"}
function idbOpen(){
  if(!idbAvailable())return Promise.resolve(null);
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open("hw5-db",1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("kv"))db.createObjectStore("kv");
      if(!db.objectStoreNames.contains("queue"))db.createObjectStore("queue",{keyPath:"id"});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>resolve(null);
  });
}
async function idbPut(store,key,val){const db=await idbOpen();if(!db)return;await new Promise(r=>{const tx=db.transaction(store,"readwrite");const os=tx.objectStore(store);if(store==="queue")os.put(val);else os.put(val,key);tx.oncomplete=()=>r();tx.onerror=()=>r()});db.close()}
async function idbGet(store,key){const db=await idbOpen();if(!db)return null;const out=await new Promise(r=>{const tx=db.transaction(store,"readonly");const q=tx.objectStore(store).get(key);q.onsuccess=()=>r(q.result||null);q.onerror=()=>r(null)});db.close();return out}
async function idbDel(store,key){const db=await idbOpen();if(!db)return;await new Promise(r=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).delete(key);tx.oncomplete=()=>r();tx.onerror=()=>r()});db.close()}
async function idbAll(store){const db=await idbOpen();if(!db)return[];const out=await new Promise(r=>{const tx=db.transaction(store,"readonly");const q=tx.objectStore(store).getAll();q.onsuccess=()=>r(q.result||[]);q.onerror=()=>r([])});db.close();return out}
function normalizeProgramStart(st){
  if(!st.program)st.program={week:1,start:iso()};
  const x=String(st.program.start||"").trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(x))st.program.start=iso();
  else if(Number.isNaN(parseIsoNoon(x).getTime()))st.program.start=iso();
}
function load(){try{const r=localStorage.getItem("hw5");const s=r?merge(structuredClone(DEF),JSON.parse(r)):structuredClone(DEF);trimStaleSkipped(s);normalizeProgramStart(s);return s}catch{return structuredClone(DEF)}}
function merge(b,s){if(!s||typeof s!=="object")return b;for(const k of Object.keys(s)){if(s[k]&&typeof s[k]==="object"&&!Array.isArray(s[k]))b[k]=merge(b[k]||{},s[k]);else b[k]=s[k]}return b}
function save(){localStorage.setItem("hw5",JSON.stringify(S));idbPut("kv","state",JSON.parse(JSON.stringify(S))).catch(()=>{})}
async function persist(){save();if(currentUser)await cloudPush()}

let fbApp=null,fbDb=null,fbAuth=null,fbUnsub=null,lastPushAt=0;
async function loadFBSDK(){
  if(typeof firebase!=="undefined"&&firebase.app)return;
  const ld=(src,timeoutMs=8000)=>new Promise((resolve,reject)=>{
    const el=document.createElement("script");
    const t=setTimeout(()=>{el.remove();reject(new Error("Timed out loading Firebase SDK: "+src))},timeoutMs);
    el.src=src;
    el.onload=()=>{clearTimeout(t);resolve()};
    el.onerror=()=>{clearTimeout(t);reject(new Error("Failed loading Firebase SDK: "+src))};
    document.head.appendChild(el);
  });
  await ld("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
  await ld("https://www.gstatic.com/firebasejs/10.12.4/firebase-auth-compat.js");
  await ld("https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js");
}
function normalizeFirebaseConfigObject(obj){
  if(!obj||typeof obj!=="object")throw new Error("Invalid Firebase config.");
  const required=["apiKey","authDomain","projectId","appId","messagingSenderId"];
  const missing=required.filter(k=>!obj[k]);
  if(missing.length)throw new Error("Missing fields: "+missing.join(", "));
  return obj;
}
function getEmbeddedFirebaseConfig(){
  try{
    const emb=typeof window!=="undefined"?window.__HYBRID_FIREBASE_CONFIG__:null;
    if(emb&&typeof emb==="object"&&emb.apiKey)return normalizeFirebaseConfigObject(emb);
  }catch(e){console.warn("Embedded Firebase config invalid:",e&&e.message)}
  try{
    const el=document.getElementById("embedded-firebase-config");
    const txt=el&&el.textContent&&el.textContent.trim();
    if(txt)return normalizeFirebaseConfigObject(JSON.parse(txt));
  }catch(e){console.warn("embedded-firebase-config JSON invalid:",e&&e.message)}
  return null;
}
function getResolvedFirebaseConfig(){
  const emb=getEmbeddedFirebaseConfig();
  if(emb)return emb;
  const fallback={apiKey:"",authDomain:"",projectId:"",appId:"",messagingSenderId:""};
  try{return normalizeFirebaseConfigObject(fallback)}catch{return null}
}
async function initFB(cfg){
  try{
    await loadFBSDK();
  }catch(err){
    const auth=document.getElementById("authScreen");if(auth)auth.style.display="flex";
    const setup=document.getElementById("auth-setup"),login=document.getElementById("auth-login"),loading=document.getElementById("auth-loading");
    if(loading)loading.style.display="none";
    if(login)login.style.display="none";
    if(setup)setup.style.display="block";
    const e=document.getElementById("authErr");
    if(e){e.textContent="Failed to connect to cloud. Check network or ad-blocker.";e.classList.add("show")}
    throw err;
  }
  const APP_NAME="hw-main";
  try{
    const existing=firebase.apps.find(a=>a.name===APP_NAME);
    if(existing)await existing.delete();
  }catch{}
  fbApp=firebase.initializeApp(cfg,APP_NAME);
  fbAuth=firebase.auth(fbApp);
  fbDb=firebase.firestore(fbApp);
  try{
    await fbDb.enablePersistence({synchronizeTabs:true});
  }catch(e){
    if(e.code==="failed-precondition")console.warn("Firestore persistence: multiple tabs or incompatible mode.");
    else if(e.code==="unimplemented")console.warn("Firestore persistence not available in this browser.");
    else console.warn("Firestore persistence:",e);
  }
  // Keep auth session across reloads/devices until explicit sign-out.
  await fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
}
function startSync(){if(!fbDb||!currentUser)return;if(fbUnsub)fbUnsub();fbUnsub=fbDb.collection("hw").doc(currentUser.uid).onSnapshot(doc=>{if(!doc.exists)return;if(Date.now()-lastPushAt<3000)return;const d=doc.data();if(d&&d.state){S=merge(S,d.state);normalizeProgramStart(S);save();render()}})}
async function cloudPush(){
  if(offlineMode||!fbDb||!currentUser)return;
  const payload={state:S,at:new Date().toISOString()};
  try{
    lastPushAt=Date.now();
    await fbDb.collection("hw").doc(currentUser.uid).set(payload,{merge:true});
    const queued=(await idbAll("queue")).sort((a,b)=>(a.ts||0)-(b.ts||0));
    for(const q of queued){
      try{await fbDb.collection("hw").doc(currentUser.uid).set(q.payload,{merge:true});await idbDel("queue",q.id)}catch{break}
    }
  }catch(e){
    console.error(e);
    const qid=(typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():("q_"+Date.now()+"_"+Math.random().toString(36).slice(2,8));await idbPut("queue",qid,{id:qid,ts:Date.now(),payload});
    if(typeof navigator!=="undefined"&&navigator.onLine)toast("Cloud sync queued — will retry automatically.")
  }
}
async function cloudPullOnce(uid){
  if(offlineMode||!fbDb||!uid)return;
  try{
    const doc=await fbDb.collection("hw").doc(uid).get();
    if(doc.exists){
      const d=doc.data();
      if(d&&d.state){S=merge(S,d.state);normalizeProgramStart(S);save();}
    }
  }catch(e){console.error(e)}
}

async function enterApp(user){
  try{
    offlineMode=false;
    currentUser=user;
    showAuthLoading();
    await cloudPullOnce(user.uid); // ensure newest cross-device state is loaded before onboarding decision
    document.getElementById("authScreen").style.display="none";
    applyVisualTheme(false);
    if(!S.profile.onboarded){showOnboarding();return}
    document.getElementById("mainNav").style.display="";
    document.getElementById("app").style.display="";
    startSync();
    render();
  }catch(err){
    const e=document.getElementById("authErr");
    if(e){e.textContent=`enterApp failed: ${err&&err.message?err.message:"unknown"}`;e.classList.add("show")}
    throw err;
  }
}
async function doSignOut(){
  offlineMode=false;
  if(fbAuth)await fbAuth.signOut();
  currentUser=null;
  document.getElementById("authScreen").style.display="flex";
  document.getElementById("mainNav").style.display="none";
  document.getElementById("app").style.display="none";
  showAuthLogin();
}
function showAuthSetup(){
  showAuthLogin();
  showAuthErr("Auth config missing. Add window.__HYBRID_FIREBASE_CONFIG__ in index.html.");
}
function applyAuthTabUI(){
  document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x.dataset.m===authMode));
  const go=document.getElementById("auth-go");
  if(go)go.textContent=authMode==="in"?"Sign In":"Create Account";
  const fg=document.getElementById("auth-forgot");
  if(fg)fg.style.display=authMode==="in"?"inline-flex":"none";
}
function showAuthLogin(){
  const setup=document.getElementById("auth-setup");
  if(setup)setup.style.display="none";
  document.getElementById("auth-login").style.display="block";
  document.getElementById("auth-loading").style.display="none";
  applyAuthTabUI();
}
function showAuthLoading(){
  const setup=document.getElementById("auth-setup");
  if(setup)setup.style.display="none";
  document.getElementById("auth-login").style.display="none";
  document.getElementById("auth-loading").style.display="block";
}
function showAuthErr(m){const el=document.getElementById("authErr");el.textContent=m;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),6000)}
function bindAuthUI(){
  document.querySelectorAll(".auth-tab").forEach(t=>t.onclick=()=>{authMode=t.dataset.m;applyAuthTabUI()});
  document.getElementById("auth-forgot").onclick=async()=>{
    const em=document.getElementById("auth-email").value.trim();
    if(!em){showAuthErr("Enter your email, then tap Forgot password.");return}
    if(!fbAuth){showAuthErr("Auth unavailable. Check Firebase config.");return}
    try{await fbAuth.sendPasswordResetEmail(em);toast("Check your email for a reset link.")}catch(e){showAuthErr(e.message||"Could not send reset email.")}
  };
  document.getElementById("auth-go").onclick=async()=>{const em=document.getElementById("auth-email").value.trim(),pw=document.getElementById("auth-pass").value;
    if(!em||!pw){showAuthErr("Enter email and password.");return}
    if(pw.length<6){showAuthErr("Password must be 6+ characters.");return}
    if(!fbAuth){showAuthErr("Missing Firebase config. Add window.__HYBRID_FIREBASE_CONFIG__ in index.html.");showAuthLogin();return}
    try{showAuthLoading();let u;if(authMode==="in"){const c=await fbAuth.signInWithEmailAndPassword(em,pw);u=c.user}else{const c=await fbAuth.createUserWithEmailAndPassword(em,pw);u=c.user;try{await u.sendEmailVerification()}catch(err){console.warn(err)}}await enterApp(u)}catch(e){
      showAuthLogin();showAuthErr(e.code==="auth/user-not-found"?"No account. Switch to Create Account.":e.code==="auth/wrong-password"||e.code==="auth/invalid-credential"?"Wrong email or password.":e.code==="auth/email-already-in-use"?"Email in use. Switch to Sign In.":e.message)}};
    document.getElementById("auth-pass").onkeydown=e=>{if(e.key==="Enter")document.getElementById("auth-go").click()};
}


let S=load();(()=>{const nid=()=>(typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():"log_"+Date.now()+"_"+Math.random().toString(36).slice(2,10));let ch=false;for(const l of S.logs){if(!l.id){l.id=nid();ch=true}}if(ch)save()})();
function isWomensPlanSelected(){
  const pid=S.planId!=null?S.planId:0;
  return(((pid>>1)&1)===1);
}
function womenBlueprintMode(){
  const fa=S.goals.focusAreas||[];
  const womenGoals=["Hourglass Shape","Glute Shelf","Posture & Back Tone","Pilates Plus Tone","Home-Friendly Workouts","Pregnancy Safe","Postpartum Recovery"];
  const eligible=S.profile.sex==="female"||isWomensPlanSelected()||fa.some(a=>womenGoals.includes(a))||(((S.profile.prefs||{}).womenMode||"auto")!=="auto");
  if(!eligible)return "none";
  const p=S.profile.prefs||{};
  if(p.womenMode&&p.womenMode!=="auto")return p.womenMode;
  if(fa.includes("Pregnancy Safe"))return "pregnancy";
  if(fa.includes("Postpartum Recovery"))return "postpartum";
  if(fa.includes("Glute Shelf"))return "glute_shelf";
  if(fa.includes("Hourglass Shape"))return "hourglass";
  if(fa.includes("Posture & Back Tone"))return "posture";
  if(fa.includes("Pilates Plus Tone"))return "pilates";
  if(fa.includes("Home-Friendly Workouts"))return "home";
  return "balanced";
}
function womenBaselineTier(){
  const p=S.profile||{};
  const wt=Math.max(1,p.weight||0);
  const strength=((p.squat1RM||0)+(p.dead1RM||0)+(p.bench1RM||0))/wt;
  if((S.profile.prefs||{}).lifeStage==="pregnancy"||(S.profile.prefs||{}).lifeStage==="postpartum")return "rebuild";
  if(strength>=4.2)return "advanced";
  if(strength>=2.8)return "intermediate";
  return "beginner";
}
let tab=TAB_YOU;let trainSub="workout";let youSub="home";let logDate=iso();let logHistoryFilter="";let expandedWeek=null;let pdfLib=null,pdfCache=new Map();let toastTimer=null;
const DASH_RANGES=[["1w","1W"],["1m","1M"],["3m","3M"],["6m","6M"],["all","All-Time"]];
let authMode="up";let currentUser=null;let offlineMode=false;let obStep=0;let lastLogSummary=null;
function tabFromHash(){
  const h=(location.hash||"").replace(/^#/,"").toLowerCase();
  if(h===TAB_TRAIN||h===TAB_PLAN||h===TAB_YOU)return h;
  return null;
}
function syncTabToHash(){
  const t=tabFromHash();
  if(t&&t!==tab)tab=t;
}

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n))}
function r5(n){return Math.round(n/5)*5}
function epley(w,r){return r<=0||w<=0?0:w*(1+r/30)}
function mmss(s){if(!isFinite(s)||s<=0)return"--:--";const m=Math.floor(s/60),ss=Math.round(s%60);return m+":"+String(ss).padStart(2,"0")}
function parseMM(v){const p=(v||"").split(":").map(Number);return p.length===2&&p.every(isFinite)?p[0]*60+p[1]:0}
/** Strip to digits; keep partial (≤3) as raw; from 4+ digits treat last two as seconds (0–59). */
function maskMmssDigitsWhileTyping(raw){
  const d=String(raw||"").replace(/\D/g,"").slice(0,6);
  if(!d)return"";
  if(d.length<=3)return d;
  let sec=parseInt(d.slice(-2),10);
  if(!isFinite(sec))sec=0;
  sec=Math.min(59,Math.max(0,sec));
  const minRaw=d.slice(0,-2).replace(/^0+(?=\d)/,"")||"0";
  return `${minRaw}:${String(sec).padStart(2,"0")}`;
}
/** Normalize on blur: colon → parseMM; plain digits → minutes, M+SS (3 digits), or MM+SS+. */
function normalizeMmssFieldBlur(raw){
  const v=String(raw||"").trim();
  if(!v)return"";
  if(/:/.test(v)){
    const t=parseMM(v);
    return t>0?mmss(t):"";
  }
  const d=v.replace(/\D/g,"");
  if(!d)return"";
  if(d.length<=2){
    const n=parseInt(d,10);
    return isFinite(n)&&n>0?mmss(n*60):"";
  }
  if(d.length===3){
    const m=parseInt(d[0],10)||0,s=parseInt(d.slice(1),10)||0;
    if(s>=0&&s<=59&&m>=0)return mmss(m*60+s);
  }
  let sec=parseInt(d.slice(-2),10)||0;
  sec=Math.min(59,Math.max(0,sec));
  const min=parseInt(d.slice(0,-2),10)||0;
  const t=min*60+sec;
  return t>0?mmss(t):"";
}
function bindMmssPaceInput(el){
  if(!el||el.dataset.mmssBound==="1")return;
  el.dataset.mmssBound="1";
  el.addEventListener("input",()=>{
    const next=maskMmssDigitsWhileTyping(el.value);
    if(next!==el.value)el.value=next;
    const pos=next.length;
    if(el.setSelectionRange)el.setSelectionRange(pos,pos);
  });
  el.addEventListener("blur",()=>{
    const next=normalizeMmssFieldBlur(el.value);
    if(next!==el.value)el.value=next;
  });
}
function hapticPulse(ms){try{if(typeof navigator!=="undefined"&&navigator.vibrate){const p=Array.isArray(ms)?ms:(ms!=null?[ms]:[12]);navigator.vibrate(p)}}catch{}}
function hapticKey(){hapticPulse([50])}
const LB_PER_KG=2.2046226218;
function useMetric(){return(S.profile.prefs||{}).units==="metric"}
function massUnitLabel(){return useMetric()?"kg":"lb"}
function loadStepDelta(){return useMetric()?2.5:5}
/** Display number for weight/load inputs (canonical storage: lb). */
function loadInputDisplayFromLb(lb){
  const n=Number(lb);
  if(!isFinite(n)||n<=0)return n<=0?0:"";
  if(!useMetric())return Math.round(n*10)/10;
  return Math.round((n/LB_PER_KG)*10)/10;
}
/** Convert user load input to stored pounds. */
function loadInputToLb(val){
  const n=Number(val);
  if(!isFinite(n)||n<0)return 0;
  if(!useMetric())return n;
  return n*LB_PER_KG;
}
/** Body weight / 1RM fields: stored lb, inputs follow units preference. */
function massFieldToLb(val){
  const n=Number(val);
  if(!isFinite(n)||n<0)return 0;
  if(!useMetric())return n;
  return n*LB_PER_KG;
}
function massLbToField(lb){
  const n=Number(lb)||0;
  if(!useMetric())return n;
  return Math.round((n/LB_PER_KG)*10)/10;
}
/** Format a stored lb value for read-only text (logs, summaries). */
function formatLoadLbText(lb){
  const n=Number(lb);
  if(!isFinite(n)||n<=0)return String(lb);
  if(!useMetric())return`${Math.round(n*10)/10} lb`;
  return`${Math.round((n/LB_PER_KG)*10)/10} kg`;
}
function updateGlobalFabVisibility(){
  const fab=document.getElementById("fabQuickLog");if(!fab)return;
  const app=document.getElementById("app"),auth=document.getElementById("authScreen"),ob=document.getElementById("obScreen");
  const appOn=app&&getComputedStyle(app).display!=="none";
  const authOn=auth&&getComputedStyle(auth).display!=="none";
  const obOn=ob&&ob.classList.contains("show");
  const visible=appOn&&!authOn&&!obOn;
  fab.hidden=!visible;fab.setAttribute("aria-hidden",visible?"false":"true");
}
function bindGlobalFab(){
  const fab=document.getElementById("fabQuickLog");if(!fab||fab.dataset.bound==="1")return;
  fab.dataset.bound="1";
  fab.onclick=()=>{hapticKey();tab=TAB_YOU;youSub="home";location.hash=TAB_YOU;sessionStorage.setItem("hw-scroll","#dash-extra-act");render()};
}
function enhanceNumericInputs(scope){(scope||document).querySelectorAll('input[type="number"]').forEach(el=>{el.setAttribute("inputmode","decimal");if(!el.getAttribute("step"))el.setAttribute("step","any")})}
function fmtPace(secPerMile){return mmss(secPerMile)+"/mi"}
function est5k(r4){return r4>0?r4*Math.pow(5000/(4*1609.34),1.06):0}
function paceMi(fk){return fk>0?fk/3.10686:0}
function applyAppearanceMeta(m){
  m=m||document.getElementById("meta-theme");
  if(!m)return;
  const light=(S.profile.prefs||{}).appearance==="light";
  m.setAttribute("content",light?"#e8eaef":"#17171d");
}
function applyVisualTheme(forceNeutral=false){
  const b=document.body;
  if(!b)return;
  b.classList.remove("theme-neutral","theme-feminine","theme-masculine","women-vivid","appearance-light");
  if(forceNeutral||!S.profile.onboarded)b.classList.add("theme-neutral");
  else if(S.profile.sex==="female"){b.classList.add("theme-feminine");b.classList.add("women-vivid")}
  else b.classList.add("theme-masculine");
  if(!forceNeutral&&S.profile.onboarded&&(S.profile.prefs||{}).appearance==="light")b.classList.add("appearance-light");
  applyAppearanceMeta();
}
function useWomenSoftUi(){
  return S.profile.sex==="female"&&((S.profile.prefs||{}).womenSimpleUi!==false);
}
function planCompactOn(){
  return useWomenSoftUi()?sessionStorage.getItem("hw-plan-compact")!=="0":sessionStorage.getItem("hw-plan-compact")==="1";
}
function phaseName(w){return w<=4?"Hypertrophy":w<=8?"Strength":w<=12?"Peak":"Test"}
function phaseClass(w){return w<=4?"phase-hyp":w<=8?"phase-str":w<=12?"phase-peak":"phase-test"}
function phaseColor(w){return w<=4?"var(--ice)":w<=8?"var(--gold)":w<=12?"var(--fire)":"var(--mint)"}
function phaseAbbrev(w){return w<=4?"Hyp":w<=8?"Str":w<=12?"Peak":"Test"}
/** Reorder prescribed exercises for a calendar day (Plan + Train) from saved drag order. */
function applyExerciseOrderForDate(dateIso,exs){
  if(!dateIso||!exs||!exs.length)return exs||[];
  const ord=(S.exerciseOrderByDate&&S.exerciseOrderByDate[dateIso])||null;
  if(!ord||!ord.length)return exs;
  const pos=new Map();
  ord.forEach((eid,i)=>{if(eid&&!pos.has(eid))pos.set(eid,i)});
  const copy=exs.slice();
  copy.sort((a,b)=>{
    const pa=pos.has(a.eid)?pos.get(a.eid):999;
    const pb=pos.has(b.eid)?pos.get(b.eid):999;
    if(pa!==pb)return pa-pb;
    return exs.indexOf(a)-exs.indexOf(b);
  });
  return copy;
}
/** Prescribed load for Plan / log tables — avoids "BW BW" when unit is BW. */
function formatPrescribedLoad(ex){
  if(!ex)return"BW";
  const u=String(ex.unit||"").trim();
  const t=ex.target;
  const uLow=u.toLowerCase();
  if(uLow==="bw"||t==="BW"||t===""||t==null||(typeof t==="string"&&String(t).toLowerCase()==="bw"))return"BW";
  if(typeof t==="number"&&isFinite(t)&&t>0){
    if(useMetric()&&(!u||uLow==="lb"||uLow==="lbs"))return`${Math.round((t/LB_PER_KG)*10)/10} kg`;
    return u?`${t} ${u}`:`${t} lb`;
  }
  return String(t||"BW");
}
function formatPrescribedRx(ex){
  if(!ex)return"";
  return`${ex.sets}×${ex.reps} @ ${formatPrescribedLoad(ex)}`;
}
function estimateDayMinutes(plan){
  const n=(plan&&plan.exs)?plan.exs.length:0;
  if(n<=0)return 0;
  const cap=Number(S.schedule.sessionMin)||45;
  return Math.min(95,Math.max(20,Math.round(Math.min(cap,20+n*8))));
}
function planFocusHeadline(focusStr){
  const s=String(focusStr||"Session").split("·")[0].trim();
  return s.length>56?s.slice(0,53)+"…":s;
}
function escPlanChip(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function selectPlan(){return S.planId!=null?S.planId:0}
function wkFactor(w){return[.62,.65,.68,.60,.72,.76,.79,.65,.80,.84,.88,.92,.85][clamp(w,1,13)-1]}
function phaseReps(w){return w<=4?[10,8,8,6]:w<=8?[6,5,4,3]:w<=12?[4,3,2,2]:[3,2,1,1]}
function phaseSets(w){return w<=4?4:w<=8?5:w<=12?5:3}
function parseIsoNoon(isoStr){const p=(isoStr||"").split("-").map(Number);return new Date(p[0],(p[1]||1)-1,p[2]||1,12,0,0,0)}
function addCalendarDaysIso(isoStr,delta){const d=parseIsoNoon(isoStr);d.setDate(d.getDate()+delta);return isoFromDate(d)}
function sortedScheduleDays(){const raw=S.schedule.days||[1,2,3,4,5];return[...new Set(raw)].sort((a,b)=>a-b)}
function planSlotsN(){const plan=PLANS[S.planId!=null?S.planId:0];return Math.max(1,plan&&plan.slots?plan.slots.length:1)}
function firstTrainingIsoOnOrAfter(startIso){
  const sorted=sortedScheduleDays();if(!sorted.length)return null;
  let t=parseIsoNoon(startIso);
  for(let i=0;i<400;i++){
    if(sorted.includes(t.getDay()))return isoFromDate(t);
    t.setDate(t.getDate()+1);
  }
  return null;
}
function nextTrainingIso(isoStr){
  const sorted=sortedScheduleDays();if(!sorted.length)return null;
  let t=parseIsoNoon(isoStr);t.setDate(t.getDate()+1);
  for(let i=0;i<400;i++){
    if(sorted.includes(t.getDay()))return isoFromDate(t);
    t.setDate(t.getDate()+1);
  }
  return null;
}
function globalSessionIndexForDate(dateIso){
  const anchor=firstTrainingIsoOnOrAfter(S.program.start);
  if(!anchor||!dateIso||dateIso<anchor)return null;
  const sorted=sortedScheduleDays();
  if(!sorted.includes(parseIsoNoon(dateIso).getDay()))return null;
  let idx=0,cur=anchor;
  while(cur<dateIso){
    cur=nextTrainingIso(cur);
    if(!cur)return null;
    idx++;
  }
  return cur===dateIso?idx:null;
}
function blockWeekFromGlobalIdx(g){const N=planSlotsN();return clamp(Math.floor(g/N)+1,1,13)}
function referenceIsoForProgramWeek(){
  const today=iso(),sorted=sortedScheduleDays(),dow=new Date().getDay();
  if(sorted.includes(dow))return today;
  const n=nextTrainingIso(today);
  return n||today;
}
function autoWeek(){
  const ref=referenceIsoForProgramWeek();
  const g=globalSessionIndexForDate(ref);
  if(g===null){S.program.week=1;return}
  S.program.week=blockWeekFromGlobalIdx(g);
}
function trainingDatesForIndexRange(startG,endG){
  const anchor=firstTrainingIsoOnOrAfter(S.program.start);
  if(!anchor||startG>endG)return[];
  const out=[];
  let g=0,cur=anchor;
  while(cur&&g<startG){cur=nextTrainingIso(cur);g++}
  while(cur&&g<=endG){out.push(cur);cur=nextTrainingIso(cur);g++}
  return out;
}
function trainingDatesInBlockWeek(blockWeek){
  const N=planSlotsN();
  autoWeek();
  if(blockWeek===S.program.week){
    const ref=referenceIsoForProgramWeek();
    const g=globalSessionIndexForDate(ref);
    if(g!==null){
      const startG=Math.floor(g/N)*N;
      return trainingDatesForIndexRange(startG,startG+N-1);
    }
  }
  const startG=(blockWeek-1)*N;
  const endG=blockWeek*N-1;
  return trainingDatesForIndexRange(startG,endG);
}
/** Calendar days from first to last session in this training week — marks train vs rest by schedule. */
function calendarSpanRhythmDays(blockWeek){
  const tDates=trainingDatesInBlockWeek(blockWeek);
  if(!tDates.length)return[];
  const sortedSch=sortedScheduleDays();
  const min=tDates[0],max=tDates[tDates.length-1];
  const out=[];
  let cur=min;
  while(cur&&cur<=max){
    const dow=parseIsoNoon(cur).getDay();
    out.push({iso:cur,dow,train:sortedSch.includes(dow)});
    cur=addCalendarDaysIso(cur,1);
  }
  return out;
}
function rhythmStripHtmlForWeek(blockWeek){
  const days=calendarSpanRhythmDays(blockWeek);
  if(!days.length)return"";
  const cells=days.map(d=>{
    const short=shortDowLetter(d.dow);
    const cls=d.train?"plan-rhythm-train":"plan-rhythm-rest";
    const title=`${d.iso} · ${DAYS[d.dow]} · ${d.train?"Scheduled train day":"Rest / off template"}`;
    return`<span class="plan-rhythm-cell ${cls}" title="${title.replace(/"/g,"&quot;")}" aria-label="${title.replace(/"/g,"&quot;")}">${short}</span>`;
  }).join("");
  return`<div class="plan-week-rhythm" role="group" aria-label="Train and rest days spanning this training week"><span class="plan-rhythm-label">Week rhythm</span><div class="plan-rhythm-cells">${cells}</div><span class="plan-rhythm-legend" aria-hidden="true"><span class="plan-rhythm-train">●</span> train <span class="plan-rhythm-rest">●</span> rest</span></div>`;
}
function rollingPlanForDate(dateIso){
  const sorted=sortedScheduleDays();
  const dow=parseIsoNoon(dateIso).getDay();
  if(!sorted.includes(dow))return{focus:"Active Recovery",exs:[],finisher:"Light walk + foam rolling.",slot:null,blockWeek:null,globalIdx:null,sessionInWeek:null,sessionsPerWeek:planSlotsN()};
  const g=globalSessionIndexForDate(dateIso);
  if(g===null)return{focus:"Program starts soon",exs:[],finisher:"Check your start date in Settings.",slot:null,blockWeek:1,globalIdx:null,sessionInWeek:null,sessionsPerWeek:planSlotsN()};
  const plan=PLANS[S.planId!=null?S.planId:0];
  const N=planSlotsN();
  const blockWeek=blockWeekFromGlobalIdx(g);
  const slotIdx=g%N;
  const slot=(plan.slots&&plan.slots[slotIdx])||"FB";
  const p=mkDay(slot,blockWeek);
  p.slot=slot;
  p.blockWeek=blockWeek;
  p.globalIdx=g;
  p.sessionInWeek=slotIdx+1;
  p.sessionsPerWeek=N;
  p.exs=applyExerciseOrderForDate(dateIso,p.exs||[]);
  return p;
}
function getWkForDate(d){
  const N=planSlotsN();
  for(let i=0;i<21;i++){
    const isoStr=addCalendarDaysIso(d,-i);
    const g=globalSessionIndexForDate(isoStr);
    if(g!==null)return blockWeekFromGlobalIdx(g);
  }
  return 1;
}
function logsOnScheduleDaysThisWeek(){
  const wk=S.program.week;
  const dates=trainingDatesInBlockWeek(wk);
  let logged=0;
  for(const ds of dates)if(S.logs.some(l=>l.date===ds))logged++;
  return{logged,target:dates.length};
}
function ensureScheduleAdjust(){
  if(!S.scheduleAdjust)S.scheduleAdjust={catchUpQueue:[],missChoices:{},missSnoozed:{},extraTrainingIso:null,catchUpClearedDate:null};
  if(!Array.isArray(S.scheduleAdjust.catchUpQueue))S.scheduleAdjust.catchUpQueue=[];
  if(!S.scheduleAdjust.missChoices||typeof S.scheduleAdjust.missChoices!=="object")S.scheduleAdjust.missChoices={};
  if(!S.scheduleAdjust.missSnoozed||typeof S.scheduleAdjust.missSnoozed!=="object")S.scheduleAdjust.missSnoozed={};
  return S.scheduleAdjust;
}
function resolveCatchUpQueueAfterLog(logDate){
  const adj=ensureScheduleAdjust();
  const q=adj.catchUpQueue[0];
  if(!q)return;
  if(q.missedIso===logDate){
    adj.catchUpQueue=adj.catchUpQueue.filter(x=>x.missedIso!==logDate);
    delete adj.missChoices[q.missedIso];
    if(!adj.catchUpQueue.length){adj.extraTrainingIso=null;adj.catchUpClearedDate=null}
    return;
  }
  if(q.dueIso===logDate||adj.extraTrainingIso===logDate){
    if(adj.catchUpClearedDate===logDate)return;
    adj.catchUpClearedDate=logDate;
    adj.catchUpQueue.shift();
    if(adj.extraTrainingIso===logDate)adj.extraTrainingIso=null;
    if(!adj.catchUpQueue.length){adj.extraTrainingIso=null;adj.catchUpClearedDate=null}
  }
}
function oldestUnresolvedMiss(){
  const todayIso=iso();
  const anchor=firstTrainingIsoOnOrAfter(S.program.start);
  if(!anchor||todayIso<=anchor)return null;
  const adj=ensureScheduleAdjust();
  let cur=anchor;
  while(cur&&cur<todayIso){
    if(sortedScheduleDays().includes(parseIsoNoon(cur).getDay())){
      const hasLog=S.logs.some(l=>l.date===cur);
      const ch=adj.missChoices[cur];
      const sn=adj.missSnoozed[cur];
      if(!hasLog&&!ch&&!sn){
        const dow=parseIsoNoon(cur).getDay();
        return{date:cur,dayName:DAYS[dow],dow};
      }
    }
    cur=nextTrainingIso(cur);
  }
  return null;
}
function nextTrainingDotsHtml(maxDots){
  const n=maxDots||6;
  const today=iso();
  let d=sortedScheduleDays().includes(new Date().getDay())?today:(nextTrainingIso(today)||today);
  const parts=[];
  for(let i=0;i<n&&d;i++){
    const isToday=d===today;
    const dow=parseIsoNoon(d).getDay();
    const label=`${d} · ${DAYS[dow]} · ${parseIsoNoon(d).toLocaleDateString(undefined,{month:"short",day:"numeric"})}`;
    const letter=shortDowLetter(dow);
    parts.push(`<span class="train-tl-dot ${isToday?"train-tl-today":""}" title="${label}" aria-label="${label}">${letter}</span>`);
    d=nextTrainingIso(d);
  }
  return parts.length?`<div class="train-tl" role="presentation"><span style="font-size:10px;color:var(--text3);margin-right:8px">Next sessions</span>${parts.join("")}</div>`:"";
}
function trimStaleSkipped(st){
  st=st||S;
  const o=st.skippedEidsByDate||{};
  const cutoff=Date.now()-45*864e5;
  const n={};
  for(const k of Object.keys(o)){if(new Date(k+"T12:00:00").getTime()>=cutoff)n[k]=o[k]}
  st.skippedEidsByDate=n;
  const sf=st.sessionFeelByDate||{};
  const ns={};
  for(const k of Object.keys(sf)){if(new Date(k+"T12:00:00").getTime()>=cutoff)ns[k]=sf[k]}
  st.sessionFeelByDate=ns;
  const sa=st.scheduleAdjust;
  if(sa&&Array.isArray(sa.catchUpQueue)){
    sa.catchUpQueue=sa.catchUpQueue.filter(x=>{const m=x&&x.missedIso;if(!m)return false;return new Date(m+"T12:00:00").getTime()>=cutoff-60*864e5});
  }
  const sw=st.exerciseSwapsByDate||{};
  const nsw={};
  for(const k of Object.keys(sw)){if(new Date(k+"T12:00:00").getTime()>=cutoff)nsw[k]=sw[k]}
  st.exerciseSwapsByDate=nsw;
  const wu=st.warmupDoneByDate||{};
  const nwu={};
  for(const k of Object.keys(wu)){if(new Date(k+"T12:00:00").getTime()>=cutoff)nwu[k]=wu[k]}
  st.warmupDoneByDate=nwu;
  const eo=st.exerciseOrderByDate||{};
  const neo={};
  for(const k of Object.keys(eo)){if(new Date(k+"T12:00:00").getTime()>=cutoff)neo[k]=eo[k]}
  st.exerciseOrderByDate=neo;
  if(Array.isArray(st.extraActivities)){
    const t0=Date.now()-180*864e5;
    st.extraActivities=st.extraActivities.filter(a=>{if(!a||!a.date)return false;const t=new Date(String(a.date)+"T12:00:00").getTime();return!Number.isNaN(t)&&t>=t0});
  }
}
function weekIntentLine(w){
  const phase=phaseName(w).toLowerCase();
  const plan=PLANS[S.planId!=null?S.planId:0];
  const slots=new Set(plan&&plan.slots?plan.slots:[]);
  const lower=slots.has("HL")||slots.has("GL")||slots.has("HYG");
  const upper=slots.has("HP")||slots.has("HPL")||slots.has("HYP")||slots.has("HB");
  const run=slots.has("SR")||slots.has("TR");
  const parts=[];
  if(lower&&upper)parts.push("balanced upper + lower strength");
  else if(lower)parts.push("lower-body & glute bias");
  else if(upper)parts.push("upper-body strength bias");
  if(run)parts.push("one quality run stimulus");
  const fa=(S.goals.focusAreas||[]).filter(Boolean);
  const faBit=fa.length?` · ${fa.slice(0,2).join(" & ")}`:"";
  return`This training week (${phase}): ${parts.join(" + ")||"full-body progress"}${faBit}.`;
}
function weeklyExpectedChanges(){
  const plan=PLANS[S.planId!=null?S.planId:0];
  const slots=Array.isArray(plan&&plan.slots)?plan.slots:[];
  const score={glutes:0,core:0,back:0,posture:0};
  const W={
    glutes:{HL:3,GL:4,HYG:4,HB:2,FBC:1,CT:1,FB:2},
    core:{CT:4,FBC:3,SR:2,TR:2,HB:2,FB:2,GL:2,HYG:2},
    back:{HPL:4,HYL:4,HP:2,FB:2,HB:1,PW:2},
    posture:{HPL:4,HYL:3,GL:2,HP:2,FB:2,TR:1,SR:1}
  };
  for(const sl of slots){
    score.glutes+=W.glutes[sl]||0;
    score.core+=W.core[sl]||0;
    score.back+=W.back[sl]||0;
    score.posture+=W.posture[sl]||0;
  }
  const mx=Math.max(1,...Object.values(score));
  return{
    glutes:Math.round(score.glutes/mx*100),
    core:Math.round(score.core/mx*100),
    back:Math.round(score.back/mx*100),
    posture:Math.round(score.posture/mx*100)
  };
}
function milestoneCheckpointCopy(w){
  if(w===4||w===8)return{title:"Deload checkpoint",body:"Week "+w+" eases volume on purpose so you absorb the last block and come back stronger. This is planned progression — not lost time."};
  if(w===13)return{title:"Test week",body:"Treat heavy work as crisp technique practice. Log honestly; scores inform the next block without judging you."};
  return null;
}
function firstMissedScheduledSession(){return oldestUnresolvedMiss()}
function feelLiftDelta(feel){if(feel==="easy")return .007;if(feel==="hard")return -.011;return 0}
function applyFeelToLogAdapt(log){
  const type=inferType(log.exercise);
  const d=feelLiftDelta(log.liftFeel||"ok");
  if(!d)return;
  if(type==="bench")S.adapt.bench=clamp(S.adapt.bench+d,.85,1.28);
  else if(type==="squat")S.adapt.squat=clamp(S.adapt.squat+d,.85,1.28);
  else if(type==="dead")S.adapt.dead=clamp(S.adapt.dead+d,.85,1.28);
  else if(type==="run")S.adapt.run=clamp(S.adapt.run+d*.85,.82,1.22);
}
function applySessionFeelNudge(feel){
  if(feel==="easy"){S.adapt.bench=clamp(S.adapt.bench+.004,.85,1.28);S.adapt.squat=clamp(S.adapt.squat+.004,.85,1.28);S.adapt.dead=clamp(S.adapt.dead+.004,.85,1.28);S.adapt.run=clamp(S.adapt.run+.003,.82,1.22)}
  else if(feel==="hard"){S.adapt.bench=clamp(S.adapt.bench-.006,.85,1.28);S.adapt.squat=clamp(S.adapt.squat-.006,.85,1.28);S.adapt.dead=clamp(S.adapt.dead-.006,.85,1.28);S.adapt.run=clamp(S.adapt.run-.005,.82,1.22)}
}
function revertSessionFeelNudge(feel){
  if(feel==="easy"){S.adapt.bench=clamp(S.adapt.bench-.004,.85,1.28);S.adapt.squat=clamp(S.adapt.squat-.004,.85,1.28);S.adapt.dead=clamp(S.adapt.dead-.004,.85,1.28);S.adapt.run=clamp(S.adapt.run-.003,.82,1.22)}
  else if(feel==="hard"){S.adapt.bench=clamp(S.adapt.bench+.006,.85,1.28);S.adapt.squat=clamp(S.adapt.squat+.006,.85,1.28);S.adapt.dead=clamp(S.adapt.dead+.006,.85,1.28);S.adapt.run=clamp(S.adapt.run+.005,.82,1.22)}
}
function todayPlanFiltered(){
  autoWeek();
  const todayIso=activeTrainIso();
  const adj=ensureScheduleAdjust();
  const q=adj.catchUpQueue[0];
  let base;
  if(q&&q.dueIso===todayIso){
    base=mkDay(q.slot,q.blockWeek);
    base.slot=q.slot;
    base.blockWeek=q.blockWeek;
    base.globalIdx=q.globalIdx;
    const N=planSlotsN();
    base.sessionInWeek=(q.globalIdx%N)+1;
    base.sessionsPerWeek=N;
    base._catchUpDue=true;
    base.exs=applyExerciseOrderForDate(todayIso,base.exs||[]);
  }else if(adj.extraTrainingIso===todayIso&&q){
    base=mkDay(q.slot,q.blockWeek);
    base.slot=q.slot;
    base.blockWeek=q.blockWeek;
    base.globalIdx=q.globalIdx;
    const N=planSlotsN();
    base.sessionInWeek=(q.globalIdx%N)+1;
    base.sessionsPerWeek=N;
    base._catchUpExtra=true;
    base.exs=applyExerciseOrderForDate(todayIso,base.exs||[]);
  }else{
    base=rollingPlanForDate(todayIso);
  }
  const skip=new Set((S.skippedEidsByDate&&S.skippedEidsByDate[todayIso])||[]);
  const swapMap=(S.exerciseSwapsByDate&&S.exerciseSwapsByDate[todayIso])||{};
  let exs=(base.exs||[]).map(ex=>{
    const originalEid=ex.originalEid||ex.eid;
    const alt=swapMap[originalEid];
    if(!alt||alt===ex.eid)return{...ex,originalEid};
    const ne=exById(alt);
    let target=ex.target;
    if(S.lastLiftByEid&&S.lastLiftByEid[alt]!=null)target=S.lastLiftByEid[alt];
    const tag=ne?`Similar: ${ne.name}`:"Swapped";
    return{...ex,eid:alt,originalEid,target,reason:ex.reason?`${ex.reason} · ${tag}`:tag};
  });
  exs=exs.filter(ex=>!skip.has(ex.eid));
  const qm=Number((S.profile.prefs||{}).quickSessionMin)||0;
  const missedActive=!!(adj.catchUpQueue&&adj.catchUpQueue.length);
  const autoQuick=(getStreak()===0&&missedActive)?15:0;
  const effectiveQuick=Math.max(qm,autoQuick);
  const quickNote=effectiveQuick>0&&base.exs.length>2;
  if(effectiveQuick>0&&exs.length>2)exs=exs.slice(0,2);
  return{...base,exs,quickNote};
}
function sessionIndexForEid(eid){
  const plan=todayPlanFiltered();
  const exs=plan.exs||[];
  return exs.findIndex(ex=>ex.eid===eid);
}
function celebrateFinish(){
  const now=Date.now();
  if(now-(window.__hwConfettiT||0)<2200)return;
  window.__hwConfettiT=now;
  const root=document.getElementById("confetti-layer");
  if(!root)return;
  root.innerHTML="";
  root.classList.add("show");
  root.setAttribute("aria-hidden","false");
  const n=70;
  for(let i=0;i<n;i++){
    const p=document.createElement("span");
    p.className="confetti-piece";
    p.style.left=Math.random()*100+"vw";
    p.style.animationDelay=Math.random()*0.28+"s";
    p.style.background=`hsl(${Math.random()*360},82%,58%)`;
    root.appendChild(p);
  }
  setTimeout(()=>{root.classList.remove("show");root.innerHTML="";root.setAttribute("aria-hidden","true")},4200);
}
function scrollToHashAfterRender(hash){if(!hash)return;requestAnimationFrame(()=>{const el=document.querySelector(hash);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})})}
const GLOBAL_SEARCH_SETTINGS_ROWS=[
  {label:"Training profile & 1RM",sub:"Body weight, light mode, units, equipment",blob:"profile strength bench squat deadlift weight appearance light dark units metric imperial kg lb equipment session style quick",scroll:"#settings-profile"},
  {label:"Account & plan",sub:"Sign out, program start, switch plan",blob:"account email firebase sign plan program start onboard",scroll:"#settings-account"},
  {label:"Bar load helper",sub:"Plate pairs per side",blob:"plate barbell calculator load olympic gym",scroll:"#settings-plates"},
  {label:"Activity & health",sub:"Steps, calories, exercise minutes",blob:"health wearables steps calories activity clipboard apple google fit",scroll:"#settings-health"},
  {label:"Data & backup",sub:"Export, import, clear logs",blob:"data backup export import json csv clear logs",scroll:"#settings-data"},
  {label:"Adaptation multipliers",sub:"Reset bench, squat, deadlift, run tuning",blob:"adaptation reset multiplier advanced deload",scroll:"#settings-profile"}
];
function escSearch(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function closeGlobalSearch(){
  const ov=document.getElementById("global-search-overlay");if(!ov)return;
  ov.hidden=true;ov.setAttribute("aria-hidden","true");document.body.classList.remove("global-search-open");
  document.removeEventListener("keydown",globalSearchKeydown,true);
}
function globalSearchKeydown(ev){if(ev.key==="Escape"){ev.preventDefault();closeGlobalSearch()}}
function openGlobalSearch(){
  closeGlobalSearch();
  const ov=document.getElementById("global-search-overlay");if(!ov)return;
  ov.hidden=false;ov.setAttribute("aria-hidden","false");document.body.classList.add("global-search-open");
  document.addEventListener("keydown",globalSearchKeydown,true);
  const inp=document.getElementById("global-search-input");
  if(inp){inp.value="";inp.focus();fillGlobalSearchResults("")}
}
function navigateFromGlobalSearch(opts){
  closeGlobalSearch();
  if(opts.tab===TAB_TRAIN){
    tab=TAB_TRAIN;location.hash=TAB_TRAIN;
    trainSub=opts.trainSub||"workout";
    if(opts.eid!=null){
      const ix=sessionIndexForEid(opts.eid);
      if(ix>=0){
        logHistoryFilter="";
        sessionStorage.setItem("hw-scroll",`#exc-${ix}`);
      }else{
        trainSub="log";
        const ex=exById(opts.eid);
        logHistoryFilter=(ex&&ex.name)||String(opts.eid);
        sessionStorage.setItem("hw-refocus-log-q","1");
        sessionStorage.setItem("hw-scroll","#log-history-fold");
      }
    }
    if(opts.logDate){
      trainSub="log";
      logDate=opts.logDate;
      if(opts.logFilter!=null)logHistoryFilter=opts.logFilter;
      sessionStorage.setItem("hw-scroll","#log-history-fold");
      sessionStorage.setItem("hw-refocus-log-q","1");
    }
  }else if(opts.tab===TAB_YOU){
    tab=TAB_YOU;location.hash=TAB_YOU;
    youSub=opts.youSub||"settings";
    if(opts.scroll)sessionStorage.setItem("hw-scroll",opts.scroll);
  }
  render();
}
function fillGlobalSearchResults(raw){
  const host=document.getElementById("global-search-results");if(!host)return;
  const q=String(raw||"").toLowerCase().trim();
  const sections=[];
  const exHits=[];
  for(const e of EX){
    const blob=[e.name,e.id,(e.tags||[]).join(" "),(e.kw||[]).join(" ")].join(" ").toLowerCase();
    if(!q||blob.includes(q))exHits.push(e);
    if(exHits.length>=24)break;
  }
  if(exHits.length){
    const rows=exHits.map(e=>`<button type="button" class="global-search-hit" data-kind="ex" data-eid="${escSearch(e.id)}"><span class="global-search-hit-title">${escSearch(e.name)}</span><span class="global-search-hit-sub">Exercise · open in Train</span></button>`).join("");
    sections.push(`<div class="global-search-section"><div class="global-search-sec-title">Exercises</div>${rows}</div>`);
  }
  const logHits=[];let ln=0;
  if(S.logs&&S.logs.length){
    const seen=new Set();
    for(const l of [...S.logs].reverse()){
      if(ln>=18)break;
      const blob=`${l.exercise||""} ${l.date||""} ${l.note||""}`.toLowerCase();
      if(q&&!blob.includes(q))continue;
      const k=`${l.date}|${l.exercise}`;
      if(seen.has(k))continue;
      seen.add(k);
      logHits.push(l);ln++;
    }
  }
  if(logHits.length){
    const rows=logHits.map(l=>`<button type="button" class="global-search-hit" data-kind="log" data-date="${escSearch(l.date)}" data-ex="${escSearch(l.exercise||"")}"><span class="global-search-hit-title">${escSearch(l.exercise||"Log")}</span><span class="global-search-hit-sub">${escSearch(l.date)} · ${escSearch(formatLoadLbText(l.aW))}</span></button>`).join("");
    sections.push(`<div class="global-search-section"><div class="global-search-sec-title">Workout logs</div>${rows}</div>`);
  }
  const setHits=GLOBAL_SEARCH_SETTINGS_ROWS.filter(r=>!q||(`${r.label} ${r.sub} ${r.blob}`).toLowerCase().includes(q));
  if(setHits.length){
    const rows=setHits.map(r=>`<button type="button" class="global-search-hit" data-kind="set" data-scroll="${escSearch(r.scroll)}"><span class="global-search-hit-title">${escSearch(r.label)}</span><span class="global-search-hit-sub">${escSearch(r.sub)}</span></button>`).join("");
    sections.push(`<div class="global-search-section"><div class="global-search-sec-title">Settings</div>${rows}</div>`);
  }
  if(!sections.length){
    host.innerHTML=q?`<p class="global-search-empty">No matches. Try another word or check spelling.</p>`:`<p class="global-search-empty">Search exercises, your logs, and settings. Type to filter.</p>`;
    return;
  }
  host.innerHTML=sections.join("");
  host.querySelectorAll(".global-search-hit[data-kind=\"ex\"]").forEach(btn=>{
    btn.onclick=()=>navigateFromGlobalSearch({tab:TAB_TRAIN,eid:btn.dataset.eid});
  });
  host.querySelectorAll(".global-search-hit[data-kind=\"log\"]").forEach(btn=>{
    btn.onclick=()=>navigateFromGlobalSearch({tab:TAB_TRAIN,logDate:btn.dataset.date,logFilter:btn.dataset.ex||""});
  });
  host.querySelectorAll(".global-search-hit[data-kind=\"set\"]").forEach(btn=>{
    btn.onclick=()=>navigateFromGlobalSearch({tab:TAB_YOU,youSub:"settings",scroll:btn.dataset.scroll});
  });
}
function bindGlobalSearch(){
  const ov=document.getElementById("global-search-overlay");if(!ov||ov.dataset.bound==="1")return;
  ov.dataset.bound="1";
  document.getElementById("global-search-backdrop")?.addEventListener("click",closeGlobalSearch);
  document.getElementById("global-search-close")?.addEventListener("click",closeGlobalSearch);
  const inp=document.getElementById("global-search-input");
  if(inp){
    let t=null;
    inp.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(()=>fillGlobalSearchResults(inp.value),90)});
  }
}

function sessionBreadcrumb(w,plan){
  const phase=phaseName(w);
  const head=(plan.focus||"Today's session").split("·")[0].trim().slice(0,52);
  const pos=plan.sessionInWeek&&plan.sessionsPerWeek?` · Session ${plan.sessionInWeek} of ${plan.sessionsPerWeek}`:"";
  return`Week ${w} · ${phase}${pos} · ${head}${plan.finisher?" + finisher":""}`;
}
function blockPositionLine(plan){
  if(!plan||!plan.sessionInWeek||!plan.sessionsPerWeek)return"";
  return`Block position: ${plan.sessionInWeek} of ${plan.sessionsPerWeek} this training week`;
}
function parseRestSec(restStr){
  const raw=String(restStr||"").trim();
  const s=raw.toLowerCase();
  const plain=s.replace(/\s/g,"");
  if(/^\d+$/.test(plain)){const v=+plain;if(v>0&&v<=1200)return v}
  let m=s.match(/(\d+)\s*-\s*(\d+)\s*min/);if(m)return Math.round((+m[1]+ +m[2])/2*60);
  m=s.match(/(\d+(?:\.\d+)?)\s*min/);if(m)return Math.max(30,Math.round(+m[1]*60));
  m=s.match(/(\d+)\s*s(?:ec)?(?:onds?)?/);if(m)return Math.max(15,+m[1]);
  if(/\d/.test(s)&&s.includes("min")){const n=s.match(/(\d+)/);if(n)return Math.max(30,+n[1]*60)}
  if(s.includes("walk")||s.includes("—"))return 75;
  return 90;
}
function formatRestHuman(sec){
  const n=Math.max(0,Math.round(Number(sec)||0));
  const mm=Math.floor(n/60),ss=n%60;
  if(mm<=0)return`${ss||0} sec`;
  if(ss===0)return`${mm} min`;
  return`${mm}:${String(ss).padStart(2,"0")} min`;
}
function warmupStepsFromPlan(warmupStr){
  const s=String(warmupStr||"").trim();
  if(!s)return[];
  return s.split(/\s*→\s*|(?:\r?\n)+|•\s+/).map(x=>x.trim()).filter(Boolean);
}
function lastLogSummaryForEid(eid){
  const e=exById(eid);const name=e?e.name:eid;
  const row=[...S.logs].reverse().find(l=>l.exercise===name);
  if(!row)return"";
  return`Last: ${row.aS}×${row.aR} @ ${formatLoadLbText(row.aW)}`;
}
function exerciseVideoThumbUrl(videoUrl){
  const u=String(videoUrl||"");
  const m=u.match(/embed\/([\w-]+)/)||u.match(/youtu\.be\/([\w-]+)/)||u.match(/[?&]v=([\w-]+)/)||u.match(/shorts\/([\w-]+)/);
  return m?`https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`:"";
}
function shortDowLetter(dow){const L=["Su","M","T","W","Th","F","Sa"];return L[dow]||"—"}
function formatRestMs(ms){if(ms<=0)return"0:00";const t=Math.ceil(ms/1000),mm=Math.floor(t/60),ss=t%60;return mm+":"+String(ss).padStart(2,"0")}
let restTimerId=null,restEndMs=0;
let workoutWakeLock=null;
function stopRestTimer(){if(restTimerId){clearInterval(restTimerId);restTimerId=null}const bar=document.getElementById("restBar");if(bar)bar.style.display="none"}
function startRestTimer(sec,nameHint){
  const bar=document.getElementById("restBar"),lab=document.getElementById("restBarLabel"),tim=document.getElementById("restBarTime");
  if(!bar||!tim)return;
  lab.textContent=nameHint?"Rest — "+nameHint:"Rest between sets";
  bar.style.display="block";
  restEndMs=Date.now()+Math.max(10,sec)*1000;
  const tick=()=>{const left=restEndMs-Date.now();tim.textContent=formatRestMs(left);if(left<=0){stopRestTimer();hapticPulse([50]);toast("Rest finished")}};
  tick();if(restTimerId)clearInterval(restTimerId);restTimerId=setInterval(tick,400);
}
function calcPlatesPerSide(totalLb,barLb){
  if(totalLb<=0)return{ok:true,plates:[],perSide:0,note:""};
  const perSide=(totalLb-barLb)/2;
  if(perSide<=0)return{ok:true,plates:[],perSide:0,note:""};
  const sizes=[45,35,25,10,5,2.5];
  let left=Math.round(perSide*100)/100;
  const plates=[];
  for(const p of sizes){const n=Math.floor((left+1e-6)/p);if(n>0){plates.push({lb:p,n});left=Math.round((left-n*p)*100)/100}}
  if(left>0.2)return{ok:false,plates,perSide,left};
  return{ok:true,plates,perSide};
}
function formatPlateResult(r,barLb){
  if(r.perSide<=0)return`No plates needed (bar ${barLb} lb matches or exceeds target).`;
  if(!r.ok)return`Closest fit — ${r.perSide} lb/side loads to ${barLb+2*r.perSide} lb total. Remainder ~${r.left} lb/side needs micro plates or a different target.`;
  const parts=r.plates.map(x=>x.n+"×"+x.lb).join(" + ");
  return`${r.perSide} lb per side: ${parts||"(none)"} — check total: ${barLb+2*r.perSide} lb`;
}
function calcPlatesPerSideKg(totalKg,barKg){
  if(totalKg<=0)return{ok:true,plates:[],perSide:0,note:""};
  const perSide=(totalKg-barKg)/2;
  if(perSide<=0)return{ok:true,plates:[],perSide:0,note:""};
  const sizes=[25,20,15,10,5,2.5,1.25];
  let left=Math.round(perSide*100)/100;
  const plates=[];
  for(const p of sizes){const n=Math.floor((left+1e-6)/p);if(n>0){plates.push({kg:p,n});left=Math.round((left-n*p)*100)/100}}
  if(left>0.15)return{ok:false,plates,perSide,left};
  return{ok:true,plates,perSide};
}
function formatPlateResultKg(r,barKg){
  if(r.perSide<=0)return`No plates needed (bar ${barKg} kg matches or exceeds target).`;
  if(!r.ok)return`Closest fit — ${r.perSide} kg/side loads to ${barKg+2*r.perSide} kg total. Remainder ~${r.left} kg/side — add change plates or adjust target.`;
  const parts=r.plates.map(x=>x.n+"×"+x.kg).join(" + ");
  return`${r.perSide} kg per side: ${parts||"(none)"} — check total: ${barKg+2*r.perSide} kg`;
}
function trainPlateHelperBlockHtml(){
  const m=useMetric();
  const hint=m?"Pairs per side for standard kg plates (25, 20, 15, 10, 5, 2.5, 1.25 kg).":"Pairs per side for standard plates (45, 35, 25, 10, 5, 2.5 lb).";
  const totLab=m?"Target total (kg)":"Target total (lb)";
  const ph=m?"e.g. 102.5":"e.g. 225";
  const barInner=m?`<option value="20" selected>20 kg</option><option value="15">15 kg</option><option value="10">10 kg technique</option><option value="0">No bar</option>`:`<option value="45" selected>45 lb</option><option value="35">35 lb</option><option value="20">20 lb technique</option><option value="0">No bar</option>`;
  const blab=m?"Bar (kg)":"Bar weight";
  return`<p style="font-size:12px;color:var(--text2);margin-bottom:10px">${hint}</p>
      <div class="grid3">
        <div><label>${totLab}</label><input type="number" id="tw-pl-total" step="0.5" placeholder="${ph}" min="0"></div>
        <div><label>${blab}</label><select id="tw-pl-bar">${barInner}</select></div>
        <div style="align-self:end"><button type="button" class="btn btn-secondary-solid btn-block" id="tw-pl-calc">Calculate</button></div>
      </div>`;
}
function setLoadOverlayHtml(){
  const m=useMetric();
  const totLab=m?"Total load (kg)":"Total load (lb)";
  const ph=m?"e.g. 100":"e.g. 225";
  const barInner=m?`<option value="20" selected>20 kg</option><option value="15">15 kg</option><option value="10">10 kg technique</option><option value="0">No bar</option>`:`<option value="45" selected>45 lb</option><option value="35">35 lb</option><option value="20">20 lb technique</option><option value="0">No bar</option>`;
  const blab=m?"Bar (kg)":"Bar weight";
  return`<div class="set-load-overlay" id="set-load-overlay" aria-hidden="true"><div class="set-load-sheet" role="dialog" aria-modal="true" aria-labelledby="set-load-title"><div id="set-load-title" style="font-size:15px;font-weight:600;margin-bottom:4px">Bar load helper</div><p style="font-size:11px;color:var(--text3);margin-bottom:12px;line-height:1.45">Check per-side plates without leaving your set.</p><div class="grid2" style="gap:8px"><div><label>${totLab}</label><input type="number" id="set-load-total" min="0" step="0.5" placeholder="${ph}"></div><div><label>${blab}</label><select id="set-load-bar">${barInner}</select></div></div><div id="set-load-out" style="font-size:12px;color:var(--text2);margin-top:10px;line-height:1.45"></div><div class="row" style="gap:8px;margin-top:12px"><button type="button" class="btn btn-secondary-solid btn-sm" id="set-load-calc">Calculate</button><button type="button" class="btn btn-cta btn-sm" id="set-load-use">Use load</button><button type="button" class="btn btn-ghost btn-sm" id="set-load-close">Close</button></div></div></div>`;
}
function runPlateCalc(totalInput,barInput){
  const total=Number(totalInput)||0,bar=Number(barInput)||0;
  if(total<=0)return{err:"Enter a target weight."};
  if(useMetric()){const r=calcPlatesPerSideKg(total,bar);return{text:formatPlateResultKg(r,bar)}}
  const r=calcPlatesPerSide(total,bar);return{text:formatPlateResult(r,bar)};
}
function normalizeTabs(){if(tab==="dash"){tab=TAB_YOU;youSub="home"}else if(tab==="today"){tab=TAB_TRAIN;trainSub="workout"}else if(tab==="log"){tab=TAB_TRAIN;trainSub="log"}else if(tab==="program")tab=TAB_PLAN;else if(tab==="settings"){tab=TAB_YOU;youSub="settings"}else if(tab==="ref"){tab=TAB_YOU;youSub="home"}}
function isExLoggedToday(eid){const e=exById(eid),name=e?e.name:eid;const d=activeTrainIso();return S.logs.some(l=>l.date===d&&l.exercise===name)}
function inferType(n){n=(n||"").toLowerCase();if(n.includes("bench")||n.includes("incline")||n.includes("close")||n.includes("dip"))return"bench";if((n.includes("squat")&&!n.includes("air"))||n.includes("bulgarian"))return"squat";if(n.includes("deadlift")||n.includes("rdl"))return"dead";if(n.includes("run")||n.includes("800")||n.includes("tempo"))return"run";return"acc"}
function getStreak(){const dates=new Set(S.logs.map(l=>l.date));let s=0;const d=new Date();for(let i=0;i<30;i++){const dd=new Date(d);dd.setDate(dd.getDate()-i);if(dates.has(isoFromDate(dd)))s++;else if(i>0)break;}return s}
function weekHasLogs(w){const dates=trainingDatesInBlockWeek(w);return dates.some(ds=>S.logs.some(l=>l.date===ds))}
function trendArrow(type){const r=S.logs.filter(l=>inferType(l.exercise)===type).slice(-6);if(r.length<2)return{i:"→",c:"trend-flat",t:"Gathering data"};const f=r.slice(0,3).reduce((s,l)=>s+(l.score||1),0)/Math.min(3,r.length);const l=r.slice(-3).reduce((s,x)=>s+(x.score||1),0)/Math.min(3,r.length);if(l>f*1.03)return{i:"↑",c:"trend-up",t:"Improving"};if(l<f*.97)return{i:"↓",c:"trend-down",t:"Consider deload"};return{i:"→",c:"trend-flat",t:"Steady"}}
function toast(m,opt){
  opt=opt||{};
  const el=document.getElementById("toast");if(!el)return;
  if(toastTimer)clearTimeout(toastTimer);
  el.classList.remove("show");
  const dur=opt.duration||(opt.undo?6800:3400);
  requestAnimationFrame(()=>{
    if(opt.undo){
      el.innerHTML=`<span class="toast-msg">${m}</span><button type="button" class="toast-undo">Undo</button>`;
      el.querySelector(".toast-undo").onclick=()=>{opt.undo();el.classList.remove("show");toast("Undone")};
    }else el.innerHTML=`<span class="toast-msg">${m}</span>`;
    el.classList.add("show");toastTimer=setTimeout(()=>el.classList.remove("show"),dur);
  });
}
function gaugeHTML(pct,val,sub,color){const c=282.74,off=c*(1-clamp(pct,0,1));return`<div class="gauge"><svg width="100" height="100" viewBox="0 0 100 100"><circle class="gauge-bg" cx="50" cy="50" r="45"/><circle class="gauge-fill" cx="50" cy="50" r="45" stroke="${color}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><div class="gauge-center"><div class="gauge-val">${val}</div><div class="gauge-sub">${sub}</div></div></div>`}
function heatmapBandLabel(pct){const p=Number(pct)||0;if(p>=66)return"High";if(p>=34)return"Med";return"Low"}
function dashLogDayHeader(isoD){
  const t=iso();const y=addCalendarDaysIso(t,-1);
  if(isoD===t)return"Today";
  if(isoD===y)return"Yesterday";
  const dt=parseIsoNoon(isoD);return dt.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
}
function fiveKGoalProgressDisplay(goalSec,fkSec){
  const g=Number(goalSec)||0,b=Number(fkSec)||0;
  if(g<=0)return{pct:0,sub:"est 5K",line:"Set a 5K goal in onboarding.",bestLabel:"—"};
  if(!isFinite(b)||b<=0)return{pct:0,sub:"est 5K",line:`Goal ${mmss(g)} · log a 4-mile pace in Training &amp; profile to estimate your current 5K.`,bestLabel:"—"};
  const faster=b<=g;
  const pct=faster?1:clamp(g/b,0,1);
  return{pct,sub:"est 5K",line:`Current best ~ <b style="color:var(--text)">${mmss(Math.round(b))}</b> · Goal <b style="color:var(--text)">${mmss(g)}</b>${faster?" · at or ahead of goal":""}`,bestLabel:mmss(Math.round(b))};
}
function estCalories(type,mins,weightLb){const kg=weightLb*0.4536;const met=type==="run"?9.5:type==="acc"?5:6.5;return Math.round(met*kg*(mins/60))}
function weightTrend(){const wl=S.weightLog.slice(-14);if(wl.length<2)return null;const first=wl[0].wt,last=wl[wl.length-1].wt;return{change:last-first,perWeek:(last-first)/(wl.length/7||1),last}}
function exMedia(eid){
  const base=EX_MEDIA[eid]||{video:"",grow:["fullBody"],burn:["fullBody"]};
  if(S.profile.sex==="female"){
    const alt=EX_MEDIA_FEMALE[eid];
    if(alt&&alt.video)return{...base,...alt,video:alt.video};
  }
  return base;
}
function exerciseQuickDemoEligible(){
  return S.profile.sex==="female"||womenBlueprintMode()!=="none";
}
function exerciseQuickDemoUrl(eid){
  if(!exerciseQuickDemoEligible()||!eid)return"";
  return EX_QUICK_DEMO_VIDEO[eid]||"";
}
function exMuscles(eid){
  const m=EX_MUSCLE_IDS[eid]||{primary:[],secondary:[],tertiary:[],burn:[]};
  return{
    primary:[...new Set(m.primary||[])],
    secondary:[...new Set(m.secondary||[])],
    tertiary:[...new Set(m.tertiary||[])],
    burn:[...new Set(m.burn||[])]
  };
}
function muscleOverlapKeys(eid){
  const m=exMuscles(eid);
  return new Set([...(m.primary||[]),...(m.secondary||[])]);
}
function similarExerciseAlternatives(templateEid){
  const base=exById(templateEid);if(!base)return[];
  const myTags=new Set(base.tags||[]);
  const pSet=muscleOverlapKeys(templateEid);
  const home=(S.profile.prefs||{}).equipment==="home";
  const gymOnly=new Set(["bench","squat","deadlift","row","cgbench"]);
  function score(x){
    if(x.id===templateEid)return-1;
    if(home&&gymOnly.has(x.id))return-1;
    const xt=new Set(x.tags||[]);
    let t=0;for(const k of xt)if(myTags.has(k))t++;
    let mu=0;for(const k of muscleOverlapKeys(x.id))if(pSet.has(k))mu++;
    if(t<1&&mu<1)return-1;
    return t*4+mu*2;
  }
  return EX.map(x=>({x,s:score(x)})).filter(o=>o.s>=0).sort((a,b)=>b.s-a.s).map(o=>o.x).slice(0,12);
}
function ytId(u){
  if(!u)return"";
  const m=u.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m?m[1]:"";
}
function embedVideoUrl(u){
  const id=ytId(u);
  if(id)return`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`;
  return u;
}
function openVideoUrl(u){
  const id=ytId(u);
  return id?`https://www.youtube.com/watch?v=${id}`:u;
}
/* Runtime anatomy uses layered SVGs; assets_muscles_front_back.svg is reference art only (not loaded here). */
const ANATOMY_ASSET_FRONT="./assets_muscle_layer_front.svg";
const ANATOMY_ASSET_BACK="./assets_muscle_layer_back.svg";
let anatomySvgCache={front:"",back:""};
function anatomyContainer(payload){return`<div class="anatomy-target" data-map="${encodeURIComponent(JSON.stringify(payload))}"></div>`}
function muscleTokensForZone(z){
  const M={
    chest:["pectoralis","serratus"],
    triceps:["triceps"],
    biceps:["biceps","brachialis"],
    frontShoulders:["anterior_deltoid","deltoid"],
    rearShoulders:["posterior_deltoid","lateral_deltoid","deltoid"],
    sideShoulders:["lateral_deltoid","deltoid"],
    back:["latissimus","trapezius","rhomboid","infraspinatus","teres","erector_spinae"],
    core:["rectus_abdominis","oblique","transverse_abdominis"],
    glutes:["gluteus"],
    quads:["rectus_femoris","vastus","sartoris"],
    hamstrings:["biceps_femoris","semitendinosus","semimembranosus"],
    calves:["gastrocnemius","soleus","tibialis","fibularis"],
    forearms:["brachioradialis","extensor","flexor","pronator","anconeus"],
    hips:["adductor","iliotibial","pectineus","gracilis"],
    upperBody:["pectoralis","deltoid","trapezius","latissimus","biceps","triceps","rhomboid","serratus","forearm","brachio"],
    lowerBody:["gluteus","quadr","rectus_femoris","vastus","hamstring","gastrocnemius","soleus","tibialis","adductor","sartorius","iliotibial"],
    fullBody:["pectoralis","deltoid","trapezius","latissimus","biceps","triceps","rectus_abdominis","oblique","gluteus","rectus_femoris","vastus","hamstring","gastrocnemius","soleus","adductor"]
  };
  return M[z]||[];
}
function hasToken(id,tokens){const s=(id||"").toLowerCase();return tokens.some(t=>s.includes(t.toLowerCase()))}
async function loadAnatomySvg(which){
  if(anatomySvgCache[which])return anatomySvgCache[which];
  const url=which==="front"?ANATOMY_ASSET_FRONT:ANATOMY_ASSET_BACK;
  const txt=await fetch(url,{cache:"no-store"}).then(r=>r.text());
  anatomySvgCache[which]=txt;
  return txt;
}
function prettyMuscleName(id){
  return (id||"").replace(/_/g," ").replace(/\b(l|r)\b/gi,"").replace(/\s+/g," ").trim().replace(/\b\w/g,m=>m.toUpperCase());
}
function tintAnatomySvg(svgText,intensity){
  const primary=intensity.primary||[],secondary=intensity.secondary||[],tertiary=intensity.tertiary||[],burn=intensity.burn||[];
  const isIdList=(arr)=>arr.some(x=>(x||"").includes("_")||["fullBody","upperBody","lowerBody","core"].includes(x));
  const pTokens=isIdList(primary)?[]:[...new Set(primary.flatMap(muscleTokensForZone))];
  const sTokens=isIdList(secondary)?[]:[...new Set(secondary.flatMap(muscleTokensForZone))];
  const tTokens=isIdList(tertiary)?[]:[...new Set(tertiary.flatMap(muscleTokensForZone))];
  const bTokens=isIdList(burn)?[]:[...new Set(burn.flatMap(muscleTokensForZone))];
  const pIds=new Set(isIdList(primary)?primary:[]);
  const sIds=new Set(isIdList(secondary)?secondary:[]);
  const tIds=new Set(isIdList(tertiary)?tertiary:[]);
  const bIds=new Set(isIdList(burn)?burn:[]);
  const doc=new DOMParser().parseFromString(svgText,"image/svg+xml");
  [...doc.querySelectorAll("[id]")].forEach(el=>{
    const id=el.id||"";
    const p=pIds.has(id)||hasToken(id,pTokens);
    const s=sIds.has(id)||hasToken(id,sTokens);
    const t=tIds.has(id)||hasToken(id,tTokens);
    const b=bIds.has(id)||hasToken(id,bTokens);
    let lvl=p?1:s?0.72:t?0.45:0;
    const hit=p||s||t;
    if(hit&&b){el.setAttribute("fill","#ffd740");el.setAttribute("fill-opacity",String(Math.max(0.45,lvl)))}
    else if(hit){el.setAttribute("fill","#00e676");el.setAttribute("fill-opacity",String(Math.max(0.35,lvl)))}
    else if(b){el.setAttribute("fill","#ff6b35");el.setAttribute("fill-opacity","0.65")}
    else {
      const base=el.getAttribute("fill");
      if(base&&base!=="none"){el.setAttribute("fill","#4a4e64");el.setAttribute("fill-opacity","0.2")}
    }
    if(hit||b){
      el.style.cursor="pointer";
      el.setAttribute("data-muscle-name",prettyMuscleName(id));
      el.setAttribute("data-intensity",p?"Primary":s?"Secondary":t?"Tertiary":"Burn");
    }
  });
  return new XMLSerializer().serializeToString(doc.documentElement);
}
async function hydrateAnatomyTargets(scope=document){
  const nodes=[...scope.querySelectorAll(".anatomy-target")];
  if(!nodes.length)return;
  const [frontSrc,backSrc]=await Promise.all([loadAnatomySvg("front"),loadAnatomySvg("back")]);
  for(const node of nodes){
    const parsed=JSON.parse(decodeURIComponent(node.dataset.map||"%7B%7D"));
    const front=tintAnatomySvg(frontSrc,parsed);
    const back=tintAnatomySvg(backSrc,parsed);
    node.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:6px"><div class="row" style="gap:6px"><button class="btn btn-sm btn-ghost anat-view active" data-view="both">Both</button><button class="btn btn-sm btn-ghost anat-view" data-view="front">Front</button><button class="btn btn-sm btn-ghost anat-view" data-view="back">Back</button></div><div style="font-size:11px;color:var(--text2)" class="anat-readout">Tap a highlighted muscle to inspect</div></div><div class="anatomy-grid"><div class="anatomy-panel anat-front">${front}<div class="anatomy-lbl">FRONT</div></div><div class="anatomy-panel anat-back">${back}<div class="anatomy-lbl">BACK</div></div></div>`;
    const setView=v=>{
      const f=node.querySelector(".anat-front"),b=node.querySelector(".anat-back");
      if(v==="front"){f.style.display="block";b.style.display="none";}
      else if(v==="back"){f.style.display="none";b.style.display="block";}
      else {f.style.display="block";b.style.display="block";}
      node.querySelectorAll(".anat-view").forEach(btn=>btn.classList.toggle("active",btn.dataset.view===v));
    };
    node.querySelectorAll(".anat-view").forEach(btn=>btn.onclick=()=>setView(btn.dataset.view));
    const read=node.querySelector(".anat-readout");
    node.querySelectorAll("[data-muscle-name]").forEach(el=>{
      const update=()=>{read.textContent=`${el.getAttribute("data-muscle-name")} — ${el.getAttribute("data-intensity")}`};
      el.addEventListener("mouseenter",update);
      el.addEventListener("click",update);
      el.addEventListener("touchstart",update,{passive:true});
    });
  }
}
function mergeZones(plan){
  const out={primary:[],secondary:[],tertiary:[],burn:[]};
  (plan.exs||[]).forEach(ex=>{
    const m=exMuscles(ex.eid);
    out.primary.push(...m.primary);
    out.secondary.push(...m.secondary);
    out.tertiary.push(...m.tertiary);
    out.burn.push(...m.burn);
  });
  return out;
}
function getSafetyMode(){
  if(S.profile.sex!=="female")return "none";
  const life=((S.profile.prefs||{}).lifeStage||"general");
  const wm=((S.profile.prefs||{}).womenMode||"auto");
  const fa=S.goals.focusAreas||[];
  if(life==="pregnancy"||wm==="pregnancy"||fa.includes("Pregnancy Safe"))return "pregnancy";
  if(life==="postpartum"||wm==="postpartum"||fa.includes("Postpartum Recovery"))return "postpartum";
  return "none";
}
function postpartumMicroRoutine(dayIdx){
  const map={
    1:["90/90 breathing x 2 min","Wall posture slides 2x12","Dead bug breathing 2x8/side"],
    2:["Pelvic tilt breathing x 2 min","Bird dog 2x8/side","Band pull-aparts 2x15"],
    3:["Glute bridge hold 3x20s","Side plank (knees) 2x20s/side","Thoracic open-book 8/side"],
    4:["Cat-cow x 60s","Tall-kneel anti-rotation press 2x10/side","Scap push-up 2x10"],
    5:["Hip flexor stretch 2x40s/side","Face pulls 2x15","Diaphragm breathing x 2 min"],
    6:["Easy walk 15-20 min","Gentle mobility flow 8-10 min","Pelvic floor relaxation breathing 2 min"]
  };
  return map[dayIdx]||["Gentle walk + breathing reset"];
}
function bodyMapSVG(grow=[],burn=[]){
  const has=z=>grow.includes(z)||burn.includes(z);
  const color=z=>grow.includes(z)&&burn.includes(z)?"#ffd740":grow.includes(z)?"#00e676":burn.includes(z)?"#ff6b35":"#2a2a38";
  const p=(d,z)=>`<path d="${d}" fill="${color(z)}" opacity="${has(z)?0.95:0.2}" stroke="#202233" stroke-width="0.8"/>`;
  return `<svg viewBox="0 0 520 260" width="100%" height="210" role="img" aria-label="Anatomy heatmap">
    <rect x="0" y="0" width="520" height="260" rx="12" fill="#111320"/>
    <g transform="translate(70,18)">
      <path d="M70 20c0-12 10-20 22-20s22 8 22 20-10 22-22 22-22-10-22-22Zm-8 28c8-4 16-6 30-6s22 2 30 6l10 22 8 56-9 58-16 34H69L53 184l-9-58 8-56 10-22Z" fill="#25283a"/>
      ${p("M76 52c7-6 13-8 16-8s9 2 16 8l-3 22H79l-3-22Z","chest")}
      ${p("M80 76h24l5 26H75l5-26Z","core")}
      ${p("M74 103h36l-5 26H79l-5-26Z","core")}
      ${p("M58 56c5-5 9-7 14-7l4 21H57l1-14Z","frontShoulders")}
      ${p("M114 49c5 0 9 2 14 7l1 14h-19l4-21Z","frontShoulders")}
      ${p("M50 73h18l-3 28H49l1-28Z","biceps")}
      ${p("M116 73h18l1 28h-16l-3-28Z","biceps")}
      ${p("M49 101h16l-4 26H47l2-26Z","triceps")}
      ${p("M119 101h16l2 26h-14l-4-26Z","triceps")}
      ${p("M47 127h14l-6 22H45l2-22Z","forearms")}
      ${p("M123 127h14l2 22h-10l-6-22Z","forearms")}
      ${p("M78 130h32l6 20H72l6-20Z","hips")}
      ${p("M74 150h18l4 36H71l3-36Z","quads")}
      ${p("M96 150h18l3 36H92l4-36Z","quads")}
      ${p("M72 186h17l-2 30H69l3-30Z","calves")}
      ${p("M99 186h17l3 30h-18l-2-30Z","calves")}
      ${p("M45 50h94l0 168H45z","fullBody")}
      ${p("M45 50h94l0 96H45z","upperBody")}
      ${p("M69 130h50v88H69z","lowerBody")}
    </g>
    <g transform="translate(300,18)">
      <path d="M70 20c0-12 10-20 22-20s22 8 22 20-10 22-22 22-22-10-22-22Zm-8 28c8-4 16-6 30-6s22 2 30 6l10 22 8 56-9 58-16 34H69L53 184l-9-58 8-56 10-22Z" fill="#25283a"/>
      ${p("M78 50h30l8 18H70l8-18Z","rearShoulders")}
      ${p("M76 68h34l6 32H70l6-32Z","back")}
      ${p("M73 100h40l-3 28H76l-3-28Z","back")}
      ${p("M50 73h18l-3 28H49l1-28Z","triceps")}
      ${p("M116 73h18l1 28h-16l-3-28Z","triceps")}
      ${p("M47 127h14l-6 22H45l2-22Z","forearms")}
      ${p("M123 127h14l2 22h-10l-6-22Z","forearms")}
      ${p("M75 129h36l5 24H70l5-24Z","glutes")}
      ${p("M74 153h18l4 33H71l3-33Z","hamstrings")}
      ${p("M96 153h18l3 33H92l4-33Z","hamstrings")}
      ${p("M72 186h17l-2 30H69l3-30Z","calves")}
      ${p("M99 186h17l3 30h-18l-2-30Z","calves")}
      ${p("M45 50h94l0 168H45z","fullBody")}
      ${p("M45 50h94l0 96H45z","upperBody")}
      ${p("M69 130h50v88H69z","lowerBody")}
    </g>
    <text x="160" y="248" fill="#7f8193" font-size="11" text-anchor="middle">FRONT</text>
    <text x="390" y="248" fill="#7f8193" font-size="11" text-anchor="middle">BACK</text>
  </svg>`;
}

// ═══════════════════════════════════════════════════════════
//  64 PRESET PLANS  (goal×4  freq×2  dur×2  sex×2  exp×2)
// ═══════════════════════════════════════════════════════════
// Slot codes: HP=Heavy Push, HPL=Heavy Pull, HL=Heavy Lower, GL=Glute/Hip,
// SR=Speed Run, TR=Tempo Run, FB=Full Body, FBC=Full Body Circuit,
// HYP=Hyp Push, HYL=Hyp Pull, HYG=Hyp Legs, CT=Conditioning,
// PW=Power, HB=Hybrid

// Engine loaded from ./js/engine.js

// Adaptation loaded from ./js/engine.js

// State/Auth loaded from ./js/state.js

// ═══════════════════════════════════════════════════════════
//  ONBOARDING WIZARD
// ═══════════════════════════════════════════════════════════
function showOnboarding(){applyVisualTheme(true);document.getElementById("obScreen").classList.add("show");obStep=0;renderOB()}
function hideOnboarding(){document.getElementById("obScreen").classList.remove("show");document.getElementById("mainNav").style.display="";document.getElementById("app").style.display="";applyVisualTheme(false);startSync();render()}

function renderOB(){
  const steps=5;const card=document.getElementById("obCard");
  const dots=Array.from({length:steps},(_,i)=>`<div class="ob-dot ${i<obStep?"done":""} ${i===obStep?"active":""}"></div>`).join("");

  if(obStep===0){
    card.innerHTML=`<div class="ob-progress">${dots}</div>
      <div class="ob-title">About You</div><div class="ob-sub">Basic info to personalize your program.</div>
      <div class="grid2">
        <div><label>Name</label><input id="ob-name" value="${S.profile.name}" placeholder="David"></div>
        <div><label>Profile Type</label><select id="ob-sex"><option value="male" ${S.profile.sex==="male"?"selected":""}>Man</option><option value="female" ${S.profile.sex==="female"?"selected":""}>Woman</option></select></div>
      </div>
      <div class="grid3" style="margin-top:10px">
        <div><label>Age</label><input id="ob-age" type="number" value="${S.profile.age||24}"></div>
        <div><label>Height (inches)</label><input id="ob-ht" type="number" value="${S.profile.height||70}"></div>
        <div><label>Current Weight (lb)</label><input id="ob-wt" type="number" value="${S.profile.weight||""}"></div>
      </div>
      <div class="grid3" style="margin-top:10px">
        <div><label>Waist (in)</label><input id="ob-waist" type="number" step="0.1" value="${S.profile.waist||""}" placeholder="e.g. 34"></div>
        <div><label>Hips (in)</label><input id="ob-hips" type="number" step="0.1" value="${S.profile.hips||""}" placeholder="e.g. 40"></div>
        <div><label>Shoulders (in)</label><input id="ob-shoulders" type="number" step="0.1" value="${S.profile.shoulders||""}" placeholder="e.g. 46"></div>
      </div>
      <div class="grid2" style="margin-top:10px">
        <div><label>Goal Weight (lb)</label><input id="ob-gw" type="number" value="${S.profile.goalWt||""}"></div>
        <div><label>Body Fat % (optional)</label><input id="ob-bf" type="number" step="0.1" value="${S.profile.bodyFat||""}" placeholder="e.g. 22"></div>
      </div>
      <div class="grid2" style="margin-top:10px"><div><label>Program Start Date</label><input id="ob-start" type="date" value="${S.program.start}"></div><div></div></div>
      <button class="btn btn-fire btn-block" style="margin-top:16px" id="ob-next">Continue</button>`;
    document.getElementById("ob-next").onclick=()=>{
      S.profile.name=document.getElementById("ob-name").value||"Athlete";
      S.profile.sex=document.getElementById("ob-sex").value;
      S.profile.age=Number(document.getElementById("ob-age").value)||24;
      S.profile.height=Number(document.getElementById("ob-ht").value)||70;
      S.profile.weight=Number(document.getElementById("ob-wt").value)||180;
      S.profile.waist=Number(document.getElementById("ob-waist").value)||0;
      S.profile.hips=Number(document.getElementById("ob-hips").value)||0;
      S.profile.shoulders=Number(document.getElementById("ob-shoulders").value)||0;
      S.profile.bodyFat=Number(document.getElementById("ob-bf").value)||0;
      S.profile.startWt=S.profile.weight;
      S.profile.goalWt=Number(document.getElementById("ob-gw").value)||S.profile.weight-20;
      S.program.start=document.getElementById("ob-start").value||iso();
      S.goals.fatLoss=Math.max(0,S.profile.startWt-S.profile.goalWt);
      obStep=1;renderOB();
    };
  } else if(obStep===1){
    const areas=["Bench Press","Squat","Deadlift","5K Running","Lose Weight","Build Muscle","Improve Conditioning","General Fitness","Hourglass Shape","Glute Shelf","Posture & Back Tone","Pilates Plus Tone","Home-Friendly Workouts","Pregnancy Safe","Postpartum Recovery"];
    const sel=S.goals.focusAreas||[];
    card.innerHTML=`<div class="ob-progress">${dots}</div>
      <div class="ob-title">Your Goals</div><div class="ob-sub">Select everything you want to work on. We'll build your program around these.</div>
      ${areas.map((a,i)=>`<div class="goal-option ${sel.includes(a)?"selected":""}" data-g="${a}">
        <input type="checkbox" ${sel.includes(a)?"checked":""}><div><div style="font-weight:600;font-size:13px">${a}</div></div>
      </div>`).join("")}
      <div class="row" style="margin-top:16px"><button class="btn btn-ghost" id="ob-back">Back</button><button class="btn btn-fire" id="ob-next" style="flex:1">Continue</button></div>`;
    document.querySelectorAll(".goal-option").forEach(el=>{el.onclick=()=>{el.classList.toggle("selected");el.querySelector("input").checked=el.classList.contains("selected")}});
    document.getElementById("ob-back").onclick=()=>{obStep=0;renderOB()};
    document.getElementById("ob-next").onclick=()=>{S.goals.focusAreas=[...document.querySelectorAll(".goal-option.selected")].map(e=>e.dataset.g);obStep=2;renderOB()};
  } else if(obStep===2){
    const fa=S.goals.focusAreas||[];
    card.innerHTML=`<div class="ob-progress">${dots}</div>
      <div class="ob-title">Current Fitness</div><div class="ob-sub">Enter your current maxes / times. Leave blank if unknown — we'll estimate.</div>
      ${fa.includes("Bench Press")?`<div style="margin-bottom:10px"><label>Bench Press 1RM (lb)</label><input id="ob-b" type="number" value="${S.profile.bench1RM||""}" placeholder="e.g. 215"></div>
        <div style="margin-bottom:10px"><label>Bench Goal (lb)</label><input id="ob-bg" type="number" value="${S.goals.bench||""}" placeholder="e.g. 225"></div>`:""}
      ${fa.includes("Squat")?`<div style="margin-bottom:10px"><label>Squat 1RM (lb)</label><input id="ob-sq" type="number" value="${S.profile.squat1RM||""}" placeholder="e.g. 265"></div>
        <div style="margin-bottom:10px"><label>Squat Goal (lb)</label><input id="ob-sqg" type="number" value="${S.goals.squat||""}" placeholder="e.g. 315"></div>`:""}
      ${fa.includes("Deadlift")?`<div style="margin-bottom:10px"><label>Deadlift 1RM (lb)</label><input id="ob-dl" type="number" value="${S.profile.dead1RM||""}" placeholder="e.g. 386"></div>
        <div style="margin-bottom:10px"><label>Deadlift Goal (lb)</label><input id="ob-dlg" type="number" value="${S.goals.deadlift||""}" placeholder="e.g. 405"></div>`:""}
      ${fa.includes("5K Running")?`<div style="margin-bottom:10px"><label>Current 4-Mile Time (mm:ss)</label><input id="ob-run" value="${S.profile.run4mi?mmss(S.profile.run4mi):""}" placeholder="e.g. 35:57"></div>
        <div style="margin-bottom:10px"><label>5K Goal Time (mm:ss)</label><input id="ob-5kg" value="${S.goals.fiveK?mmss(S.goals.fiveK):""}" placeholder="e.g. 20:00"></div>`:""}
      ${!fa.includes("Bench Press")&&!fa.includes("Squat")&&!fa.includes("Deadlift")&&!fa.includes("5K Running")?`<p style="color:var(--text3);font-size:13px">No specific targets needed for your selected goals. We'll build a balanced program.</p>`:""}
      <div class="row" style="margin-top:16px"><button class="btn btn-ghost" id="ob-back">Back</button><button class="btn btn-fire" id="ob-next" style="flex:1">Continue</button></div>`;
    document.getElementById("ob-back").onclick=()=>{obStep=1;renderOB()};
    document.getElementById("ob-next").onclick=()=>{
      const fa=S.goals.focusAreas;const g=v=>Number((document.getElementById(v)||{}).value)||0;const gm=v=>parseMM((document.getElementById(v)||{}).value);
      if(fa.includes("Bench Press")){S.profile.bench1RM=g("ob-b")||135;S.goals.bench=g("ob-bg")||S.profile.bench1RM+20}
      if(fa.includes("Squat")){S.profile.squat1RM=g("ob-sq")||185;S.goals.squat=g("ob-sqg")||S.profile.squat1RM+30}
      if(fa.includes("Deadlift")){S.profile.dead1RM=g("ob-dl")||225;S.goals.deadlift=g("ob-dlg")||S.profile.dead1RM+30}
      if(fa.includes("5K Running")){S.profile.run4mi=gm("ob-run")||2400;S.goals.fiveK=gm("ob-5kg")||1200}
      if(!S.profile.bench1RM)S.profile.bench1RM=Math.round(S.profile.weight*.65);
      if(!S.profile.squat1RM)S.profile.squat1RM=Math.round(S.profile.weight*.85);
      if(!S.profile.dead1RM)S.profile.dead1RM=Math.round(S.profile.weight*1.2);
      if(!S.profile.run4mi)S.profile.run4mi=2400;
      obStep=3;renderOB();
    };
  } else if(obStep===3){
    const selDays=S.schedule.days||[1,2,3,4,5];
    card.innerHTML=`<div class="ob-progress">${dots}</div>
      <div class="ob-title">Your Schedule</div><div class="ob-sub">Which days can you train? How much time per session?</div>
      <label>Training Days (tap to toggle)</label>
      <div class="row" style="gap:8px;margin-bottom:14px">${[1,2,3,4,5,6].map(d=>`<div class="day-toggle ${selDays.includes(d)?"on":""}" data-d="${d}">${DAYS[d].slice(0,3)}</div>`).join("")}</div>
      <div><label>Minutes per Session</label><select id="ob-mins"><option value="30" ${S.schedule.sessionMin===30?"selected":""}>30 min (quick)</option><option value="45" ${S.schedule.sessionMin===45?"selected":""}>45 min</option><option value="60" ${S.schedule.sessionMin===60?"selected":""}>60 min</option><option value="75" ${S.schedule.sessionMin===75?"selected":""}>75 min</option><option value="90" ${S.schedule.sessionMin===90?"selected":""}>90 min</option></select></div>
      <div class="grid3" style="margin-top:10px">
        <div><label>Equipment Access</label><select id="ob-eq"><option value="gym" ${(S.profile.prefs||{}).equipment==="gym"?"selected":""}>Gym / Full Access</option><option value="home" ${(S.profile.prefs||{}).equipment==="home"?"selected":""}>Home / DB-Minimal</option></select></div>
        <div><label>Session Style</label><select id="ob-style"><option value="balanced" ${(S.profile.prefs||{}).style!=="burner"?"selected":""}>Balanced Strength + Cardio</option><option value="burner" ${(S.profile.prefs||{}).style==="burner"?"selected":""}>10-20 min Burners</option></select></div>
        <div><label>Life Stage</label><select id="ob-life"><option value="general" ${(S.profile.prefs||{}).lifeStage==="general"||!(S.profile.prefs||{}).lifeStage?"selected":""}>General</option><option value="pregnancy" ${(S.profile.prefs||{}).lifeStage==="pregnancy"?"selected":""}>Pregnancy Safe</option><option value="postpartum" ${(S.profile.prefs||{}).lifeStage==="postpartum"?"selected":""}>Postpartum (gentle core)</option></select></div>
      </div>
      ${S.profile.sex==="female"?`<div style="margin-top:10px"><label>Women's Program Emphasis</label><select id="ob-wm"><option value="auto" ${((S.profile.prefs||{}).womenMode||"auto")==="auto"?"selected":""}>Auto (from goals)</option><option value="hourglass" ${(S.profile.prefs||{}).womenMode==="hourglass"?"selected":""}>Hourglass Sculpt</option><option value="glute_shelf" ${(S.profile.prefs||{}).womenMode==="glute_shelf"?"selected":""}>Glute Shelf Builder</option><option value="posture" ${(S.profile.prefs||{}).womenMode==="posture"?"selected":""}>Posture + Back Tone</option><option value="pilates" ${(S.profile.prefs||{}).womenMode==="pilates"?"selected":""}>Pilates Plus Tone</option><option value="home" ${(S.profile.prefs||{}).womenMode==="home"?"selected":""}>Home-Friendly Minimal Equipment</option></select></div>`:""}
      <div class="row" style="margin-top:16px"><button class="btn btn-ghost" id="ob-back">Back</button><button class="btn btn-fire" id="ob-next" style="flex:1">Continue</button></div>`;
    document.querySelectorAll(".day-toggle").forEach(t=>t.onclick=()=>t.classList.toggle("on"));
    document.getElementById("ob-back").onclick=()=>{obStep=2;renderOB()};
    document.getElementById("ob-next").onclick=()=>{S.schedule.days=[...document.querySelectorAll(".day-toggle.on")].map(e=>+e.dataset.d);S.schedule.sessionMin=Number(document.getElementById("ob-mins").value)||45;S.profile.prefs={...(S.profile.prefs||{}),equipment:document.getElementById("ob-eq").value,style:document.getElementById("ob-style").value,lifeStage:document.getElementById("ob-life").value,womenMode:(document.getElementById("ob-wm")||{value:(S.profile.prefs||{}).womenMode||"auto"}).value};obStep=4;renderOB()};
  } else if(obStep===4){
    const pid=selectPlan();const plan=PLANS[pid];const tDays=[...new Set(S.schedule.days||[1,2,3,4,5])].sort((a,b)=>a-b);
    const dayPreview=plan.slots.map((sl,i)=>{const d=tDays[i];return d!=null?`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)"><span style="font-weight:600;font-size:12px">${DAYS[d]} (slot ${i+1})</span><span style="font-size:12px;color:var(--text2)">${mkDay(sl,1).focus.replace(" (DELOAD)","")}</span></div>`:""}).join("");
    card.innerHTML=`<div class="ob-progress">${dots}</div>
      <div class="ob-title">Your Program</div><div class="ob-sub">Based on your profile, we matched you to one of 64 preset programs.</div>
      <div class="card" style="border-color:var(--border-lit);margin-bottom:14px"><div style="font-size:16px;font-weight:600;margin-bottom:4px;color:var(--text);letter-spacing:-0.02em">${plan.name}</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">Template ${pid+1} of 64 · ${plan.slots.length} training days per week · 13-week progression</div>
        ${dayPreview}
        <div style="margin-top:8px;font-size:10px;color:var(--text3)">Hypertrophy (wk 1-4) → Strength (5-8) → Peak (9-12) → Test (13) · Deload at wk 4 & 8</div>
      </div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:12px">Weights auto-calculate from your maxes. The program adapts every time you log a workout. You can change plans later in Settings.</p>
      <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="ob-back">Back</button><button class="btn btn-mint" id="ob-generate" style="flex:1">Begin this program</button></div>`;
    document.getElementById("ob-back").onclick=()=>{obStep=3;renderOB()};
    document.getElementById("ob-generate").onclick=async()=>{
      S.planId=pid;
      S.profile.onboarded=true;
      await persist();
      hideOnboarding();
      toast(`You're set. The 13-week block “${plan.name}” is active.`);
    };
  }
}

// ═══════════════════════════════════════════════════════════
//  RENDER — NAV
// ═══════════════════════════════════════════════════════════
function renderNavBanners(){
  const host=document.getElementById("navBanners");if(!host||!currentUser){if(host)host.innerHTML="";return}
  const parts=[];
  if(typeof navigator!=="undefined"&&!navigator.onLine)parts.push(`<div class="nav-banner nav-offline" role="status">You're offline — Firestore keeps changes on this device and syncs when you're back.</div>`);
  if(currentUser.emailVerified===false)parts.push(`<div class="nav-banner nav-verify" role="status">Verify your email for account recovery. <button type="button" class="btn btn-sm btn-ghost" id="nav-resend-verify">Resend</button> <button type="button" class="btn btn-sm btn-ghost" id="nav-refresh-verify">I've verified</button></div>`);
  host.innerHTML=parts.join("");
  const rs=document.getElementById("nav-resend-verify");
  if(rs)rs.onclick=async()=>{try{await currentUser.sendEmailVerification();toast("Verification email sent.")}catch(e){toast(e.message||"Could not resend.")}};
  const rv=document.getElementById("nav-refresh-verify");
  if(rv)rv.onclick=async()=>{try{await currentUser.reload();if(currentUser.emailVerified)toast("Email verified.");render()}catch(e){toast(e.message||"Could not refresh.")}};
}
function renderNav(){
  renderNavBanners();
  const el=document.getElementById("navInner");const w=S.program.week;
  const tabs=[[TAB_TRAIN,"Train","Today & log","T"],[TAB_PLAN,"Plan","13-week calendar","P"],[TAB_YOU,"You","Progress & settings","Y"]];
  el.innerHTML=`<div class="logo">Hybrid<span class="logo-tag">Training</span></div><button type="button" class="nav-search-btn" id="nav-global-search" aria-label="Open search" title="Search"><svg class="nav-search-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>`+tabs.map(([id,lb,hint,ic])=>`<button class="nav-btn ${tab===id?"active":""}" data-t="${id}" type="button" aria-label="${lb}: ${hint}" ${tab===id?'aria-current="page"':""}><span class="nav-ic" aria-hidden="true">${ic}</span><span class="nav-lb">${lb}</span></button>`).join("")+
    `<div class="nav-pill" id="navPill">Week ${w}/13 · ${phaseName(w)}</div>`+
    (currentUser?`<button class="nav-btn" id="nav-so" style="color:var(--text3);flex-shrink:0;font-size:11px" type="button" title="${(currentUser.email||"").replace(/"/g,"&quot;")}">Sign out</button>`:offlineMode?`<span style="font-size:10px;color:var(--text3)">Offline</span>`:``);
  el.querySelectorAll(".nav-btn[data-t]").forEach(b=>b.onclick=()=>{location.hash=b.dataset.t;});
  const so=document.getElementById("nav-so");if(so)so.onclick=()=>{if(confirm("Sign out?"))doSignOut()};
  const gs=document.getElementById("nav-global-search");if(gs)gs.onclick=()=>openGlobalSearch();
}

// ═══════════════════════════════════════════════════════════
//  RENDER — DASHBOARD
// ═══════════════════════════════════════════════════════════
function calcStrengthScore(){
  const p=S.profile||{};
  const lift=(Number(p.bench1RM)||0)+(Number(p.squat1RM)||0)+(Number(p.dead1RM)||0);
  const run=Math.max(0,2400-(Number(p.run4mi)||0));
  const consistency=Math.min(400,getStreak()*20+(S.logs||[]).slice(-30).length*2);
  return Math.round(Math.max(0,lift+run+consistency));
}
function warriorBadges(){
  const b=[];const st=getStreak();
  if(st>=3)b.push("Streak 3+");
  if(st>=7)b.push("Streak 7+");
  if((S.logs||[]).length>=50)b.push("50 Logs");
  if((S.logs||[]).length>=150)b.push("150 Logs");
  if((Number(S.profile.bench1RM)||0)>=185)b.push("Bench 185");
  if((Number(S.profile.squat1RM)||0)>=225)b.push("Squat 225");
  if((Number(S.profile.dead1RM)||0)>=275)b.push("Deadlift 275");
  return b.slice(0,6);
}
function womenProgramSummary(){
  if(womenBlueprintMode()==="none")return null;
  const mode=womenBlueprintMode();
  const tier=womenBaselineTier();
  const life=(S.profile.prefs||{}).lifeStage||"general";
  const eq=(S.profile.prefs||{}).equipment||"gym";
  const style=(S.profile.prefs||{}).style||"balanced";
  const fa=S.goals.focusAreas||[];
  const label={
    hourglass:"Hourglass Sculpt",
    glute_shelf:"Glute Shelf Program",
    posture:"Back + Posture Tone",
    pilates:"Pilates Plus Tone",
    home:"Home Sculpt",
    pregnancy:"Pregnancy Safe",
    postpartum:"Postpartum Recovery",
    balanced:"Balanced Sculpt"
  }[mode]||"Balanced Sculpt";
  const tracks=[
    "Glute shelf/side-booty block (thrusts, hydrants, clamshells, kicks)",
    "Hourglass back/arms block (rows, cross press, posture work)",
    "Lower-belly deep-core block (toe taps, suitcase, leg raise, plank)",
    "10-20 min saveable finisher circuits"
  ];
  if(life==="pregnancy"||life==="postpartum"){tracks[0]="Life-stage-safe core + pelvic floor restoration";tracks[3]="Low-impact recovery circuit (DR/pelvic safe)";}
  return{label,tier,life,eq,style,fa,tracks};
}
function slotMeta(slot){
  const meta={
    HP:{muscles:"Chest, triceps, upper-back",why:"Pressing strength and upper-body muscle.",expect:"Bench/press performance improves."},
    HPL:{muscles:"Lats, mid-back, rear delts",why:"Pulling strength and posture support.",expect:"Back strength and control improve."},
    HL:{muscles:"Quads, glutes, hamstrings",why:"Heavy lower loading drives strength.",expect:"Lower-body force increases."},
    GL:{muscles:"Glutes, hamstrings, core",why:"Shape and hip stability focus.",expect:"Glute development and stability improve."},
    SR:{muscles:"Cardio system + core",why:"Speed intervals for race pace.",expect:"Faster splits and aerobic power."},
    TR:{muscles:"Cardio system + posterior chain",why:"Threshold endurance training.",expect:"Better sustained pace."},
    FB:{muscles:"Full-body",why:"Efficient broad stimulus.",expect:"Steady all-around progress."},
    CT:{muscles:"Full-body conditioning",why:"Higher density and calorie burn.",expect:"Work capacity improves."}
  };
  return meta[slot]||null;
}
function trainingDayHint(){
  for(let k=0;k<14;k++){
    const ds=addCalendarDaysIso(iso(),k);
    const pl=rollingPlanForDate(ds);
    const dow=parseIsoNoon(ds).getDay();
    const when=k===0?"Today":k===1?"Tomorrow":DAYS[dow];
    if(!pl.exs.length)continue;
    const focus=(pl.focus||"Training").split("·")[0].trim().slice(0,48);
    return`${when}: ${focus} · ${pl.exs.length} exercise${pl.exs.length!==1?"s":""}`;
  }
  return"Add training days under Settings → Training & profile.";
}
function renderDash(){
  autoWeek();
  const d=new Date(),w=S.program.week,plan=rollingPlanForDate(iso());
  const dateLine=d.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
  const p=S.profile,g=S.goals;const fk=est5k(p.run4mi)/Math.max(S.adapt.run,.5);const fatLost=p.startWt-p.weight;
  const bP=g.bench?clamp(p.bench1RM/g.bench,0,1):0;const fP=g.fatLoss?clamp(fatLost/g.fatLoss,0,1):0;
  const streak=getStreak();const bT=trendArrow("bench"),sT=trendArrow("squat"),dT=trendArrow("dead"),rT=trendArrow("run");
  const wt=weightTrend();
  const recentRaw=S.logs.slice(-24);
  const recentByDate={};for(const l of recentRaw){if(!recentByDate[l.date])recentByDate[l.date]=[];recentByDate[l.date].push(l)}
  const recentDates=Object.keys(recentByDate).sort().reverse().slice(0,6);
  const fiveKUi=g.fiveK?fiveKGoalProgressDisplay(g.fiveK,fk):null;
  const hm=weeklyExpectedChanges();
  const whr=(p.waist>0&&p.hips>0)?(p.waist/p.hips):0;
  const swr=(p.waist>0&&p.shoulders>0)?(p.shoulders/p.waist):0;
  const wl=S.weightLog.slice(-14);const maxW=Math.max(...wl.map(x=>x.wt),p.startWt||0,1);const minW=Math.min(...wl.map(x=>x.wt),p.goalWt||0);
  const wtBars=wl.map(x=>{const pct=maxW>minW?((x.wt-minW)/(maxW-minW)):0.5;return`<div class="wt-col" style="height:${Math.max(4,pct*100)}%;background:${x.wt<=p.goalWt?"var(--mint)":"var(--ice)"}" title="${x.date}: ${x.wt}lb"></div>`}).join("");
  const bc=sessionBreadcrumb(w,plan);
  const bpos=blockPositionLine(plan);
  const firstEx=plan.exs[0];const e0=firstEx?exById(firstEx.eid):null;
  const heroTitle=plan.exs.length?`${DAYS[d.getDay()]} session`:`${DAYS[d.getDay()]} — easy day`;
  const heroMeta=`~${S.schedule.sessionMin||45} min · ${plan.exs.length?plan.exs.length+" exercises":"recovery"}`;
  const heroTarget=firstEx&&e0?formatPrescribedRx(firstEx):"Walk or light mobility — optional";
  const heroExName=e0?e0.name:"No main lift today";
  const mg=logsOnScheduleDaysThisWeek();
  const ringLen=113;const pctRing=mg.target?Math.min(1,mg.logged/mg.target):0;const off=ringLen*(1-pctRing);
  const openDet=sessionStorage.getItem("hw-dash-details")==="1";
  const weekLogEmpty=mg.target>0&&mg.logged===0;
  const nextLine=trainingDayHint();
  const progPct=Math.round(w/13*100);
  const intentLine=weekIntentLine(w);
  const ms=firstMissedScheduledSession();
  const mile=milestoneCheckpointCopy(w);
  const trustUntil=Number(sessionStorage.getItem("hw-trust-until"))||0;
  const showTrust=!((S.profile.prefs||{}).trustDataHide)&&Date.now()>trustUntil;
  const dashPin=useWomenSoftUi();
  const escDash=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
  const extras=(S.extraActivities||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,14);
  const extraRows=extras.map(a=>{const parts=[a.date];if(a.minutes)parts.push(`${a.minutes} min`);if(a.distanceMi)parts.push(`${a.distanceMi} mi`);if(a.note)parts.push(escDash(a.note));return`<div style="font-size:12px;color:var(--text2);padding:8px 0;border-bottom:1px solid var(--border)"><b style="color:var(--text)">${escDash(a.kind||"Activity")}</b> · ${parts.join(" · ")}</div>`;}).join("");

  return`
  ${lastLogSummary?`<div class="session-banner" id="dash-sum"><b style="color:var(--text)">Logged.</b> ${lastLogSummary.name} · Current streak: <b>${lastLogSummary.streak}</b> day${lastLogSummary.streak!==1?"s":""}.${lastLogSummary.vol?` Volume (est.): <b>${lastLogSummary.vol}</b>.`:""} ${lastLogSummary.next} <button type="button" class="details-toggle" id="sum-dismiss" style="margin-left:6px">Dismiss</button></div>`:""}
  ${showTrust?`<div class="trust-banner" id="trust-ban"><span>Signed-in data syncs to your Firebase project. Export a JSON backup anytime in Settings — your data belongs to you.</span><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end"><button type="button" class="btn btn-sm btn-secondary-solid" id="trust-later">Remind in a week</button><button type="button" class="btn btn-sm btn-ghost" id="trust-hide">Don't show again</button></div></div>`:""}
  ${mile?`<div class="card section milestone-card"><div style="font-size:14px;font-weight:600">${mile.title}</div><p style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.5">${mile.body}</p></div>`:""}
  ${ms?`<div class="card section missed-card"><div style="font-size:14px;font-weight:600">Still room for ${ms.dayName}</div><p style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.45">No log for <b style="color:var(--text)">${ms.date}</b> — that happens. When you're ready, backfill it or carry the session forward without guilt.</p><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px"><button type="button" class="btn btn-cta btn-sm" id="dash-miss-log" data-d="${ms.date}">Log ${ms.dayName}</button><button type="button" class="btn btn-secondary-solid btn-sm" id="dash-miss-plan">Open calendar</button></div></div>`:""}
  ${dashPin?`<div class="pin-feed">`:""}
  <div class="dash-hero-banner hero-card">
    <div class="dash-hero-banner-main">
      <div class="dash-hero-kicker">${dateLine} · Week ${w} of 13</div>
      <div class="hero-title dash-hero-title-compact">${heroTitle}</div>
      <div class="breadcrumb dash-hero-bc">${bc}</div>
      ${bpos?`<div class="dash-hero-bpos">${bpos}</div>`:""}
      <div class="hero-meta">${heroMeta} · <span class="ex-name-lg" style="display:inline">${heroExName}</span> · ${heroTarget}</div>
    </div>
    <div class="dash-hero-banner-cta">
      <button type="button" class="btn btn-cta btn-block dash-hero-start" id="dash-start-workout">Start</button>
      <button type="button" class="btn btn-secondary-solid btn-sm btn-block" id="dash-whats-today">Details</button>
    </div>
  </div>
  <div class="card dash-context section" style="padding:14px">
    <div style="font-size:13px;font-weight:600;color:var(--text)">${dateLine}</div>
    <div style="font-size:12px;color:var(--ice);margin-top:8px;line-height:1.45">${intentLine}</div>
    <div style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.45">${nextLine}</div>
    <div style="font-size:11px;color:var(--text3);margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span>Program block (training weeks)</span><span>Week ${w} of 13</span></div>
    <div class="prog-bar" aria-hidden="true"><i style="width:${progPct}%"></i></div>
    <div class="quick-actions" role="group" aria-label="Quick actions">
      <button type="button" class="btn btn-secondary-solid btn-sm qa-pill" id="dash-q-log">Quick log</button>
      <button type="button" class="btn btn-ghost btn-sm qa-pill" id="dash-q-plan">13-week plan</button>
      <button type="button" class="btn btn-ghost btn-sm qa-pill" id="dash-q-plates">Plate helper</button>
      <button type="button" class="btn btn-ghost btn-sm qa-pill" id="dash-q-health">Health</button>
      <button type="button" class="btn btn-ghost btn-sm qa-pill" id="dash-q-ease">Ease load</button>
    </div>
  </div>
  <div class="card section" style="padding:14px">
    <div style="font-size:13px;font-weight:600;margin-bottom:10px">Your metrics</div>
    <div class="grid3" style="gap:10px">
      <div><div style="font-size:10px;color:var(--text3)">Weight</div><div style="font-size:17px;font-weight:600">${p.weight>0?formatLoadLbText(p.weight):"—"}</div></div>
      <div><div style="font-size:10px;color:var(--text3)">Goal</div><div style="font-size:17px;font-weight:600">${p.goalWt>0?formatLoadLbText(p.goalWt):"—"}</div></div>
      <div><div style="font-size:10px;color:var(--text3)">Body fat</div><div style="font-size:17px;font-weight:600">${p.bodyFat>0?p.bodyFat.toFixed(1)+"%":"—"}</div></div>
      <div><div style="font-size:10px;color:var(--text3)">Waist</div><div style="font-size:17px;font-weight:600">${p.waist>0?p.waist+" in":"—"}</div></div>
      <div><div style="font-size:10px;color:var(--text3)">Hips</div><div style="font-size:17px;font-weight:600">${p.hips>0?p.hips+" in":"—"}</div></div>
      <div><div style="font-size:10px;color:var(--text3)">Shoulders</div><div style="font-size:17px;font-weight:600">${p.shoulders>0?p.shoulders+" in":"—"}</div></div>
    </div>
    <button type="button" class="btn btn-secondary-solid btn-sm" id="dash-update-metrics" style="margin-top:10px">Update metrics</button>
    <p style="font-size:11px;color:var(--text3);margin-top:10px;line-height:1.45">Update anytime in Settings → Training &amp; profile.</p>
  </div>
  <div class="card section dash-health-connect" style="padding:14px">
    <div style="font-size:12px;font-weight:600;margin-bottom:4px">Activity &amp; health logging</div>
    <p style="font-size:11px;color:var(--text2);line-height:1.45;margin-bottom:10px">Log steps, calories, and exercise minutes in one place: <b style="color:var(--text)">You → Settings → Activity &amp; health</b>. Apple Health / Google Fit cannot be connected from this browser app yet — use paste-from-clipboard or type totals there.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap">
      <button type="button" class="btn btn-sm btn-secondary-solid" id="dash-open-health-settings">Open activity &amp; health</button>
      <button type="button" class="btn btn-sm btn-ghost" disabled title="Not available in this web app">Connect Apple Health</button>
      <button type="button" class="btn btn-sm btn-ghost" disabled title="Not available in this web app">Connect Google Fit</button>
    </div>
  </div>
  <div class="micro-goal card" style="padding:14px;display:flex;align-items:center;gap:14px">
    <div class="micro-ring"><svg width="52" height="52" viewBox="0 0 52 52"><circle class="rbg" cx="26" cy="26" r="18"/><circle class="rfill" cx="26" cy="26" r="18" stroke-dasharray="${ringLen}" stroke-dashoffset="${off}"/></svg><span>${mg.logged}/${mg.target}</span></div>
    <div><div style="font-size:14px;font-weight:600">This training week</div><div style="font-size:12px;color:var(--text2);margin-top:2px">Aim for ${mg.target} session${mg.target!==1?"s":""} in this rolling week (not Mon–Sun). Logging keeps prescriptions realistic.</div></div>
  </div>
  <div class="card section" style="padding:14px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:8px"><span style="font-size:13px;font-weight:600">Hybrid Warrior Score</span>
      <button type="button" class="dash-info-btn" id="dash-warrior-info" aria-label="How Hybrid Warrior Score is calculated" title="How is this calculated?">i</button></div>
      <span class="badge badge-ice">${calcStrengthScore()}</span></div>
    <div style="font-size:11px;color:var(--text3);margin-top:6px">Blend of strength PRs, running pace, and consistency.</div>
    <div class="dash-inline-help" id="dash-warrior-explain" hidden>
      <b>Exact math:</b> <code>(bench1RM + squat1RM + dead1RM) + max(0, 2400 - run4mi_seconds) + min(400, streak*20 + logs_last30*2)</code>.<br>
      Current terms: lifts = <b>${(Number(p.bench1RM)||0)+(Number(p.squat1RM)||0)+(Number(p.dead1RM)||0)}</b>, run bonus = <b>${Math.max(0,2400-(Number(p.run4mi)||0))}</b>, consistency = <b>${Math.min(400,getStreak()*20+(S.logs||[]).slice(-30).length*2)}</b>.
    </div>
    <div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">${warriorBadges().length?warriorBadges().map(x=>`<span class="badge badge-mint">${x}</span>`).join(""):`<span style="font-size:11px;color:var(--text3)">Log sessions to unlock badges.</span>`}</div>
  </div>
  <div class="card section" id="dash-extra-act">
    <div class="card-h"><h2>Walks, hikes &amp; extras</h2></div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.45">Log walks, hikes, or other cardio that is not in your program so it appears on your Overview timeline. Optional — does not replace strength logs.</p>
    <div class="grid2">
      <div><label>Date</label><input type="date" id="ex-act-date" value="${iso()}"></div>
      <div><label>Type</label><select id="ex-act-kind"><option value="walk">Walk</option><option value="hike">Hike</option><option value="ride">Bike ride</option><option value="other">Other</option></select></div>
      <div><label>Minutes</label><input type="number" id="ex-act-min" min="0" placeholder="e.g. 45"></div>
      <div><label>Distance (mi)</label><input type="number" id="ex-act-mi" min="0" step="0.1" placeholder="optional"></div>
    </div>
    <div style="margin-top:8px"><label>Note</label><input id="ex-act-note" placeholder="Trail, effort, device…" style="width:100%"></div>
    <button type="button" class="btn btn-mint btn-block" id="ex-act-save" style="margin-top:10px">Save activity</button>
    ${extras.length?`<div style="margin-top:14px;font-size:11px;font-weight:600;color:var(--text3);margin-bottom:4px">Recent</div><div>${extraRows}</div>`:""}
  </div>
  ${weekLogEmpty?`<div class="card section" style="border-left:3px solid var(--border-lit)"><div style="font-size:14px;font-weight:600;margin-bottom:4px">No entries yet this week</div><p style="font-size:12px;color:var(--text2);margin-bottom:10px">A short log after training adjusts loads for the rest of the block.</p><button type="button" class="btn btn-fire" id="dash-go-log">Log today's session</button></div>`:""}
  ${dashPin?`</div>`:""}

  <div class="section">
    <button type="button" class="details-toggle" id="dash-details-toggle">${openDet?"Hide":"Show"} details — measurements, heatmap, health</button>
    <div class="details-panel ${openDet?"open":""}" id="dash-details-body">
  <div class="grid-auto">
    ${g.bench?`<div class="card"><div class="card-h"><h2>Bench → ${g.bench}lb</h2></div><div style="font-size:11px;color:var(--text3);margin:-6px 0 8px">Estimated 1RM in center · goal % below</div>
      <div class="row">${gaugeHTML(bP,p.bench1RM+"",`${Math.round(bP*100)}% goal`,"#7d9eb4")}<div><div style="font-size:12px;color:var(--text2)">Goal: ${g.bench} lb</div><div style="font-size:11px" class="${bT.c}">${bT.i} ${bT.t}</div></div></div></div>`:""}
    ${g.squat?`<div class="card"><div class="card-h"><h2>Squat → ${g.squat}lb</h2></div><div style="font-size:11px;color:var(--text3);margin:-6px 0 8px">Estimated 1RM in center · goal % below</div>
      <div class="row">${gaugeHTML(clamp(p.squat1RM/g.squat,0,1),p.squat1RM+"",`${Math.round(clamp(p.squat1RM/g.squat,0,1)*100)}% goal`,"#c4735c")}<div><div style="font-size:12px;color:var(--text2)">Goal: ${g.squat} lb</div><div style="font-size:11px" class="${sT.c}">${sT.i} ${sT.t}</div></div></div></div>`:""}
    ${g.deadlift?`<div class="card"><div class="card-h"><h2>Dead → ${g.deadlift}lb</h2></div><div style="font-size:11px;color:var(--text3);margin:-6px 0 8px">Estimated 1RM in center · goal % below</div>
      <div class="row">${gaugeHTML(clamp(p.dead1RM/g.deadlift,0,1),p.dead1RM+"",`${Math.round(clamp(p.dead1RM/g.deadlift,0,1)*100)}% goal`,"#7aab96")}<div><div style="font-size:12px;color:var(--text2)">Goal: ${g.deadlift} lb</div><div style="font-size:11px" class="${dT.c}">${dT.i} ${dT.t}</div></div></div></div>`:""}
    ${g.fiveK&&fiveKUi?`<div class="card"><div class="card-h"><h2>Sub-${mmss(g.fiveK)} 5K</h2></div><div style="font-size:11px;color:var(--text3);margin:-6px 0 8px;line-height:1.45">${fiveKUi.line}</div>
      <div class="row">${gaugeHTML(fiveKUi.pct,fiveKUi.bestLabel==="—"?"—":fiveKUi.bestLabel,fiveKUi.sub,"var(--ice)")}<div><div style="font-size:12px;color:var(--text2)">Ring = progress toward goal pace (from your 4-mile estimate).</div><div style="font-size:11px" class="${rT.c}">${rT.i} ${rT.t}</div></div></div></div>`:""}
  </div>
  <div class="section"><div class="card"><div class="card-h"><h2>Body measurements</h2></div>
    <div class="grid3">
      <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase">Waist/Hip</div><div style="font-size:22px;font-weight:600">${whr?whr.toFixed(2):"--"}</div></div>
      <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase">Shoulder/Waist</div><div style="font-size:22px;font-weight:600">${swr?swr.toFixed(2):"--"}</div></div>
      <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase">Body fat %</div><div style="font-size:22px;font-weight:600">${p.bodyFat?`${p.bodyFat.toFixed(1)}%`:"--"}</div></div>
    </div>
  </div></div>
  <div class="section"><div class="card"><div class="card-h"><h2>Expected emphasis (heatmap)</h2><button type="button" class="dash-info-btn" id="dash-heatmap-info" aria-label="How expected emphasis is calculated" title="How this is calculated?">i</button></div><div class="dash-inline-help" id="dash-heatmap-help" hidden>These percentages are a <b>relative weekly emphasis score</b> from your plan template slot weights (not fatigue and not exact tonnage). 100% is the highest-scoring area for this plan week; other areas are scaled against it.</div>
    <div class="grid2">
      <div><div style="font-size:11px;color:var(--text2);margin-bottom:4px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>Glutes</span><span class="heatmap-pill">${heatmapBandLabel(hm.glutes)} · ${hm.glutes}%</span></div><div style="height:10px;background:var(--border);border-radius:99px;overflow:hidden"><div style="height:100%;width:${hm.glutes}%;background:var(--mint)"></div></div></div>
      <div><div style="font-size:11px;color:var(--text2);margin-bottom:4px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>Core</span><span class="heatmap-pill">${heatmapBandLabel(hm.core)} · ${hm.core}%</span></div><div style="height:10px;background:var(--border);border-radius:99px;overflow:hidden"><div style="height:100%;width:${hm.core}%;background:var(--mint)"></div></div></div>
      <div><div style="font-size:11px;color:var(--text2);margin-bottom:4px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>Back</span><span class="heatmap-pill">${heatmapBandLabel(hm.back)} · ${hm.back}%</span></div><div style="height:10px;background:var(--border);border-radius:99px;overflow:hidden"><div style="height:100%;width:${hm.back}%;background:var(--mint)"></div></div></div>
      <div><div style="font-size:11px;color:var(--text2);margin-bottom:4px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>Posture</span><span class="heatmap-pill">${heatmapBandLabel(hm.posture)} · ${hm.posture}%</span></div><div style="height:10px;background:var(--border);border-radius:99px;overflow:hidden"><div style="height:100%;width:${hm.posture}%;background:var(--mint)"></div></div></div>
    </div>
  </div></div>
  <div class="section"><div class="grid2 dash-streak-weight-row">
    <div class="card"><div class="card-h"><h2>Streak</h2></div>
      <div style="font-size:32px;font-weight:600;color:${streak>=5?"var(--mint)":streak>=2?"var(--gold)":"var(--text3)"}">${streak}</div>
      <div class="streak-bar">${[0,1,2,3,4,5,6].map(i=>{const dd=new Date();dd.setDate(dd.getDate()-6+i);const k=isoFromDate(dd);const done=S.logs.some(l=>l.date===k);return`<div class="streak-dot ${done?"done":""} ${k===iso()?"today":""}">${DAYS[dd.getDay()].slice(0,2)}</div>`}).join("")}</div>
    </div>
    <div class="dash-fat-weight-cluster card">
      ${g.fatLoss?`<div class="dash-fatloss-strip">
        <div class="card-h" style="margin-bottom:8px"><h2>Lose ${g.fatLoss} lb</h2></div>
        <div style="font-size:11px;color:var(--text3);margin:-4px 0 8px">Goal progress ${Math.round(fP*100)}% · ${p.weight}lb → ${p.goalWt}lb</div>
        <div class="row" style="align-items:center;gap:12px;flex-wrap:wrap">${gaugeHTML(fP,fatLost.toFixed(0)+"","lbs lost","var(--mint)")}${wt?`<div style="font-size:11px;color:${wt.perWeek<0?"var(--mint)":"var(--gold)"}">Trend: ${wt.perWeek.toFixed(1)} lb/wk</div>`:""}</div>
      </div>`:""}
      <div class="dash-weight-strip ${g.fatLoss?"dash-weight-strip-connected":""}"><div class="card-h"><h2>Weight &amp; pace</h2></div>
      <div class="grid2">
        <div><label>Today's weight (${massUnitLabel()})</label><input id="d-wt" type="number" step="any" value="${massLbToField(p.weight)}"></div>
        <div><label>4-mile (mm:ss)</label><input id="d-run" value="${p.run4mi?mmss(p.run4mi):""}"></div>
      </div>
      <button class="btn btn-cta btn-block" id="d-save" style="margin-top:8px">Save weight & run pace</button>
      <div class="dash-chart-wrap"><canvas id="dash-weight-chart" class="dash-canvas" height="220" aria-label="Body weight trend chart"></canvas><div class="dash-chart-caption">Body weight over selected range.</div></div>
      </div>
    </div>
  </div></div>
  <div class="section"><div class="card"><div class="card-h"><h2>Strength trend</h2></div>
    <div class="dash-range-row">${DASH_RANGES.map(([id,lb])=>`<button type="button" class="btn btn-sm ${getDashRangeKey()===id?"btn-secondary-solid":"btn-ghost"} dash-range-btn" data-r="${id}">${lb}</button>`).join("")}</div>
    <div class="dash-strength-legend"><span><i style="background:var(--ice)"></i>Bench</span><span><i style="background:var(--fire)"></i>Squat</span><span><i style="background:var(--mint)"></i>Deadlift</span></div>
    <div class="dash-chart-wrap"><canvas id="dash-strength-chart" class="dash-canvas" height="220" aria-label="Strength trend chart"></canvas><div class="dash-chart-caption">Tap or hover a point for exact date, lift, and estimated 1RM.</div></div>
  </div></div>
  <div class="section"><div class="card"><div class="card-h"><h2>Total volume by week</h2></div>    <div class="dash-chart-wrap"><canvas id="dash-volume-chart" class="dash-canvas" height="220" aria-label="Total weekly volume chart"></canvas><div class="dash-chart-caption">${useMetric()?"Weekly volume (kg-equivalent from logged loads).":"Total pounds lifted each week (set × reps × load)."} Progressive overload visibility.</div></div></div></div>
  ${recentDates.length?`<div class="section"><div class="card"><div class="card-h"><h2>Recent logs</h2></div>
    ${recentDates.map(ds=>`<div class="dash-log-day-group"><div class="dash-log-day-head">${dashLogDayHeader(ds)}</div>${recentByDate[ds].map(l=>{const sc=l.score||0;const cls=sc>=1.02?"score-good":sc>=.9?"score-ok":"score-low";return`<div class="log-entry dash-log-entry-compact"><div class="log-entry-head"><span class="log-date">${l.exercise}</span><span class="log-score ${cls}">${sc.toFixed(2)}</span></div><div class="log-detail">${l.aS}×${l.aR} @ ${formatLoadLbText(l.aW)}</div></div>`}).join("")}</div>`).join("")}</div></div>`:""}
    </div>
  </div>`;
}
function bindDash(){
  const clearTrainDate=()=>{trainSessionDate=null;trainFocusIdx=null};
  const st=document.getElementById("dash-start-workout");if(st)st.onclick=()=>{clearTrainDate();tab=TAB_TRAIN;trainSub="workout";render()};
  const wt=document.getElementById("dash-whats-today");if(wt)wt.onclick=()=>{clearTrainDate();tab=TAB_TRAIN;trainSub="workout";render()};
  const gl=document.getElementById("dash-go-log");if(gl)gl.onclick=()=>{tab=TAB_TRAIN;trainSub="log";logDate=iso();render()};
  const ql=document.getElementById("dash-q-log");if(ql)ql.onclick=()=>{tab=TAB_TRAIN;trainSub="log";logDate=iso();render()};
  const qp=document.getElementById("dash-q-plan");if(qp)qp.onclick=()=>{tab=TAB_PLAN;location.hash=TAB_PLAN;render()};
  const qr=document.getElementById("dash-q-plates");if(qr)qr.onclick=()=>{tab=TAB_TRAIN;trainSub="workout";sessionStorage.setItem("hw-open-plates","1");render()};
  const qh=document.getElementById("dash-q-health");if(qh)qh.onclick=()=>{tab=TAB_YOU;youSub="settings";sessionStorage.setItem("hw-scroll","#settings-health");render()};
  const dhs=document.getElementById("dash-open-health-settings");if(dhs)dhs.onclick=()=>{tab=TAB_YOU;youSub="settings";sessionStorage.setItem("hw-scroll","#settings-health");render()};
  const qe=document.getElementById("dash-q-ease");if(qe)qe.onclick=()=>{clearTrainDate();tab=TAB_TRAIN;trainSub="workout";location.hash=TAB_TRAIN;sessionStorage.setItem("hw-scroll","#train-ease-panel");sessionStorage.setItem("ease-open","1");render()};
  const um=document.getElementById("dash-update-metrics");if(um)um.onclick=()=>{tab=TAB_YOU;youSub="settings";sessionStorage.setItem("hw-scroll","#settings-profile");render()};
  const tLat=document.getElementById("trust-later"),tHi=document.getElementById("trust-hide");
  if(tLat)tLat.onclick=()=>{sessionStorage.setItem("hw-trust-until",String(Date.now()+7*864e5));render()};
  if(tHi)tHi.onclick=async()=>{S.profile.prefs={...(S.profile.prefs||{}),trustDataHide:true};await persist();render()};
  const ml=document.getElementById("dash-miss-log"),mp=document.getElementById("dash-miss-plan");
  if(ml)ml.onclick=()=>{logDate=ml.dataset.d;tab=TAB_TRAIN;trainSub="log";render()};
  if(mp)mp.onclick=()=>{tab=TAB_PLAN;render()};
  const dt=document.getElementById("dash-details-toggle");if(dt)dt.onclick=()=>{const o=sessionStorage.getItem("hw-dash-details")==="1";sessionStorage.setItem("hw-dash-details",o?"0":"1");render()};
  const sd=document.getElementById("sum-dismiss");if(sd)sd.onclick=()=>{lastLogSummary=null;render()};
  const el=document.getElementById("d-save");
  if(el)el.onclick=async()=>{
    const wn=massFieldToLb(Number(document.getElementById("d-wt").value));
    if(wn>0){S.profile.weight=wn;S.weightLog.push({date:iso(),wt:wn});S.weightLog=S.weightLog.slice(-90)}
    const r=parseMM(document.getElementById("d-run").value);if(r>0)S.profile.run4mi=r;
    await persist();render();toast("Saved");
  };
  const wInfo=document.getElementById("dash-warrior-info"),wExp=document.getElementById("dash-warrior-explain");
  if(wInfo&&wExp)wInfo.onclick=()=>{wExp.hidden=!wExp.hidden};
  const hInfo=document.getElementById("dash-heatmap-info"),hExp=document.getElementById("dash-heatmap-help");
  if(hInfo&&hExp)hInfo.onclick=()=>{hExp.hidden=!hExp.hidden};
  document.querySelectorAll(".dash-range-btn").forEach(b=>b.onclick=()=>{setDashRangeKey(b.dataset.r);render()});
  const eas=document.getElementById("ex-act-save");
  if(eas)eas.onclick=async()=>{
    const date=(document.getElementById("ex-act-date")?.value||"").trim();
    const kind=document.getElementById("ex-act-kind")?.value||"other";
    const minutes=Number(document.getElementById("ex-act-min")?.value)||0;
    const distanceMi=Number(document.getElementById("ex-act-mi")?.value)||0;
    const note=(document.getElementById("ex-act-note")?.value||"").trim().slice(0,200);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast("Pick a valid date.");return}
    if(minutes<=0&&distanceMi<=0&&!note){toast("Add minutes, distance, or a short note.");return}
    if(!Array.isArray(S.extraActivities))S.extraActivities=[];
    const id=(typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():("ea_"+Date.now()+"_"+Math.random().toString(36).slice(2,9));
    S.extraActivities.push({id,date,kind,minutes:minutes||undefined,distanceMi:distanceMi||undefined,note:note||undefined});
    S.extraActivities=S.extraActivities.slice(-200);
    await persist();render();toast("Activity saved");
  };
  drawDashCharts();
}
function getDashRangeKey(){const k=(sessionStorage.getItem("hw-dash-range")||"1m").toLowerCase();return DASH_RANGES.some(([id])=>id===k)?k:"1m"}
function setDashRangeKey(k){if(!DASH_RANGES.some(([id])=>id===k))return;sessionStorage.setItem("hw-dash-range",k)}
function dashRangeMs(k){if(k==="1w")return 7*864e5;if(k==="1m")return 30*864e5;if(k==="3m")return 90*864e5;if(k==="6m")return 180*864e5;return Infinity}
function inDashRange(isoDate,k){
  if(k==="all")return true;
  const t=new Date(String(isoDate)+"T12:00:00").getTime();
  if(Number.isNaN(t))return false;
  return t>=Date.now()-dashRangeMs(k);
}
function isoWeekStart(isoDate){
  const d=parseIsoNoon(isoDate);
  const dow=(d.getDay()+6)%7;
  d.setDate(d.getDate()-dow);
  return isoFromDate(d);
}
function formatDashDateShort(isoDate){return parseIsoNoon(isoDate).toLocaleDateString(undefined,{month:"short",day:"numeric"})}
function formatDashDateLong(isoDate){return parseIsoNoon(isoDate).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"})}
function strengthTrendSeries(rangeKey){
  const defs=[["Barbell Bench Press","Bench","var(--ice)"],["Back Squat","Squat","var(--fire)"],["Deadlift","Deadlift","var(--mint)"]];
  return defs.map(([exercise,label,color])=>{
    const byDay=new Map();
    for(const l of S.logs||[]){
      if(l.exercise!==exercise||!inDashRange(l.date,rangeKey))continue;
      const est=epley(Number(l.aW)||0,Number(l.aR)||0);
      if(!isFinite(est)||est<=0)continue;
      const k=l.date;
      byDay.set(k,Math.max(byDay.get(k)||0,est));
    }
    const points=[...byDay.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,value])=>({date,value,label,exercise}));
    return{key:exercise,label,color,points};
  });
}
function totalVolumeWeeklySeries(rangeKey){
  const byWeek=new Map();
  for(const l of S.logs||[]){
    if(!inDashRange(l.date,rangeKey))continue;
    const vol=(Number(l.aS)||0)*(Number(l.aR)||0)*(Number(l.aW)||0);
    if(!isFinite(vol)||vol<=0)continue;
    const wk=isoWeekStart(l.date);
    byWeek.set(wk,(byWeek.get(wk)||0)+vol);
  }
  const points=[...byWeek.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,value])=>({date,value,label:"Weekly volume"}));
  return[{key:"weekly-volume",label:"Total Volume",color:"var(--gold)",points}];
}
function bodyWeightSeries(rangeKey){
  const byDay=new Map();
  for(const r of S.weightLog||[]){
    if(!r||!r.date||!inDashRange(r.date,rangeKey))continue;
    const wt=Number(r.wt)||0;
    if(!isFinite(wt)||wt<=0)continue;
    byDay.set(r.date,wt);
  }
  const points=[...byDay.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,value])=>({date,value,label:"Body weight"}));
  return[{key:"body-weight",label:"Weight",color:"var(--ice)",points}];
}
function ensureChartTip(host,tipId){
  if(!host)return null;
  let tip=host.querySelector(`#${tipId}`);
  if(!tip){
    tip=document.createElement("div");
    tip.id=tipId;
    tip.className="dash-chart-tip";
    tip.hidden=true;
    host.appendChild(tip);
  }
  return tip;
}
function drawLineChart(canvas,series,{emptyText,ySuffix="",xNote="",tipPrefix=""}={}){
  if(!canvas)return;
  const host=canvas.closest(".dash-chart-wrap")||canvas.parentElement;
  if(host&&getComputedStyle(host).position==="static")host.style.position="relative";
  const tip=ensureChartTip(host,`tip-${canvas.id}`);
  const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  const cssW=canvas.clientWidth||700,cssH=canvas.clientHeight||220;
  canvas.width=Math.floor(cssW*dpr);
  canvas.height=Math.floor(cssH*dpr);
  const ctx=canvas.getContext("2d");
  if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);
  const pad={l:46,r:14,t:14,b:34};
  const plotW=cssW-pad.l-pad.r,plotH=cssH-pad.t-pad.b;
  const allPoints=series.flatMap(s=>s.points.map(p=>({...p,color:s.color,series:s.label})));
  const days=[...new Set(allPoints.map(p=>p.date))].sort();
  if(!days.length){
    ctx.fillStyle="var(--text3)";
    ctx.font="12px DM Sans, sans-serif";
    ctx.fillText(emptyText||"No data yet.",16,30);
    canvas.onmousemove=canvas.onmouseleave=canvas.onclick=canvas.ontouchstart=null;
    if(tip)tip.hidden=true;
    return;
  }
  const vals=allPoints.map(p=>p.value);
  let lo=Math.min(...vals),hi=Math.max(...vals);
  if(lo===hi){lo=Math.max(0,lo-1);hi=hi+1}
  const span=Math.max(1,hi-lo);
  const xAt=i=>pad.l+((days.length===1?0.5:(i/(days.length-1)))*plotW);
  const yAt=v=>pad.t+plotH-((v-lo)/span)*plotH;
  ctx.strokeStyle="color-mix(in srgb,var(--border) 65%,transparent)";
  ctx.lineWidth=1;
  for(let t=0;t<=3;t++){
    const yy=pad.t+(plotH*(t/3));
    ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(cssW-pad.r,yy);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,cssH-pad.b);ctx.lineTo(cssW-pad.r,cssH-pad.b);ctx.stroke();
  ctx.fillStyle="var(--text3)";
  ctx.font="10px DM Sans, sans-serif";
  ctx.textAlign="right";
  for(let t=0;t<=3;t++){
    const val=hi-((hi-lo)*(t/3));
    const yy=pad.t+(plotH*(t/3));
    ctx.fillText(`${Math.round(val)}${ySuffix}`,pad.l-6,yy+3);
  }
  ctx.textAlign="center";
  if(days.length===1)ctx.fillText(formatDashDateShort(days[0]),xAt(0),cssH-10);
  else{
    ctx.fillText(formatDashDateShort(days[0]),xAt(0),cssH-10);
    ctx.fillText(formatDashDateShort(days[Math.floor(days.length/2)]),xAt(Math.floor(days.length/2)),cssH-10);
    ctx.fillText(formatDashDateShort(days[days.length-1]),xAt(days.length-1),cssH-10);
  }
  if(xNote){
    ctx.textAlign="right";
    ctx.fillText(xNote,cssW-pad.r,cssH-4);
  }
  const rendered=[];
  for(const s of series){
    if(!s.points.length)continue;
    ctx.strokeStyle=s.color;
    ctx.lineWidth=2;
    ctx.beginPath();
    s.points.forEach((p,idx)=>{
      const xi=xAt(days.indexOf(p.date)),yi=yAt(p.value);
      if(idx===0)ctx.moveTo(xi,yi);else ctx.lineTo(xi,yi);
      rendered.push({...p,series:s.label,color:s.color,x:xi,y:yi});
    });
    ctx.stroke();
  }
  rendered.forEach(p=>{
    ctx.beginPath();
    ctx.fillStyle=p.color;
    ctx.arc(p.x,p.y,3.2,0,Math.PI*2);
    ctx.fill();
  });
  const showTip=(pt,evt)=>{
    if(!tip||!host)return;
    tip.hidden=false;
    tip.innerHTML=`<b>${pt.series}</b><br>${formatDashDateLong(pt.date)}<br>${tipPrefix?tipPrefix+" ":""}${Math.round(pt.value)}${ySuffix}`;
    const box=host.getBoundingClientRect();
    const x=((evt.clientX||box.left+pt.x)-box.left)+10;
    const y=((evt.clientY||box.top+pt.y)-box.top)-8;
    tip.style.left=`${Math.max(8,Math.min(x,box.width-160))}px`;
    tip.style.top=`${Math.max(8,y)}px`;
  };
  const hideTip=()=>{if(tip)tip.hidden=true};
  const nearest=evt=>{
    const r=canvas.getBoundingClientRect();
    const x=evt.clientX-r.left,y=evt.clientY-r.top;
    let best=null,bestD=18;
    for(const p of rendered){
      const d=Math.hypot(p.x-x,p.y-y);
      if(d<bestD){best=p;bestD=d}
    }
    return best;
  };
  canvas.onmousemove=e=>{const pt=nearest(e);if(pt)showTip(pt,e);else hideTip()};
  canvas.onclick=e=>{const pt=nearest(e);if(pt)showTip(pt,e);};
  canvas.onmouseleave=hideTip;
  canvas.ontouchstart=e=>{const t=e.touches&&e.touches[0];if(!t)return;const pt=nearest(t);if(pt)showTip(pt,t);};
}
function chartSeriesLbToDisplay(series){
  if(!useMetric())return series;
  return series.map(s=>({...s,points:s.points.map(p=>({...p,value:(Number(p.value)||0)/LB_PER_KG}))}));
}
function drawDashCharts(){
  const rk=getDashRangeKey();
  const su=massUnitLabel();
  drawLineChart(document.getElementById("dash-strength-chart"),chartSeriesLbToDisplay(strengthTrendSeries(rk)),{emptyText:"No strength logs for this range yet.",ySuffix:` ${su}`,xNote:rk==="all"?"All-time":"Selected range",tipPrefix:"Est 1RM"});
  drawLineChart(document.getElementById("dash-volume-chart"),chartSeriesLbToDisplay(totalVolumeWeeklySeries(rk)),{emptyText:"No weekly volume in this range yet.",ySuffix:` ${su}`,xNote:"Weekly totals",tipPrefix:"Volume"});
  drawLineChart(document.getElementById("dash-weight-chart"),chartSeriesLbToDisplay(bodyWeightSeries(rk)),{emptyText:"No body-weight logs for this range yet.",ySuffix:` ${su}`,xNote:"Body weight trend",tipPrefix:"Weight"});
}

// ═══════════════════════════════════════════════════════════
//  RENDER — TRAIN / YOU WRAPPERS
// ═══════════════════════════════════════════════════════════
function renderTrain(){
  return`<div class="subtab-row"><button type="button" class="subtab ${trainSub==="workout"?"on":""} train-sub" data-s="workout">Session</button><button type="button" class="subtab ${trainSub==="log"?"on":""} train-sub" data-s="log">Log</button></div><div id="train-inner">${trainSub==="workout"?renderToday():renderLog()}</div>`;
}
function renderYou(){
  if(youSub==="ref")youSub="home";
  const inner=youSub==="settings"?renderSettings():renderDash();
  return`<div class="subtab-row you-subtabs" role="tablist" aria-label="You sections"><button type="button" class="subtab ${youSub==="home"?"on":""} you-sub" role="tab" aria-selected="${youSub==="home"}" data-s="home">Overview</button><button type="button" class="subtab ${youSub==="settings"?"on":""} you-sub" role="tab" aria-selected="${youSub==="settings"}" data-s="settings">Settings</button></div><div id="you-inner">${inner}</div>`;
}
function bindTrain(){
  document.querySelectorAll(".train-sub").forEach(b=>b.onclick=()=>{if(b.dataset.s==="log")trainFocusIdx=null;trainSub=b.dataset.s;render()});
  if(trainSub==="workout")bindToday();else{releaseWorkoutWakeLock();bindLog();}
}
function bindYou(){
  releaseWorkoutWakeLock();
  document.querySelectorAll(".you-sub").forEach(b=>b.onclick=()=>{youSub=b.dataset.s;render()});
  if(youSub==="home")bindDash();
  else{enhanceNumericInputs(document.getElementById("you-inner")||document);bindSettings()}
}

// ═══════════════════════════════════════════════════════════
//  RENDER — TODAY
// ═══════════════════════════════════════════════════════════
function renderExerciseCardHtml(ex,i){
  const e=exById(ex.eid);
  const howBlock=e&&e.howTo&&e.howTo.length?`<div class="ex-howto"><div style="font-size:10px;font-weight:600;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">How to</div><ol>${e.howTo.map(s=>`<li>${s}</li>`).join("")}</ol></div>`:"";
  const m=exMedia(ex.eid);
  const mm=exMuscles(ex.eid);
  const emb=embedVideoUrl(m.video);
  const open=openVideoUrl(m.video);
  const done=isExLoggedToday(ex.eid);
  const lwLb=(S.lastLiftByEid&&S.lastLiftByEid[ex.eid]!=null)?Number(S.lastLiftByEid[ex.eid]):(Number(ex.target)||0);
  const wStep=loadStepDelta();
  const exNm=e?e.name:ex.eid;
  const cue=(e&&e.howTo&&e.howTo[0])?String(e.howTo[0]).slice(0,140):"";
  const thumbUrl=exerciseVideoThumbUrl(m.video);
  const thumbHtml=thumbUrl?`<img class="ex-thumb" src="${thumbUrl}" alt="" width="72" height="54" loading="lazy">`:"";
  const cueRow=cue?`<div class="ex-cue-row">${thumbHtml}<p class="ex-cue">${cue}</p></div>`:(thumbHtml?`<div class="ex-cue-row">${thumbHtml}</div>`:"");
  const restSec=e&&e.rest?parseRestSec(e.rest):90;
  const restHuman=e&&e.rest?formatRestHuman(restSec):formatRestHuman(90);
  const restTitle=e&&e.rest?String(e.rest).replace(/"/g,"'"):"~90s";
  const lastLine=lastLogSummaryForEid(ex.eid);
  const lastLineHtml=lastLine?`<div class="ex-last-log">${lastLine}</div>`:"";
  const mainVideoHtml=m.video?`<iframe src="${emb}" title="${exNm} tutorial video" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div class="fallback"><span style="font-size:11px;color:var(--text3)">If video does not load in app mode:</span><a href="${open}" target="_blank" rel="noopener noreferrer">Open video</a></div>`:`<p style="font-size:11px;color:var(--text3)">Video coming soon.</p>`;
  const qUrl=exerciseQuickDemoUrl(ex.eid);
  const qEmb=qUrl?embedVideoUrl(qUrl):"";
  const qOpen=qUrl?openVideoUrl(qUrl):"";
  const quickVideoHtml=qUrl?`<div class="ex-quick-video-wrap"><button type="button" class="btn btn-sm btn-ghost ex-quick-video-toggle" data-i="${i}" aria-expanded="false">Show quick video</button><div class="ex-quick-video-panel" id="exq-${i}" hidden><p style="font-size:10px;color:var(--text3);margin-bottom:6px">Short demo (~2 min)</p><iframe src="${qEmb}" title="Quick demo: ${exNm}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div class="fallback"><span style="font-size:11px;color:var(--text3)">Quick clip:</span><a href="${qOpen}" target="_blank" rel="noopener noreferrer">Open in YouTube</a></div></div></div>`:"";
  const dayIso=activeTrainIso();
  const completedSets=(S.logs||[]).filter(l=>l.date===dayIso&&l.exercise===exNm).length;
  const activeSet=Math.min(ex.sets,completedSets+1);
  return`<div class="ex-card ${done?"ex-done":""}" id="exc-${i}" data-eid="${ex.eid}"><div class="ex-top ex-top-row"><div class="ex-check">${done?"✓":""}</div><div class="ex-num">${i+1}</div><div class="ex-info"><div class="ex-name-lg">${exNm}</div><div class="ex-rx-lg">${formatPrescribedRx(ex)}</div><div class="ex-reason">${ex.reason}</div>${cueRow}</div><div class="ex-actions ex-actions-stack"><div class="ex-actions-primary"><button type="button" class="btn btn-sm btn-secondary-solid ex-rest" data-i="${i}" title="Rest timer (${restTitle})">Rest · ${restHuman}</button><button type="button" class="btn btn-sm btn-cta ex-toggle" data-i="${i}">Details &amp; video</button></div><div class="ex-actions-secondary"><button type="button" class="ex-link-btn ex-skip" data-eid="${ex.eid}" title="Remove from today's checklist">Skip</button><span class="ex-actions-sep" aria-hidden="true">·</span><button type="button" class="ex-link-btn ex-swap" data-orig="${ex.originalEid||ex.eid}" title="Replace with a similar movement">Swap</button></div></div></div><div class="ex-body" id="exb-${i}"><div class="ex-video">${mainVideoHtml}${quickVideoHtml}</div>${howBlock}<div class="fig-wrap"><div class="fig-title">Muscle emphasis</div>${anatomyContainer(mm)}<div class="fig-legend"><span><span class="dot" style="background:#00e676;opacity:1"></span>Primary</span><span><span class="dot" style="background:#00e676;opacity:.72"></span>Secondary</span><span><span class="dot" style="background:#00e676;opacity:.45"></span>Tertiary</span><span><span class="dot" style="background:#ff6b35;opacity:.65"></span>Burn</span></div></div><div class="feel-chips"><span>This lift felt:</span><button type="button" class="feel-chip" data-feel="easy" data-i="${i}">Too easy (RPE &lt; 7)</button><button type="button" class="feel-chip on" data-feel="ok" data-i="${i}">Just right (RPE 7-8)</button><button type="button" class="feel-chip" data-feel="hard" data-i="${i}">Too hard (RPE 9+)</button></div><div class="quick-log-row"><span class="quick-set-indicator" id="tq-set-lbl${i}" style="font-size:11px;color:var(--text3);align-self:center">Set ${activeSet} of ${ex.sets}</span><div><label>Reps</label><div class="stepper"><button type="button" class="step-btn" data-target="tq-r${i}" data-delta="-1">−</button><input type="number" class="input-sm" id="tq-r${i}" value="${ex.reps}" min="1"><button type="button" class="step-btn" data-target="tq-r${i}" data-delta="1">+</button></div></div><div><label>Load (${massUnitLabel()})</label><div class="stepper"><button type="button" class="step-btn" data-target="tq-w${i}" data-delta="${-wStep}">−</button><input type="number" class="input-sm" id="tq-w${i}" value="${loadInputDisplayFromLb(lwLb)}" min="0" step="any"><button type="button" class="step-btn" data-target="tq-w${i}" data-delta="${wStep}">+</button><button type="button" class="icon-btn q-load-helper" data-i="${i}" title="Open bar load helper" aria-label="Open bar load helper for load">🏋️</button></div></div><div><label>Outcome</label><select id="tq-o${i}" class="input-sm"><option value="ok">Completed</option><option value="fail">Failed rep target</option><option value="time">Time-capped</option></select></div><button type="button" class="btn btn-cta btn-block q-save" data-i="${i}">Complete set & start rest</button></div>${lastLineHtml}<div class="ex-log-grid"><div><label>Sets</label><div class="stepper"><button type="button" class="step-btn" data-target="t-s${i}" data-delta="-1">−</button><input type="number" class="input-sm" id="t-s${i}" value="${ex.sets}" min="1"><button type="button" class="step-btn" data-target="t-s${i}" data-delta="1">+</button></div></div><div><label>Reps</label><div class="stepper"><button type="button" class="step-btn" data-target="t-r${i}" data-delta="-1">−</button><input type="number" class="input-sm" id="t-r${i}" value="${ex.reps}" min="1"><button type="button" class="step-btn" data-target="t-r${i}" data-delta="1">+</button></div></div><div><label>Load (${massUnitLabel()})</label><div class="stepper"><button type="button" class="step-btn" data-target="t-w${i}" data-delta="${-wStep}">−</button><input type="number" class="input-sm" id="t-w${i}" value="${loadInputDisplayFromLb(Number(ex.target)||0)}" min="0" step="any"><button type="button" class="step-btn" data-target="t-w${i}" data-delta="${wStep}">+</button></div></div><div><label>Outcome</label><select id="t-o${i}" class="input-sm"><option value="ok">Completed</option><option value="fail">Failed rep target</option><option value="time">Time-capped</option></select></div><button type="button" class="btn btn-sm btn-secondary-solid ex-copyprev" data-i="${i}">Copy previous set</button><button type="button" class="btn btn-cta btn-sm ex-save" data-i="${i}">Save all</button></div><div id="expdf-${i}" class="ex-pdf-area"></div></div></div>`;
}
function renderToday(){
  const dayIso=activeTrainIso();
  const plan=todayPlanFiltered();
  const d=parseIsoNoon(dayIso),w=plan.blockWeek!=null?plan.blockWeek:S.program.week;
  const meta=slotMeta(plan.slot||"");
  const safety=getSafetyMode();
  const micro=(S.profile.sex==="female"&&safety==="postpartum")?postpartumMicroRoutine(d.getDay()):null;
  const zones=mergeZones(plan);
  const bc=sessionBreadcrumb(w,plan);
  const bpos=blockPositionLine(plan);
  const qm=Number((S.profile.prefs||{}).quickSessionMin)||0;
  const skipped=((S.skippedEidsByDate||{})[dayIso]||[]);
  const skippedLbl=skipped.map(id=>(exById(id)||{}).name||id).join(", ");
  const sf=S.sessionFeelByDate&&S.sessionFeelByDate[dayIso];
  const finalized=!!((S.sessionAdaptedByDate||{})[dayIso]);
  const miss=oldestUnresolvedMiss();
  const adj=ensureScheduleAdjust();
  const todayIso=iso();
  const isTrainDay=globalSessionIndexForDate(todayIso)!==null;
  const q0=adj.catchUpQueue[0];
  const showOffDayCatch=!isTrainDay&&!!q0&&(!q0.dueIso||q0.dueIso>todayIso)&&adj.extraTrainingIso!==todayIso;
  const catchLabel=q0?((()=>{const cp=mkDay(q0.slot,q0.blockWeek);return(cp.focus||"Session").split("·")[0].trim().slice(0,42)})()):"";
  const catchBanner=plan._catchUpDue||plan._catchUpExtra;
  const wuSteps=warmupStepsFromPlan(plan.warmup);
  const wuState=(S.warmupDoneByDate&&S.warmupDoneByDate[dayIso])||{};
  const escLite=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
  const wuBlock=!plan.warmup?"":wuSteps.length?`<div class="card section wu-card" style="border-left:3px solid var(--ice)"><div style="font-size:11px;font-weight:700;color:var(--ice);margin-bottom:8px">Warm-up checklist</div><ul class="wu-list">${wuSteps.map((line,wi)=>{const checked=!!wuState[String(wi)];return`<li class="wu-item"><label class="wu-label"><input type="checkbox" class="wu-step-cb" data-wu-idx="${wi}" ${checked?"checked":""}><span class="wu-text">${escLite(line)}</span></label></li>`}).join("")}</ul></div>`:`<div class="card section" style="border-left:3px solid var(--ice)"><div style="font-size:11px;font-weight:700;color:var(--ice);margin-bottom:4px">Warm-up</div><div style="font-size:12px;color:var(--text2)">${escLite(plan.warmup)}</div></div>`;
  const sfSavedLbl=sf==="easy"?"Light (~RPE 6)":sf==="hard"?"Hard (~RPE 9+)":sf==="ok"?"Solid (~RPE 7–8)":"";
  if(trainFocusIdx!==null){
    if(!plan.exs.length)trainFocusIdx=null;
    else trainFocusIdx=clamp(trainFocusIdx,0,plan.exs.length-1);
  }
  if(trainFocusIdx!==null&&plan.exs.length){
    const n=plan.exs.length,idx=trainFocusIdx,tx=-(idx*100)/n;
    const focusDots=plan.exs.map((_,i)=>`<span class="${i===idx?"on":""}" title="Exercise ${i+1} of ${n}"></span>`).join("");
    const slides=plan.exs.map((ex,i)=>`<div class="focus-session-slide" style="width:${100/n}%;flex-shrink:0">${renderExerciseCardHtml(ex,i)}</div>`).join("");
    return`<div id="p-today" class="train-focus-mode train-session-active">
  ${trainSessionDate&&trainSessionDate!==iso()?`<div class="session-banner" role="status"><span>Viewing <b style="color:var(--text)">${trainSessionDate}</b> — not today on the calendar.</span> <button type="button" class="btn btn-sm btn-secondary-solid" id="train-clear-date">Back to today</button></div>`:""}
  ${catchBanner?`<div class="session-banner" role="status">Catch-up session loaded — this is the workout that moved from a missed day. Log when done; the queue clears after you train.</div>`:""}
  <div class="focus-session-bar">
    <button type="button" class="btn btn-ghost btn-sm" id="focus-exit">← Full session</button>
    <span class="focus-session-title">Focused workout</span>
    <div class="focus-session-dots-wrap" aria-label="Exercise pagination" role="status"><div class="focus-session-dots">${focusDots}</div></div>
  </div>
  <div class="hero-title" style="font-size:17px;margin-bottom:2px">${DAYS[d.getDay()]}</div>
  <div class="breadcrumb" style="font-size:12px;margin-bottom:8px">${bc}</div>
  <div class="focus-session-viewport">
    <div class="focus-session-track" style="width:${n*100}%;transform:translateX(${tx}%)">
      ${slides}
    </div>
  </div>
  <div class="focus-nav-row">
    ${idx>0?`<button type="button" class="btn btn-secondary-solid btn-sm" id="focus-prev" aria-label="Previous exercise">‹ Previous</button>`:""}
    ${idx<n-1?`<button type="button" class="btn btn-ghost btn-sm" id="focus-next-skip" aria-label="Next exercise">Next ›</button>`:""}
  </div>
  <p class="focus-hint">Use <b style="color:var(--text)">‹ ›</b> to change lifts. Tap <b style="color:var(--text)">Save all</b> to log this exercise.</p>
  <div class="train-session-footer"><button type="button" class="btn btn-mint btn-block session-finalize-sync">${finalized?"Session complete":"Complete session"}</button></div>
  ${setLoadOverlayHtml()}
  </div>`;
  }
  return`<div id="p-today" class="${plan.exs.length?"train-session-active":""}">
  ${trainSessionDate&&trainSessionDate!==iso()?`<div class="session-banner" role="status"><span>Viewing <b style="color:var(--text)">${trainSessionDate}</b> — not today on the calendar.</span> <button type="button" class="btn btn-sm btn-secondary-solid" id="train-clear-date">Back to today</button></div>`:""}
  <div class="hero-title" style="font-size:20px;margin-bottom:4px">${DAYS[d.getDay()]}</div>
  <div class="breadcrumb">${bc}</div>
  ${bpos?`<div style="font-size:11px;color:var(--text3);margin-bottom:6px">${bpos}</div>`:""}
  ${nextTrainingDotsHtml(6)}
  ${plan.exs.length&&trainFocusIdx===null?`<div class="section" style="margin-bottom:2px"><button type="button" class="btn btn-cta btn-block" id="train-begin-session">Begin session</button><p style="font-size:11px;color:var(--text3);margin-top:8px;text-align:center;line-height:1.45">One exercise at a time — fewer distractions while you train.</p></div>`:""}
  ${catchBanner?`<div class="session-banner" role="status">Catch-up session loaded — this is the workout that moved from a missed day. Log when done; the queue clears after you train.</div>`:""}
  ${miss?`<div class="card section" style="border-left:3px solid var(--gold)"><div style="font-size:14px;font-weight:600">Missed ${miss.dayName}. What should we do?</div><p style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.45">We only ask once per miss unless you use <b style="color:var(--text)">Adjust schedule</b>. Logging on the original day still counts and clears a queued move.</p><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:12px"><button type="button" class="btn btn-cta btn-sm" id="miss-move">Move to next training day</button><button type="button" class="btn btn-secondary-solid btn-sm" id="miss-skip">Skip it</button><button type="button" class="btn btn-ghost btn-sm" id="miss-pick">Different day…</button><button type="button" class="btn btn-ghost btn-sm" id="miss-later">Decide later</button></div></div>`:""}
  ${showOffDayCatch?`<div class="card section" style="border-left:3px solid var(--border-lit)"><div style="font-size:13px;font-weight:600">Optional catch-up</div><p style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.45">No extra work is scheduled for today — totally optional. Add the queued session if you want more: <b style="color:var(--text)">${catchLabel||"Queued session"}</b></p><button type="button" class="btn btn-secondary-solid btn-sm" id="catchup-add-today">Add to today</button></div>`:""}
  <details class="train-tools section">
    <summary class="train-tools-summary">Workout tools</summary>
    <div class="train-tools-body">
      <button type="button" class="btn btn-secondary-solid ${((S.profile.prefs||{}).equipment||"gym")==="home"?"btn-fire":""}" id="train-eq-toggle">${((S.profile.prefs||{}).equipment||"gym")==="home"?"Equipment: Home":"Equipment: Gym"}</button>
      <button type="button" class="btn btn-secondary-solid ${qm>0?"btn-fire":""}" id="train-quick">${qm>0?"15-min mode on":"Minimum session (~15 min)"}</button>
      <button type="button" class="btn btn-ghost" id="train-open-plates">Plate helper</button>
      <button type="button" class="btn btn-ghost" id="train-open-health">Health metrics</button>
      <button type="button" class="btn btn-ghost" id="train-open-ease">Ease load…</button>
      <button type="button" class="btn btn-ghost btn-sm" id="train-adjust-schedule" title="Re-open choices for missed sessions">Adjust schedule</button>
    </div>
  </details>
  <div class="card section" id="train-plates-card">
    <button type="button" class="details-toggle" id="train-plates-toggle" style="width:100%;text-align:left">Bar load helper (in-workout)</button>
    <div class="details-panel" id="train-plates-body">
      ${trainPlateHelperBlockHtml()}
      <div id="tw-pl-out" style="font-size:13px;color:var(--text);margin-top:12px;line-height:1.45;font-weight:500"></div>
    </div>
  </div>
  ${plan.exs.length?`<div class="card section"><div class="card-h"><h2>Today's impact map</h2></div><div class="fig-wrap"><div class="fig-title">Combined stimulus</div>${anatomyContainer(zones)}<div class="fig-legend"><span><span class="dot" style="background:#00e676;opacity:1"></span>Primary</span><span><span class="dot" style="background:#00e676;opacity:.72"></span>Secondary</span><span><span class="dot" style="background:#00e676;opacity:.45"></span>Tertiary</span><span><span class="dot" style="background:#ff6b35;opacity:.65"></span>Burn</span></div></div></div>`:""}
  ${meta?`<div class="card section"><button type="button" class="details-toggle" id="why-toggle" style="width:100%;text-align:left">Why this session? (coaching notes)</button><div class="details-panel" id="why-body"><div style="font-size:12px;color:var(--text2);margin-bottom:4px"><b style="color:var(--text)">Target:</b> ${meta.muscles}</div><div style="font-size:12px;color:var(--text2);margin-bottom:4px"><b style="color:var(--text)">Purpose:</b> ${meta.why}</div><div style="font-size:12px;color:var(--text2)"><b style="color:var(--text)">Progress:</b> ${meta.expect}</div></div></div>`:""}
  ${micro?`<div class="card section" style="border-left:3px solid var(--gold)"><div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:4px">Posture / prehab add-on</div><ol style="margin-left:16px;color:var(--text2);font-size:12px">${micro.map(x=>`<li>${x}</li>`).join("")}</ol></div>`:""}
  ${wuBlock}
  ${plan.quickNote?`<div class="card section" style="border-left:3px solid var(--gold)"><div style="font-size:12px;color:var(--text2)"><b style="color:var(--text)">Minimum session:</b> first two lifts keep your streak honest. Finisher below is optional — add it if you have bandwidth.</div></div>`:""}
  <div class="stack">${plan.exs.length?plan.exs.map((ex,i)=>renderExerciseCardHtml(ex,i)).join(""):`<div class="card" style="text-align:center;padding:28px"><p style="font-size:15px;color:var(--text);font-weight:700;margin-bottom:8px">Recovery day</p><p style="font-size:13px;color:var(--text2)">Light walk or easy mobility — optional. Come back on your next scheduled train day.</p></div>`}</div>
  ${skipped.length?`<div class="card section" style="font-size:12px;color:var(--text2)">Skipped today: <b style="color:var(--text)">${skippedLbl||"—"}</b> · <button type="button" class="details-toggle" id="skip-restore">Restore skipped lifts</button></div>`:""}
  ${plan.exs.length?`<div class="card section" id="session-after-card"><div style="font-size:13px;font-weight:600;margin-bottom:4px">Rate intensity</div><p style="font-size:11px;color:var(--text3);margin-bottom:10px;line-height:1.45">Rough session RPE — pairs with <b style="color:var(--text)">Complete session</b> below so tomorrow's targets stay honest.</p>${sf?`<div style="font-size:12px;color:var(--mint);margin-bottom:6px">Saved: <b>${sfSavedLbl}</b></div>`:""}<div class="row" style="flex-wrap:wrap;gap:8px"><button type="button" class="btn btn-sm ${sf==="easy"?"btn-fire":"btn-secondary-solid"}" data-sfeel="easy">Light · ~RPE 6</button><button type="button" class="btn btn-sm ${sf==="ok"?"btn-fire":"btn-secondary-solid"}" data-sfeel="ok">Solid · ~RPE 7–8</button><button type="button" class="btn btn-sm ${sf==="hard"?"btn-fire":"btn-secondary-solid"}" data-sfeel="hard">Hard · ~RPE 9+</button>${sf?`<button type="button" class="btn btn-sm btn-ghost" id="sfeel-clear">Clear</button>`:""}</div>${finalized?`<p style="font-size:11px;color:var(--mint);margin-top:10px;margin-bottom:0">Adaptation applied for ${dayIso}.</p>`:`<p style="font-size:11px;color:var(--text3);margin-top:10px;margin-bottom:0">When you're done lifting, tap Complete session in the bar below.</p>`}</div>`:""}
  ${plan.exs.length?`<div class="card section" id="train-ease-panel"><div style="font-size:13px;font-weight:600;margin-bottom:4px">Program feels too heavy?</div><p style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.45">Nudge all lift/run adaptation down ~5% and add 5 minutes to your session budget (max 75 min) — right from here, no Settings detour.</p><button type="button" class="btn btn-secondary-solid btn-sm" id="train-ease-toggle">Show ease options</button><div class="ease-wizard" id="train-ease-wiz"><p style="font-size:12px;color:var(--text2);margin-bottom:8px">Targets ease until your logs show you're ahead of prescription again.</p><button type="button" class="btn btn-cta btn-sm" id="train-ease-go">Ease my program</button></div></div>`:""}
  ${plan.finisher?`<div class="finisher finisher-block"><h3>Finisher${plan.quickNote?" (optional)":""}</h3><p>${plan.finisher}</p></div>`:""}
  ${plan.exs.length?`<div class="train-session-footer"><button type="button" class="btn btn-mint btn-block session-finalize-sync">${finalized?"Session complete":"Complete session"}</button></div>${setLoadOverlayHtml()}`:""}
  </div>`;
}
async function loadExercisePdfPreview(i){
  const plan=todayPlanFiltered();const ex=plan.exs[i];if(!ex)return;
  const e=exById(ex.eid);const pdf=document.getElementById("expdf-"+i);
  if(!pdf||pdf.dataset.pdfLoaded==="1")return;
  pdf.dataset.pdfLoaded="1";
  if(!e||!e.books||!e.books.length){pdf.innerHTML=`<p style="color:var(--gold);font-size:11px">PDF preview not configured. Use the steps and video above.</p>`;return}
  const bk=e.books[0],src=S.pdfs[bk];
  if(!src){pdf.innerHTML=`<p style="color:var(--gold);font-size:11px">PDF preview not configured.</p>`;return}
  pdf.innerHTML=`<p style="color:var(--text3);font-size:11px">Searching ${bk}…</p>`;
  try{
    const doc=await getPdf(bk,src);let best={pg:1,sc:-1};
    for(let p=1;p<=doc.numPages;p++){
      const pg=await doc.getPage(p);const tc=await pg.getTextContent();const txt=tc.items.map(x=>x.str).join(" ").toLowerCase();let sc=0;
      for(const k of e.kw)if(txt.includes(k))sc++;
      if(sc>best.sc)best={pg:p,sc};if(sc>=Math.min(e.kw.length,3))break
    }
    const pg=await doc.getPage(best.pg);const vp=pg.getViewport({scale:1.4});const cvs=document.createElement("canvas");
    cvs.width=vp.width;cvs.height=vp.height;cvs.style.cssText="width:100%;border-radius:8px;border:1px solid var(--border);margin-top:8px";
    await pg.render({canvasContext:cvs.getContext("2d"),viewport:vp}).promise;
    pdf.innerHTML=`<p style="color:var(--mint);font-size:11px">Page ${best.pg} of ${bk}</p>`;pdf.appendChild(cvs)
  }catch{pdf.innerHTML=`<p style="color:var(--red);font-size:11px">Could not load PDF preview.</p>`}
}
function readLiftFeel(i){const on=document.querySelector(`#p-today .feel-chip.on[data-i="${i}"]`);return(on&&on.dataset.feel)||"ok"}
async function logSingleSetForExercise(i){
  const plan=todayPlanFiltered();
  const ex=plan.exs[i];
  if(!ex)return{ok:false};
  const e=exById(ex.eid);
  const name=e?e.name:ex.eid;
  const dayIso=activeTrainIso();
  const existing=(S.logs||[]).filter(l=>l.date===dayIso&&l.exercise===name).length;
  const setNo=Math.max(1,existing+1);
  const maxSets=Math.max(1,Number(ex.sets)||1);
  if(setNo>maxSets){toast(`All ${maxSets} sets already logged for ${name}.`);return{ok:false,atCap:true,maxSets,name};}
  const aR=Number(document.getElementById("tq-r"+i)?.value)||0;
  const aW=loadInputToLb(Number(document.getElementById("tq-w"+i)?.value)||0);
  const out=(document.getElementById("tq-o"+i)||{value:"ok"}).value;
  if(aR<=0){toast("Enter reps for this set.");return{ok:false};}
  const makeId=()=>((typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():("log_"+Date.now()+"_"+Math.random().toString(36).slice(2,10)));
  const logWk=plan.blockWeek!=null?plan.blockWeek:getWkForDate(dayIso);
  const log={id:makeId(),date:dayIso,week:logWk,exercise:name,tS:ex.sets,tR:ex.reps,tW:ex.target,aS:1,aR,aW,liftFeel:readLiftFeel(i),outcome:out,score:1};
  log.score=calcLogScore(log);
  S.logs.push(log);
  S.logs=S.logs.slice(-1000);
  S.lastLiftByEid[ex.eid]=aW;
  if(!S.sessionAdaptedByDate)S.sessionAdaptedByDate={};
  delete S.sessionAdaptedByDate[dayIso];
  resolveCatchUpQueueAfterLog(dayIso);
  await persist();
  return{ok:true,name,setNo,maxSets,aR,aW,outcome:out,ex};
}
async function ensureWorkoutWakeLock(){
  try{
    if(typeof navigator==="undefined"||!navigator.wakeLock||workoutWakeLock)return;
    workoutWakeLock=await navigator.wakeLock.request("screen");
    workoutWakeLock.addEventListener("release",()=>{workoutWakeLock=null});
  }catch{}
}
async function releaseWorkoutWakeLock(){
  try{if(workoutWakeLock){await workoutWakeLock.release();workoutWakeLock=null}}catch{}
}
function bindToday(){
  if(!S.lastLiftByEid)S.lastLiftByEid={};
  ensureWorkoutWakeLock();
  enhanceNumericInputs(document.getElementById("p-today")||document);
  const tcd=document.getElementById("train-clear-date");
  if(tcd)tcd.onclick=()=>{trainSessionDate=null;render()};
  const tbs=document.getElementById("train-begin-session");
  if(tbs)tbs.onclick=()=>{trainFocusIdx=0;render()};
  const fex=document.getElementById("focus-exit");
  if(fex)fex.onclick=()=>{trainFocusIdx=null;render()};
  const fpr=document.getElementById("focus-prev");
  if(fpr)fpr.onclick=()=>{if(trainFocusIdx>0){trainFocusIdx--;render()}};
  const fnx=document.getElementById("focus-next-skip");
  if(fnx)fnx.onclick=()=>{const p=todayPlanFiltered();if(trainFocusIdx!==null&&trainFocusIdx<p.exs.length-1){trainFocusIdx++;render()}};
  const wt=document.getElementById("why-toggle"),wb=document.getElementById("why-body");
  if(wt&&wb)wt.onclick=()=>{wb.classList.toggle("open");wt.textContent=wb.classList.contains("open")?"Why this session? (hide)":"Why this session? (coaching notes)"};
  hydrateAnatomyTargets(document.getElementById("p-today")||document);
  document.querySelectorAll("#p-today .feel-chip").forEach(chip=>{chip.onclick=()=>{const i=chip.dataset.i;document.querySelectorAll(`#p-today .feel-chip[data-i="${i}"]`).forEach(c=>c.classList.toggle("on",c===chip))}});
  const tq=document.getElementById("train-quick");if(tq)tq.onclick=async()=>{const cur=Number((S.profile.prefs||{}).quickSessionMin)||0;S.profile.prefs={...(S.profile.prefs||{}),quickSessionMin:cur>0?0:15};await persist();render();toast(cur>0?"Showing full session":"15-min mode — first two lifts")};
  const teq=document.getElementById("train-eq-toggle");if(teq)teq.onclick=async()=>{const h=((S.profile.prefs||{}).equipment||"gym")==="home";S.profile.prefs={...(S.profile.prefs||{}),equipment:h?"gym":"home"};await persist();render();toast(S.profile.prefs.equipment==="home"?"Home equipment — DB / bodyweight swaps.":"Gym equipment — barbell-friendly session.")};
  const tpt=document.getElementById("train-plates-toggle"),tpb=document.getElementById("train-plates-body");
  if(tpt&&tpb)tpt.onclick=()=>{tpb.classList.toggle("open");tpt.textContent=tpb.classList.contains("open")?"Bar load helper (hide)":"Bar load helper (in-workout)"};
  const tpo=document.getElementById("train-open-plates");
  if(tpo)tpo.onclick=()=>{if(tpb&&!tpb.classList.contains("open"))tpb.classList.add("open");document.getElementById("train-plates-card")?.scrollIntoView({behavior:"smooth",block:"start"})};
  if(sessionStorage.getItem("hw-open-plates")==="1"){sessionStorage.removeItem("hw-open-plates");if(tpb)tpb.classList.add("open");requestAnimationFrame(()=>document.getElementById("train-plates-card")?.scrollIntoView({behavior:"smooth",block:"start"}))}
  const tpCalc=document.getElementById("tw-pl-calc"),tpOut=document.getElementById("tw-pl-out");
  if(tpCalc&&tpOut)tpCalc.onclick=()=>{const total=Number(document.getElementById("tw-pl-total").value)||0,bar=Number(document.getElementById("tw-pl-bar").value)||(useMetric()?20:45);const o=runPlateCalc(total,bar);if(o.err){tpOut.textContent=o.err;return}tpOut.textContent=o.text};
  const slo=document.getElementById("set-load-overlay"),slt=document.getElementById("set-load-total"),slb=document.getElementById("set-load-bar"),sloTxt=document.getElementById("set-load-out"),slCalc=document.getElementById("set-load-calc"),slUse=document.getElementById("set-load-use"),slClose=document.getElementById("set-load-close");
  let slTargetIdx=null;
  const closeSetLoad=()=>{if(!slo)return;slo.classList.remove("open");slo.setAttribute("aria-hidden","true")};
  const openSetLoad=idx=>{
    if(!slo)return;
    slTargetIdx=idx;
    const currDisp=Number(document.getElementById("tq-w"+idx)?.value)||0;
    if(slt)slt.value=currDisp>0?String(currDisp):"";
    if(sloTxt)sloTxt.textContent="";
    slo.classList.add("open");
    slo.setAttribute("aria-hidden","false");
  };
  document.querySelectorAll(".q-load-helper").forEach(b=>b.onclick=()=>openSetLoad(+b.dataset.i));
  if(slCalc&&slt&&slb&&sloTxt)slCalc.onclick=()=>{const total=Number(slt.value)||0,bar=Number(slb.value)||(useMetric()?20:45);const o=runPlateCalc(total,bar);if(o.err){sloTxt.textContent=o.err;return}sloTxt.textContent=o.text};
  if(slUse&&slt)slUse.onclick=()=>{if(slTargetIdx===null)return;const totalIn=Number(slt.value)||0;if(totalIn<=0){toast("Enter a target load first.");return}const totalLb=useMetric()?totalIn*LB_PER_KG:totalIn;const disp=loadInputDisplayFromLb(totalLb);const w=document.getElementById("tq-w"+slTargetIdx),w2=document.getElementById("t-w"+slTargetIdx);if(w)w.value=String(disp);if(w2)w2.value=String(disp);closeSetLoad();toast("Load applied to current set.")};
  if(slClose)slClose.onclick=closeSetLoad;
  if(slo)slo.onclick=e=>{if(e.target===slo)closeSetLoad()};
  const th=document.getElementById("train-open-health");if(th)th.onclick=()=>{tab=TAB_YOU;youSub="settings";sessionStorage.setItem("hw-scroll","#settings-health");render()};
  const te=document.getElementById("train-open-ease");if(te)te.onclick=()=>{document.getElementById("train-ease-panel")?.scrollIntoView({behavior:"smooth",block:"center"});document.getElementById("train-ease-wiz")?.classList.add("show")};
  const tet=document.getElementById("train-ease-toggle"),tew=document.getElementById("train-ease-wiz");
  if(tet&&tew)tet.onclick=()=>tew.classList.add("show");
  const teg=document.getElementById("train-ease-go");
  if(teg)teg.onclick=async()=>{
    const snapA={...S.adapt},snapM=Number(S.schedule.sessionMin)||45;
    S.adapt.bench=clamp(S.adapt.bench*.95,.85,1.2);S.adapt.squat=clamp(S.adapt.squat*.95,.85,1.2);S.adapt.dead=clamp(S.adapt.dead*.95,.85,1.2);S.adapt.run=clamp(S.adapt.run*.95,.85,1.2);
    S.schedule.sessionMin=Math.min(75,(Number(S.schedule.sessionMin)||45)+5);
    await persist();render();toast("Program eased — check updated targets on your next session.",{undo:()=>{S.adapt=snapA;S.schedule.sessionMin=snapM;persist();render()}});
  };
  document.querySelectorAll("#p-today [data-sfeel]").forEach(b=>b.onclick=async()=>{
    const feel=b.dataset.sfeel;const day=activeTrainIso();if(!S.sessionFeelByDate)S.sessionFeelByDate={};
    const prev=S.sessionFeelByDate[day];
    if(prev===feel){revertSessionFeelNudge(prev);delete S.sessionFeelByDate[day];await persist();render();toast("Session feel cleared.");return}
    if(prev)revertSessionFeelNudge(prev);
    applySessionFeelNudge(feel);S.sessionFeelByDate[day]=feel;await persist();render();toast("Session feel updated.")
  });
  const sfc=document.getElementById("sfeel-clear");
  if(sfc)sfc.onclick=async()=>{const day=activeTrainIso();const prev=(S.sessionFeelByDate||{})[day];if(!prev)return;revertSessionFeelNudge(prev);delete S.sessionFeelByDate[day];await persist();render();toast("Session feel cleared.")};
  document.querySelectorAll(".session-finalize-sync").forEach(sfz=>{sfz.onclick=async()=>{const day=activeTrainIso();if(!S.sessionAdaptedByDate)S.sessionAdaptedByDate={};if(S.sessionAdaptedByDate[day]){toast("Already finalized for today. Logging new sets will re-open it.");return}hapticPulse([50]);const n=applyDayAdaptation(day);S.sessionAdaptedByDate[day]=true;celebrateFinish();await persist();render();toast(n?"Session finalized — tomorrow's loads are updated.":"Session finalized.")}});
  document.querySelectorAll(".wu-step-cb").forEach(cb=>{cb.onchange=async()=>{const day=activeTrainIso();if(!S.warmupDoneByDate)S.warmupDoneByDate={};if(!S.warmupDoneByDate[day])S.warmupDoneByDate[day]={};S.warmupDoneByDate[day][String(cb.dataset.wuIdx)]=cb.checked;await persist()}});
  document.querySelectorAll(".ex-skip").forEach(b=>b.onclick=async()=>{
    const eid=b.dataset.eid,day=activeTrainIso();if(!S.skippedEidsByDate)S.skippedEidsByDate={};const snap=JSON.parse(JSON.stringify(S.skippedEidsByDate));const skip=new Set(S.skippedEidsByDate[day]||[]);skip.add(eid);S.skippedEidsByDate[day]=[...skip];await persist();if(trainFocusIdx!==null){const p=todayPlanFiltered();if(!p.exs.length)trainFocusIdx=null;else trainFocusIdx=Math.min(trainFocusIdx,p.exs.length-1)}toast("Skipped for today",{undo:()=>{S.skippedEidsByDate=snap;persist();render()}});render()
  });
  const sr=document.getElementById("skip-restore");if(sr)sr.onclick=async()=>{const snap=JSON.parse(JSON.stringify(S.skippedEidsByDate||{})),day=activeTrainIso();if(S.skippedEidsByDate)delete S.skippedEidsByDate[day];await persist();toast("Restored today's lifts",{undo:()=>{S.skippedEidsByDate=snap;persist();render()}});render()};
  document.querySelectorAll(".ex-rest").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    const plan=todayPlanFiltered();const ex=plan.exs[i];if(!ex)return;
    const e=exById(ex.eid);
    const sec=parseRestSec(e&&e.rest);
    startRestTimer(sec,e?e.name:ex.eid);
    try{b.blur()}catch{}
  });
  document.querySelectorAll(".ex-toggle").forEach(b=>b.onclick=async()=>{const i=b.dataset.i;const body=document.getElementById("exb-"+i);const opening=!body.classList.contains("open");body.classList.toggle("open");if(opening)await loadExercisePdfPreview(i)});
  document.querySelectorAll(".ex-quick-video-toggle").forEach(btn=>{btn.onclick=()=>{const i=btn.dataset.i;const p=document.getElementById("exq-"+i);if(!p)return;const show=p.hidden;p.hidden=!show;btn.setAttribute("aria-expanded",show?"true":"false");btn.textContent=show?"Hide quick video":"Show quick video"}});
  document.querySelectorAll(".step-btn").forEach(b=>b.onclick=()=>{const t=document.getElementById(b.dataset.target);if(!t)return;const d=Number(b.dataset.delta)||0;const min=(t.min!==""?Number(t.min):-Infinity);const step=(t.step&&t.step!=="any")?Number(t.step):1;const cur=Number(t.value)||0;const next=Math.max(min,cur+d);t.value=String(step>=1?Math.round(next):+next.toFixed(2));hapticPulse(8)});
  document.querySelectorAll(".q-save").forEach(b=>b.onclick=async()=>{
    hapticKey();
    const i=+b.dataset.i;
    const result=await logSingleSetForExercise(i);
    if(!result.ok)return;
    const e=exById(result.ex.eid);
    startRestTimer(parseRestSec(e&&e.rest),result.name);
    const nextSet=Math.min(result.maxSets,result.setNo+1);
    const setLbl=document.getElementById("tq-set-lbl"+i);
    if(setLbl)setLbl.textContent=`Set ${nextSet} of ${result.maxSets}`;
    const tS=document.getElementById("t-s"+i),tR=document.getElementById("t-r"+i),tW=document.getElementById("t-w"+i),tqR=document.getElementById("tq-r"+i),tqW=document.getElementById("tq-w"+i),tqO=document.getElementById("tq-o"+i),tO=document.getElementById("t-o"+i);
    if(tS)tS.value="1";
    if(tR)tR.value=String(result.aR);
    if(tW)tW.value=String(loadInputDisplayFromLb(result.aW));
    if(tqR)tqR.value=String(result.aR);
    if(tqW)tqW.value=String(loadInputDisplayFromLb(result.aW));
    if(tO&&tqO)tO.value=tqO.value;
    if(result.setNo>=result.maxSets)toast(`${result.name}: all sets logged for today.`);
    else toast(`${result.name} saved — ready for set ${nextSet}.`);
  });
  document.querySelectorAll(".ex-copyprev").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;const plan=todayPlanFiltered();const ex=plan.exs[i];if(!ex)return;const e=exById(ex.eid);const name=e?e.name:ex.eid;const row=[...S.logs].reverse().find(l=>l.exercise===name);if(!row){toast("No previous set yet for this exercise.");return}document.getElementById("t-s"+i).value=Number(row.aS)||1;document.getElementById("t-r"+i).value=Number(row.aR)||ex.reps||1;document.getElementById("t-w"+i).value=String(loadInputDisplayFromLb(Number(row.aW)||0));const tqW=document.getElementById("tq-w"+i);if(tqW)tqW.value=String(loadInputDisplayFromLb(Number(row.aW)||0));const o=document.getElementById("t-o"+i);if(o&&row.outcome)o.value=row.outcome;hapticPulse(12);toast("Copied previous set")});
  document.querySelectorAll(".ex-save").forEach(b=>b.onclick=async()=>{const i=+b.dataset.i;const plan=todayPlanFiltered();const ex=plan.exs[i];const e=exById(ex.eid);const name=e?e.name:ex.eid;const prev=S.logs.slice();const aS=Number(document.getElementById("t-s"+i).value)||0,aR=Number(document.getElementById("t-r"+i).value)||0,aW=loadInputToLb(Number(document.getElementById("t-w"+i).value)||0);const out=(document.getElementById("t-o"+i)||{value:"ok"}).value;const makeId=()=>((typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():("log_"+Date.now()+"_"+Math.random().toString(36).slice(2,10)));const dayIso=activeTrainIso();const logWk=plan.blockWeek!=null?plan.blockWeek:getWkForDate(dayIso);const log={id:makeId(),date:dayIso,week:logWk,exercise:name,tS:ex.sets,tR:ex.reps,tW:ex.target,aS,aR,aW,liftFeel:readLiftFeel(i),outcome:out,score:1};log.score=calcLogScore(log);S.logs.push(log);S.logs=S.logs.slice(-1000);S.lastLiftByEid[ex.eid]=aW;if(!S.sessionAdaptedByDate)S.sessionAdaptedByDate={};delete S.sessionAdaptedByDate[dayIso];resolveCatchUpQueueAfterLog(dayIso);await persist();const vol=aS*aR*aW;lastLogSummary={name:name,streak:getStreak(),vol:vol>0?vol:"",next:nextScheduledDayTeaser()};let toastMsg=`${name} saved`;if(trainFocusIdx!==null){const ni=i;const p2=todayPlanFiltered();if(ni===trainFocusIdx){if(trainFocusIdx<p2.exs.length-1){trainFocusIdx++;toastMsg=`${name} saved — next lift`}else{trainFocusIdx=null;toastMsg=`${name} saved — session complete`;celebrateFinish()}}}hapticKey();toast(toastMsg,{undo:()=>{S.logs=prev;delete S.lastLiftByEid[ex.eid];lastLogSummary=null;persist();render()}});render()});
  const mm=document.getElementById("miss-move"),ms=document.getElementById("miss-skip"),mp=document.getElementById("miss-pick"),ml=document.getElementById("miss-later"),cu=document.getElementById("catchup-add-today"),tas=document.getElementById("train-adjust-schedule");
  if(mm)mm.onclick=async()=>{const m=oldestUnresolvedMiss();if(!m)return;const pl=rollingPlanForDate(m.date);const due=nextTrainingIso(m.date);if(!due){toast("Could not find a next training day.");return}const a=ensureScheduleAdjust();a.catchUpQueue.push({missedIso:m.date,slot:pl.slot,blockWeek:pl.blockWeek,globalIdx:pl.globalIdx,dueIso:due});a.missChoices[m.date]={choice:"move"};await persist();render();toast(`Queued for ${DAYS[parseIsoNoon(due).getDay()]} (${due}).`)};
  if(ms)ms.onclick=async()=>{const m=oldestUnresolvedMiss();if(!m)return;ensureScheduleAdjust().missChoices[m.date]={choice:"skip"};await persist();render();toast("Session skipped for this block week.")};
  if(mp)mp.onclick=async()=>{const m=oldestUnresolvedMiss();if(!m)return;const def=nextTrainingIso(iso())||iso();const raw=prompt("Catch-up on which date? (YYYY-MM-DD)",def);if(raw==null)return;const nd=raw.trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(nd)){toast("Use YYYY-MM-DD.");return}if(Number.isNaN(parseIsoNoon(nd).getTime())){toast("Invalid date.");return}const pl=rollingPlanForDate(m.date);const a=ensureScheduleAdjust();a.catchUpQueue.push({missedIso:m.date,slot:pl.slot,blockWeek:pl.blockWeek,globalIdx:pl.globalIdx,dueIso:nd});a.missChoices[m.date]={choice:"pick",pickIso:nd};await persist();render();toast("Catch-up scheduled for "+nd+".")};
  if(ml)ml.onclick=async()=>{const m=oldestUnresolvedMiss();if(!m)return;ensureScheduleAdjust().missSnoozed[m.date]=true;await persist();render();toast("Okay — we won't nag. Use Adjust schedule to revisit.")};
  if(cu)cu.onclick=async()=>{ensureScheduleAdjust().extraTrainingIso=iso();await persist();render();toast("Catch-up added to today.")};
  if(tas)tas.onclick=async()=>{const a=ensureScheduleAdjust();a.missSnoozed={};await persist();render();toast("Schedule choices unlocked for missed days.")};
  const closeExSwap=()=>{const ov=document.getElementById("ex-swap-overlay");if(ov){ov.classList.remove("open");ov.setAttribute("aria-hidden","true")}};
  const openExSwap=origEid=>{
    const ov=document.getElementById("ex-swap-overlay"),list=document.getElementById("ex-swap-list");
    if(!ov||!list||!origEid)return;
    const plan=todayPlanFiltered();
    const row=plan.exs.find(x=>(x.originalEid||x.eid)===origEid);
    const curEid=row?row.eid:null;
    const day=activeTrainIso();
    const curMap=(S.exerciseSwapsByDate&&S.exerciseSwapsByDate[day])||{};
    const hasSwap=!!curMap[origEid];
    const alts=similarExerciseAlternatives(origEid);
    let html="";
    if(hasSwap)html+=`<button type="button" class="btn btn-secondary-solid btn-block ex-swap-pick" data-orig="${origEid}" data-reset="1">Use programmed exercise</button>`;
    for(const x of alts){
      if(x.id===curEid)continue;
      if(x.id===origEid&&!hasSwap)continue;
      html+=`<button type="button" class="btn btn-ghost btn-block ex-swap-pick" data-orig="${origEid}" data-eid="${x.id}">${x.name}</button>`;
    }
    if(!html)html=`<p style="font-size:12px;color:var(--text2)">No close matches in this catalog. Try the equipment toggle or Settings.</p>`;
    list.innerHTML=html;
    ov.classList.add("open");
    ov.setAttribute("aria-hidden","false");
    list.querySelectorAll(".ex-swap-pick").forEach(btn=>{btn.onclick=async()=>{
      const o=btn.dataset.orig,reset=btn.dataset.reset==="1",e=btn.dataset.eid;
      if(!S.exerciseSwapsByDate)S.exerciseSwapsByDate={};
      const snap=JSON.parse(JSON.stringify(S.exerciseSwapsByDate));
      const bucket={...(S.exerciseSwapsByDate[day]||{})};
      if(reset)delete bucket[o];else bucket[o]=e;
      if(Object.keys(bucket).length)S.exerciseSwapsByDate[day]=bucket;else delete S.exerciseSwapsByDate[day];
      closeExSwap();
      await persist();
      if(trainFocusIdx!==null){const p=todayPlanFiltered();trainFocusIdx=Math.min(trainFocusIdx,Math.max(0,p.exs.length-1))}
      render();
      toast(reset?"Restored programmed lift":"Exercise swapped",{undo:()=>{S.exerciseSwapsByDate=snap;persist();render()}});
    }});
  };
  const exOv=document.getElementById("ex-swap-overlay");
  if(exOv)exOv.onclick=e=>{if(e.target===exOv)closeExSwap()};
  const exSc=document.getElementById("ex-swap-close");if(exSc)exSc.onclick=closeExSwap;
  document.querySelectorAll(".ex-swap").forEach(b=>{b.onclick=()=>openExSwap(b.dataset.orig)});
  const fvp=document.querySelector(".focus-session-viewport");
  if(fvp&&trainFocusIdx!==null){
    let sx=null;
    const blockSel="button,a,input,select,textarea,label,iframe,.ex-log-grid,.quick-log-row,.feel-chips";
    fvp.addEventListener("pointerdown",e=>{if(!e.isPrimary)return;const t=e.target;if(t.closest&&t.closest(blockSel))return;sx=e.clientX},{passive:true});
    fvp.addEventListener("pointerup",e=>{
      if(!e.isPrimary||sx===null)return;
      const d=e.clientX-sx;
      sx=null;
      if(Math.abs(d)<50)return;
      const p=todayPlanFiltered();
      if(!p.exs.length)return;
      if(d<0&&trainFocusIdx<p.exs.length-1){trainFocusIdx++;render()}
      else if(d>0&&trainFocusIdx>0){trainFocusIdx--;render()}
    },{passive:true});
    fvp.addEventListener("pointercancel",()=>{sx=null},{passive:true});
  }
}

// ═══════════════════════════════════════════════════════════
//  RENDER — LOG
// ═══════════════════════════════════════════════════════════
function renderLog(){
  const dObj=new Date(logDate+"T12:00:00");const dayIdx=dObj.getDay();const wk=getWkForDate(logDate);const plan=rollingPlanForDate(logDate);
  const sessLbl=plan.sessionInWeek&&plan.sessionsPerWeek?` · Sess ${plan.sessionInWeek}/${plan.sessionsPerWeek}`:"";
  const allDates=[...new Set(S.logs.map(l=>l.date))].sort().reverse();
  const qRaw=logHistoryFilter.trim().toLowerCase();
  const filterDay=(d,dl)=>{if(!qRaw)return true;if(d.toLowerCase().includes(qRaw))return true;return dl.some(l=>String(l.exercise||"").toLowerCase().includes(qRaw)||String(l.note||"").toLowerCase().includes(qRaw))};
  const filteredDates=allDates.filter(d=>filterDay(d,S.logs.filter(l=>l.date===d)));
  const showDates=filteredDates.slice(0,80);
  const avgScoreTitle="Average log score vs plan for this day (volume and estimated strength vs prescription). 1.0 ≈ on target; higher = you outperformed; lower = lighter loads or a tough day.";
  const lineHtml=l=>{const txt=`${l.exercise}: ${l.aS}×${l.aR} @ ${formatLoadLbText(l.aW)}${l.note?" — "+l.note:""}${l.outcome==="fail"?" · failed rep target":l.outcome==="time"?" · time-capped":""}`;return`<div class="log-detail log-detail-row"><span>${txt}</span><span class="row log-line-actions" style="gap:4px;flex-shrink:0"><button type="button" class="btn btn-sm btn-ghost log-move-line" data-id="${l.id}" style="padding:4px 8px;font-size:10px;color:var(--ice)" aria-label="Move ${l.exercise} entry">Move</button><button type="button" class="btn btn-sm btn-ghost log-del-line" data-id="${l.id}" style="padding:4px 8px;font-size:10px;color:var(--red)" aria-label="Remove ${l.exercise} set">Remove</button></span></div>`};
  const historyBlocks=allDates.length?(showDates.length?showDates.map(d=>{const dl=S.logs.filter(l=>l.date===d);const avg=dl.reduce((s,l)=>s+(l.score||1),0)/dl.length;const cls=avg>=1.02?"score-good":avg>=.9?"score-ok":"score-low";const dd=new Date(d+"T12:00:00");return`<details class="log-entry" data-d="${d}"><summary class="log-entry-summary"><span class="log-sum-lead"><span class="log-sum-chev" aria-hidden="true">▸</span><span class="log-date">${d} (${DAYS[dd.getDay()]})</span><span class="log-tap-hint">Tap for sets</span></span><span class="log-sum-meta"><span class="log-score ${cls}" title="${avgScoreTitle}"><span class="log-score-prefix">Avg</span> ${avg.toFixed(2)}</span><span class="log-avg-hint" title="${avgScoreTitle}">intensity vs plan</span></span><span class="row log-history-actions" style="gap:6px"><button type="button" class="btn btn-sm btn-ghost log-edit" data-d="${d}" style="padding:4px 8px;font-size:10px;color:var(--ice)" aria-label="Edit log for ${d}">Edit log</button><button type="button" class="btn btn-sm btn-ghost log-del" data-d="${d}" style="padding:4px 8px;font-size:10px;color:var(--red)" aria-label="Delete all logs for ${d}">✕</button></span></summary><div class="log-entry-expanded">${dl.map(lineHtml).join("")}</div></details>`}).join(""):`<p style="color:var(--text3);font-size:12px">No days match your search.</p>`):`<p style="color:var(--text3);font-size:12px">No logs yet.</p>`;
  const filterMeta=qRaw&&allDates.length?`<p class="log-history-meta">${showDates.length===filteredDates.length?`Showing ${showDates.length} day${showDates.length!==1?"s":""}`:`Showing ${showDates.length} of ${filteredDates.length} matching days`}${filteredDates.length<allDates.length?` (${allDates.length} total)`:""}</p>`:"";
  const editingOther=logDate!==iso();
  const editBanner=editingOther?`<div class="log-edit-banner session-banner" role="status"><b style="color:var(--text)">Editing mode.</b> Showing <b>${logDate}</b> (${DAYS[dayIdx]}). Update the table and save — or pick another date.</div>`:"";
  return`<div class="section">${editBanner}<div class="card"><div class="card-h"><h2>Session report</h2><span class="badge badge-ice">Updates loads</span></div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:12px">Log actual performance. The program recalculates all future workouts from your reports.</p>
    <div class="grid2" style="max-width:400px;margin-bottom:14px"><div><label>Date</label><input type="date" id="log-date" value="${logDate}"></div><div><label>Day / training week</label><input disabled value="${DAYS[dayIdx]} — Wk ${wk}${sessLbl}"></div></div>
    ${plan.exs.length?`<div class="table-wrap"><table class="log-report-table"><thead><tr><th>Exercise</th><th>Target</th><th>Sets</th><th>Reps</th><th>Load (${massUnitLabel()})</th><th>Notes</th></tr></thead><tbody>${plan.exs.map((ex,i)=>{const e=exById(ex.eid);const w0=typeof ex.target==="number"&&ex.target>0?loadInputDisplayFromLb(ex.target):0;return`<tr><td style="color:var(--text);font-weight:600">${e?e.name:ex.eid}</td><td style="white-space:nowrap">${formatPrescribedRx(ex)}</td><td><input type="number" class="input-sm" id="lg-s${i}" value="${ex.sets}" min="1" style="width:55px"></td><td><input type="number" class="input-sm" id="lg-r${i}" value="${ex.reps}" min="1" style="width:55px"></td><td><input type="number" class="input-sm" id="lg-w${i}" value="${w0}" min="0" step="any" style="width:70px"></td><td><input type="text" class="input-sm" id="lg-n${i}" placeholder="optional" style="width:100px"></td></tr>`}).join("")}</tbody></table></div>
    <button class="btn btn-mint btn-block" id="log-save" style="margin-top:12px">Save report</button>`:`<div style="padding:16px;color:var(--text3);text-align:center">Recovery day.</div>`}
  </div></div>
  <div class="section"><details class="settings-fold log-history-fold" id="log-history-fold" open><summary class="log-history-summary"><span style="font-weight:600;font-size:14px">History</span><span class="badge badge-ice">${S.logs.length} entries</span></summary>
    <div class="settings-fold-body"><label class="log-history-search"><span class="log-history-search-lbl">Search</span><input type="search" id="log-history-q" placeholder="Exercise or date (YYYY-MM-DD)…" autocomplete="off" aria-label="Search workout history"></label>${filterMeta}${historyBlocks}
    </div>
  </details></div>`;
}
function bindLog(){
  const di=document.getElementById("log-date");if(di)di.onchange=()=>{logDate=di.value;render()};
  const lq=document.getElementById("log-history-q");
  if(lq){
    lq.value=logHistoryFilter;
    lq.oninput=()=>{logHistoryFilter=lq.value;sessionStorage.setItem("hw-refocus-log-q","1");render()};
    if(sessionStorage.getItem("hw-refocus-log-q")==="1"){
      sessionStorage.removeItem("hw-refocus-log-q");
      requestAnimationFrame(()=>{const el=document.getElementById("log-history-q");if(!el)return;el.focus();const n=el.value.length;try{el.setSelectionRange(n,n)}catch{}});
    }
  }
  document.querySelectorAll(".log-history-actions").forEach(el=>{el.addEventListener("click",e=>e.stopPropagation());el.addEventListener("mousedown",e=>e.stopPropagation())});
  const sb=document.getElementById("log-save");if(sb)sb.onclick=async()=>{hapticKey();const wk=getWkForDate(logDate);const plan=rollingPlanForDate(logDate);let c=0;plan.exs.forEach((ex,i)=>{const e=exById(ex.eid);const name=e?e.name:ex.eid;S.logs=S.logs.filter(l=>!(l.date===logDate&&l.exercise===name));const aS=Number(document.getElementById("lg-s"+i).value)||0,aR=Number(document.getElementById("lg-r"+i).value)||0,aW=loadInputToLb(Number(document.getElementById("lg-w"+i).value)||0);if(aS>0&&aR>0){const makeId=()=>((typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():("log_"+Date.now()+"_"+Math.random().toString(36).slice(2,10)));const log={id:makeId(),date:logDate,week:plan.blockWeek!=null?plan.blockWeek:wk,exercise:name,tS:ex.sets,tR:ex.reps,tW:ex.target,aS,aR,aW,note:document.getElementById("lg-n"+i).value||"",outcome:"ok",score:1};log.score=calcLogScore(log);S.logs.push(log);c++}});S.logs=S.logs.slice(-1000);if(c>0)resolveCatchUpQueueAfterLog(logDate);if(!S.sessionAdaptedByDate)S.sessionAdaptedByDate={};delete S.sessionAdaptedByDate[logDate];const n=applyDayAdaptation(logDate);S.sessionAdaptedByDate[logDate]=true;await persist();render();toast(`${c} exercises saved/updated · adaptation ${n?"applied":"saved"}`)};
  document.querySelectorAll(".log-edit").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();logDate=b.dataset.d;render();toast("Editing "+logDate+" — update the table, then Save report.")});
  document.querySelectorAll(".log-del").forEach(b=>b.onclick=async e=>{e.preventDefault();e.stopPropagation();const ds=b.dataset.d;if(!confirm("Delete logs for "+ds+"?"))return;const prev=S.logs.slice();S.logs=S.logs.filter(l=>l.date!==ds);await persist();render();toast("Removed "+ds,{undo:()=>{S.logs=prev;persist();render()}})});
  document.querySelectorAll(".log-move-line").forEach(b=>b.onclick=async e=>{e.stopPropagation();const id=b.dataset.id;const log=S.logs.find(x=>x.id===id);if(!log)return;const nd=prompt("Move this entry to date (YYYY-MM-DD):",log.date);if(nd==null)return;const nd2=nd.trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(nd2)){toast("Use YYYY-MM-DD.");return}if(Number.isNaN(new Date(nd2+"T12:00:00").getTime())){toast("Invalid date.");return}const oldDate=log.date;log.date=nd2;log.week=getWkForDate(nd2);if(!S.sessionAdaptedByDate)S.sessionAdaptedByDate={};delete S.sessionAdaptedByDate[oldDate];delete S.sessionAdaptedByDate[nd2];await persist();render();toast("Entry moved to "+nd2)});
  document.querySelectorAll(".log-del-line").forEach(b=>b.onclick=async e=>{e.stopPropagation();const id=b.dataset.id;if(!confirm("Remove this logged set?"))return;const prev=S.logs.slice();const rm=S.logs.find(x=>x.id===id);S.logs=S.logs.filter(x=>x.id!==id);if(rm&&S.sessionAdaptedByDate)delete S.sessionAdaptedByDate[rm.date];await persist();render();toast("Removed",{undo:()=>{S.logs=prev;persist();render()}})});
}

// ═══════════════════════════════════════════════════════════
//  RENDER — PROGRAM (all 13 weeks)
// ═══════════════════════════════════════════════════════════
function planAnchorSummaryHtml(short){
  autoWeek();
  const a=firstTrainingIsoOnOrAfter(S.program.start);
  if(!a)return`<div class="card plan-anchor-card section" style="border-left:3px solid var(--gold)"><div style="font-size:12px;color:var(--text2)">${short?"Add your <b style=\"color:var(--text)\">program start date</b> in Settings.":"Add a valid <b style=\"color:var(--text)\">program start date</b> under Settings → Account &amp; plan so Week 1 lines up with your real calendar."}</div></div>`;
  const d=parseIsoNoon(a);
  const human=d.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
  if(short)return`<div class="card plan-anchor-card section" style="border-left:3px solid var(--ice)"><div style="font-size:13px;color:var(--text2);line-height:1.45">Your first session lands on <b style="color:var(--text)">${human}</b>. Tap a week below — real dates, not a spreadsheet.</div></div>`;
  const longInner=`<div style="font-size:12px;color:var(--text2);line-height:1.5"><b style="color:var(--text)">How this block is ordered:</b> Session 1 is your first scheduled train day on or after <b style="color:var(--text)">${S.program.start}</b> — that lands on <b style="color:var(--text)">${human}</b>. Each week lists those workouts by <b style="color:var(--text)">actual dates</b> (Wed → Fri → Mon…), not a Monday-first calendar. If you still see only “Monday / Wednesday…” with no dates, pull to refresh or reopen the app once to load the latest version.</div>`;
  return`<details class="plan-intro-fold card section"><summary class="plan-intro-sum">How this block lines up on your calendar</summary><div class="plan-intro-body">${longInner}</div></details>`;
}
function renderProgram(){
  autoWeek();const cur=S.program.week;if(expandedWeek===null)expandedWeek=cur;
  const compact=planCompactOn();
  const wSimple=useWomenSoftUi();
  const hm=weeklyExpectedChanges();
  const ws=womenProgramSummary();
  const planToggleLbl=compact?(wSimple?"Show more detail":"Show all exercises"):"Simpler view";
  return`<div class="plan-root"><div class="section"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px"><h2 style="font-size:18px;font-weight:600;letter-spacing:-0.02em">Thirteen-week block</h2><div class="row" style="gap:8px;align-items:center"><span style="font-size:12px;color:var(--text3)">Loads follow your logs</span><button type="button" class="btn btn-sm btn-ghost" id="plan-compact-toggle">${planToggleLbl}</button></div></div>
    <div class="plan-context-card card section"><div class="plan-context-inner"><div><div class="plan-context-kicker">You are here</div><div class="plan-context-title">Week ${cur} of 13 · ${phaseName(cur)}</div><div class="plan-context-sub">${planSlotsN()} session${planSlotsN()!==1?"s":""} per training week · bar loads follow your logs</div></div><button type="button" class="btn btn-secondary-solid btn-sm" id="plan-jump-current">Open this week</button></div></div>
    ${planAnchorSummaryHtml(wSimple)}
    ${ws?`<div class="card plan-hide-women" style="margin-bottom:10px;border-left:3px solid var(--mint)"><div class="card-h"><h2>Women's Program Summary</h2><span class="badge badge-mint">${ws.label}</span></div><div style="font-size:12px;color:var(--text2);margin-bottom:8px">Baseline: <b style="color:var(--text)">${ws.tier}</b> · Life stage: <b style="color:var(--text)">${ws.life}</b> · Equipment: <b style="color:var(--text)">${ws.eq}</b> · Session style: <b style="color:var(--text)">${ws.style}</b></div><div style="display:grid;gap:4px">${ws.tracks.map(t=>`<div style="font-size:11px;color:var(--text2)">• ${t}</div>`).join("")}</div>${ws.fa.length?`<div style="margin-top:8px;font-size:10px;color:var(--text3)">Goals: ${ws.fa.join(" · ")}</div>`:""}</div>`:""}
    <div class="card plan-hide-women" style="margin-bottom:10px"><div class="card-h"><h2>Expected Changes Heatmap</h2></div><div class="row" style="gap:14px"><div style="font-size:11px;color:var(--text2)">Glutes <b style="color:var(--mint)">${hm.glutes}%</b></div><div style="font-size:11px;color:var(--text2)">Core <b style="color:var(--mint)">${hm.core}%</b></div><div style="font-size:11px;color:var(--text2)">Back <b style="color:var(--mint)">${hm.back}%</b></div><div style="font-size:11px;color:var(--text2)">Posture <b style="color:var(--mint)">${hm.posture}%</b></div></div></div>
    <div class="plan-timeline-wrap plan-hide-women"><div class="timeline" role="list" aria-label="Training weeks 1 to 13">${Array.from({length:13},(_,i)=>{const w=i+1;return`<div class="tl-wk ${phaseClass(w)} ${w===cur?"current":""} ${weekHasLogs(w)?"complete":""}" data-w="${w}" role="listitem" title="Week ${w} · ${phaseName(w)}${w===4||w===8?" · Deload":""}">${w}</div>`}).join("")}</div><p class="plan-timeline-hint">Tap a number to expand that week · color = phase (legend below).</p></div>
    <p class="plan-hide-women" style="font-size:11px;color:var(--text3);margin:8px 0 0;line-height:1.45">Weeks are <b style="color:var(--text2)">training weeks</b> (${planSlotsN()} session${planSlotsN()!==1?"s":""} each, in order from your start date — not Mon–Sun buckets).</p>
    <details class="plan-phase-legend card section plan-hide-women"><summary class="plan-phase-legend-sum">How phase colors work</summary><p class="plan-phase-legend-note">Weeks <b>4</b> and <b>8</b> are deloads inside Hypertrophy and Strength. Week <b>13</b> is test / consolidation.</p><ul class="plan-phase-legend-list"><li><span class="plan-phase-swatch tl-wk phase-hyp" aria-hidden="true"></span> Hypertrophy — weeks 1–4</li><li><span class="plan-phase-swatch tl-wk phase-str" aria-hidden="true"></span> Strength — weeks 5–8</li><li><span class="plan-phase-swatch tl-wk phase-peak" aria-hidden="true"></span> Peak — weeks 9–12</li><li><span class="plan-phase-swatch tl-wk phase-test" aria-hidden="true"></span> Test — week 13</li></ul></details>
    ${nextTrainingDotsHtml(8)}</div>
  <div class="stack" id="pw-list">${Array.from({length:13},(_,i)=>{const w=i+1;const isOpen=w===expandedWeek;
    const tDates=trainingDatesInBlockWeek(w);
    const logCount=tDates.length?S.logs.filter(l=>tDates.includes(l.date)).length:0;
    let bodyHTML="";
    if(isOpen){
      if(tDates.length){
        bodyHTML=rhythmStripHtmlForWeek(w)+tDates.map((ds,si)=>{const p=rollingPlanForDate(ds);const dow=parseIsoNoon(ds).getDay();const isToday=ds===iso()&&w===cur;const dateLong=parseIsoNoon(ds).toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric",year:"numeric"});const mins=estimateDayMinutes(p);const head=planFocusHeadline(p.focus);return`<div class="pw-day ${isToday?"pw-day-today":""}" style="border-left:3px solid ${phaseColor(w)};padding-left:10px;border-radius:8px;box-sizing:border-box"><div class="pw-day-label"><span class="pw-date-line" style="color:${phaseColor(w)}">${dateLong}</span> <span class="pw-day-dow">${DAYS[dow]}</span> <span class="pw-meta-muted">· Sess ${si+1}/${tDates.length}</span>${isToday?` <span class="badge badge-ice pw-today-badge">Today</span>`:""}${mins>0?` <span class="pw-est-min" title="Rough session length">~${mins} min</span>`:""} <span class="badge pw-focus-badge" title="Session theme">${escPlanChip(head)}</span></div>${p.exs.length?p.exs.map(ex=>{const e=exById(ex.eid);return`<div class="pw-ex-row pw-ex-drag" draggable="true" data-date="${ds}" data-eid="${ex.eid}"><span class="pw-ex-drag-hint" aria-hidden="true" title="Drag to reorder">⋮⋮</span><span class="pw-phase-tag ${phaseClass(w)}" title="${phaseName(w)}">${phaseAbbrev(w)}</span><div class="pw-ex-main"><b>${e?e.name:ex.eid}</b><span>${formatPrescribedRx(ex)}</span></div></div>`}).join(""):`<div class="pw-ex-row pw-ex-recovery"><span class="pw-phase-tag ${phaseClass(w)}" title="${phaseName(w)}">${phaseAbbrev(w)}</span><span>Recovery — walk or easy mobility</span></div>`}${p.finisher?`<div class="pw-finisher-block" role="group" aria-label="Finisher"><span class="pw-finisher-label">Finisher</span><div class="pw-finisher-txt">${escPlanChip(p.finisher)}</div></div>`:""}</div>`}).join("");
      }else bodyHTML=`<div class="pw-ex-row" style="color:var(--text3)">No sessions mapped (check program start & schedule).</div>`;
    }
    return`<div class="pw-card ${w===cur?"pw-current":""}"><div class="pw-head" data-w="${w}"><span class="arrow ${isOpen?"open":""}">▸</span><span style="font-weight:700;font-size:13px">Week ${w}</span><span class="badge ${phaseClass(w).replace("phase-","badge-")}" style="font-size:9px">${phaseName(w)}${w===4||w===8?" · Deload":""}</span>${w===cur?`<span class="badge badge-ice" style="font-size:9px">This training week</span>`:""}<span style="font-size:10px;color:var(--text3);margin-left:auto">${logCount?logCount+" entries":"scheduled"}</span></div>
    <div class="pw-body ${isOpen?"open":""}">${bodyHTML}</div></div>`}).join("")}</div></div>`;
}
function bindProgram(){
  const pc=document.getElementById("plan-compact-toggle");
  if(pc)pc.onclick=()=>{
    if(useWomenSoftUi()){
      const on=sessionStorage.getItem("hw-plan-compact")!=="0";
      sessionStorage.setItem("hw-plan-compact",on?"0":"1");
    }else sessionStorage.setItem("hw-plan-compact",sessionStorage.getItem("hw-plan-compact")==="1"?"0":"1");
    render();
  };
  const pjc=document.getElementById("plan-jump-current");
  if(pjc)pjc.onclick=()=>{autoWeek();expandedWeek=S.program.week;sessionStorage.setItem("hw-plan-scroll-wk",String(S.program.week));render()};
  document.querySelectorAll(".tl-wk").forEach(el=>el.onclick=()=>{expandedWeek=+el.dataset.w;render()});
  document.querySelectorAll(".pw-head").forEach(el=>el.onclick=()=>{const w=+el.dataset.w;expandedWeek=expandedWeek===w?null:w;render()});
  bindPlanExerciseDrag();
}
function bindPlanExerciseDrag(){
  const root=document.getElementById("pw-list");
  if(!root)return;
  let dragEid=null,dragDate=null;
  root.addEventListener("dragstart",e=>{
    const row=e.target.closest(".pw-ex-drag");
    if(!row)return;
    dragEid=row.dataset.eid;
    dragDate=row.dataset.date;
    try{e.dataTransfer.setData("text/plain",dragEid||"");e.dataTransfer.effectAllowed="move"}catch{}
    row.classList.add("pw-ex-dragging");
  });
  root.addEventListener("dragend",()=>{
    root.querySelectorAll(".pw-ex-dragging").forEach(x=>x.classList.remove("pw-ex-dragging"));
    root.querySelectorAll(".pw-ex-drop-over").forEach(x=>x.classList.remove("pw-ex-drop-over"));
    dragEid=null;dragDate=null;
  });
  root.addEventListener("dragover",e=>{
    const row=e.target.closest(".pw-ex-drag");
    if(!row||!dragDate||row.dataset.date!==dragDate)return;
    e.preventDefault();
    try{e.dataTransfer.dropEffect="move"}catch{}
    root.querySelectorAll(".pw-ex-drop-over").forEach(x=>{if(x!==row)x.classList.remove("pw-ex-drop-over")});
    row.classList.add("pw-ex-drop-over");
  });
  root.addEventListener("dragleave",e=>{
    const row=e.target.closest(".pw-ex-drag");
    if(row&&e.relatedTarget&&typeof row.contains==="function"&&!row.contains(e.relatedTarget))row.classList.remove("pw-ex-drop-over");
  });
  root.addEventListener("drop",async e=>{
    const targetRow=e.target.closest(".pw-ex-drag");
    if(!targetRow||!dragDate||targetRow.dataset.date!==dragDate)return;
    e.preventDefault();
    const dateIso=dragDate;
    const fromEid=dragEid;
    const toEid=targetRow.dataset.eid;
    targetRow.classList.remove("pw-ex-drop-over");
    if(!fromEid||!toEid||fromEid===toEid)return;
    const plan=rollingPlanForDate(dateIso);
    const order=(plan.exs||[]).map(ex=>ex.eid);
    const i=order.indexOf(fromEid),j=order.indexOf(toEid);
    if(i<0||j<0)return;
    order.splice(i,1);
    order.splice(j,0,fromEid);
    if(!S.exerciseOrderByDate)S.exerciseOrderByDate={};
    S.exerciseOrderByDate[dateIso]=order;
    await persist();
    render();
    toast("Exercise order updated for this session");
  });
}

// ═══════════════════════════════════════════════════════════
//  RENDER — SETTINGS
// ═══════════════════════════════════════════════════════════
function renderSettings(){
  const isFemale=S.profile.sex==="female";
  const run4Disp=S.profile.run4mi>0?mmss(S.profile.run4mi):"";
  const wmOpts=[["auto","Auto"],["hourglass","Hourglass"],["glute_shelf","Glute Shelf"],["posture","Posture"],["pilates","Pilates"],["home","Home Sculpt"]];
  const wmSel=(S.profile.prefs||{}).womenMode||"auto";
  return`<label class="settings-search"><span style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px">Search settings</span><input type="search" id="s-filter" placeholder="Try: bench, export, steps, bar…" autocomplete="off" aria-label="Filter settings sections"></label>
  <details class="settings-fold settings-section settings-onboard-banner" data-k="help guide tips get started how overview train plan you log sync account cloud save ease heavy program" open>
    <summary>How to get the most from this app</summary>
    <div class="settings-fold-body">
      <ul style="font-size:12px;color:var(--text2);margin:0;padding-left:18px;line-height:1.55">
        <li><b style="color:var(--text)">Stay signed in</b> — your program syncs to your account; use the same login on every device.</li>
        <li><b style="color:var(--text)">Log after you train</b> — entries tune adaptation so prescribed loads stay realistic.</li>
        <li><b style="color:var(--text)">Train</b> — Session is your in-gym checklist; Log is for entering what you did (any date). If the block feels heavy, use <b style="color:var(--text)">Program feels too heavy?</b> on Train after your lifts (not buried in Settings).</li>
        <li><b style="color:var(--text)">Plan</b> — 13 training weeks (sessions in order from your start date, not Mon–Sun grids). If the Plan looks like plain weekdays with no dates, update the app (reopen or clear site data) once.</li>
        <li><b style="color:var(--text)">You</b> — Overview for streaks and goals; Settings for profile, backup, and tools. How-tos and videos are on each exercise under Train.</li>
      </ul>
    </div>
  </details>
  <details class="settings-fold settings-section" data-k="profile strength bench squat deadlift weight measurement body sex women life equipment style appearance theme light dark save account email firebase sign plan switch onboard offline sync program start date calendar block adaptation reset advanced multiplier" open>
    <summary>Training profile &amp; account</summary>
    <div class="settings-fold-body"><div class="grid2 section" style="margin-bottom:0">
    <div class="card settings-section" data-k="profile strength bench squat deadlift weight measurement body sex women life equipment style appearance theme light dark save" id="settings-profile"><div class="card-h"><h2>Training & profile</h2></div>
      <div class="grid3 settings-1rm-grid"><div><label>Bench 1RM (${massUnitLabel()})</label><input id="s-b" type="number" step="any" value="${massLbToField(S.profile.bench1RM)}"></div><div><label>Squat 1RM (${massUnitLabel()})</label><input id="s-sq" type="number" step="any" value="${massLbToField(S.profile.squat1RM)}"></div><div><label>Deadlift 1RM (${massUnitLabel()})</label><input id="s-dl" type="number" step="any" value="${massLbToField(S.profile.dead1RM)}"></div></div>
      <div class="grid3" style="margin-top:8px"><div><label>Weight (${massUnitLabel()})</label><input id="s-wt" type="number" step="any" value="${massLbToField(S.profile.weight)}"></div><div><label>Goal Wt (${massUnitLabel()})</label><input id="s-gw" type="number" step="any" value="${massLbToField(S.profile.goalWt)}"></div><div><label>4mi pace</label><input id="s-run" class="input-mmss" value="${run4Disp}" placeholder="35:00" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Four mile time as mm:ss"></div></div>
      <div class="grid3" style="margin-top:8px"><div><label>Waist (in)</label><input id="s-waist" type="number" step="0.1" value="${S.profile.waist||""}"></div><div><label>Hips (in)</label><input id="s-hips" type="number" step="0.1" value="${S.profile.hips||""}"></div><div><label>Shoulders (in)</label><input id="s-shoulders" type="number" step="0.1" value="${S.profile.shoulders||""}"></div></div>
      <div class="grid3" style="margin-top:8px"><div><label>Body Fat %</label><input id="s-bf" type="number" step="0.1" value="${S.profile.bodyFat||""}"></div><div></div><div></div></div>
      ${isFemale?`<div class="grid3 settings-sex-row" style="margin-top:8px"><div><label>Sex</label><select id="s-sex"><option value="male" ${S.profile.sex==="male"?"selected":""}>Male</option><option value="female" ${S.profile.sex==="female"?"selected":""}>Female</option></select></div><div><label>Life Stage</label><select id="s-life"><option value="general" ${((S.profile.prefs||{}).lifeStage||"general")==="general"?"selected":""}>General</option><option value="pregnancy" ${((S.profile.prefs||{}).lifeStage||"")==="pregnancy"?"selected":""}>Pregnancy</option><option value="postpartum" ${((S.profile.prefs||{}).lifeStage||"")==="postpartum"?"selected":""}>Postpartum</option></select></div><div><label>Women's Mode</label><select id="s-wm">${wmOpts.map(([v,l])=>`<option value="${v}" ${wmSel===v?"selected":""}>${l}</option>`).join("")}</select></div></div>`:`<div class="grid2 settings-sex-row" style="margin-top:8px"><div><label>Sex</label><select id="s-sex"><option value="male" ${S.profile.sex==="male"?"selected":""}>Male</option><option value="female" ${S.profile.sex==="female"?"selected":""}>Female</option></select></div><div><label>Life Stage</label><select id="s-life"><option value="general" ${((S.profile.prefs||{}).lifeStage||"general")==="general"?"selected":""}>General</option><option value="pregnancy" ${((S.profile.prefs||{}).lifeStage||"")==="pregnancy"?"selected":""}>Pregnancy</option><option value="postpartum" ${((S.profile.prefs||{}).lifeStage||"")==="postpartum"?"selected":""}>Postpartum</option></select></div></div>`}
      <div class="grid2" style="margin-top:8px"><div><label>Equipment</label><select id="s-eq"><option value="gym" ${((S.profile.prefs||{}).equipment||"gym")==="gym"?"selected":""}>Gym</option><option value="home" ${((S.profile.prefs||{}).equipment||"")==="home"?"selected":""}>Home</option></select></div><div><label>Session Style</label><select id="s-style"><option value="balanced" ${((S.profile.prefs||{}).style||"balanced")==="balanced"?"selected":""}>Balanced</option><option value="burner" ${((S.profile.prefs||{}).style||"")==="burner"?"selected":""}>Burner (10-20 min)</option></select></div></div>
      <div class="settings-toggle-row" style="margin-top:10px;padding:12px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-lit)">
        <label class="settings-switch-label"><input type="checkbox" id="s-light" ${((S.profile.prefs||{}).appearance||"dark")==="light"?"checked":""}><span><b style="color:var(--text)">Light mode</b> — bright backgrounds and higher contrast for daytime use.</span></label>
      </div>
      <div style="margin-top:10px"><label>Weight &amp; load units</label><select id="s-units"><option value="imperial" ${((S.profile.prefs||{}).units||"imperial")!=="metric"?"selected":""}>Imperial (lb)</option><option value="metric" ${((S.profile.prefs||{}).units||"")==="metric"?"selected":""}>Metric (kg)</option></select><p style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.45">Loads and body weight display convert from stored pounds; bar math uses Olympic plate sets for the active unit.</p></div>
      ${isFemale?`<div style="margin-top:8px;padding:10px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-lit)"><label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:12px;color:var(--text2);line-height:1.45"><input type="checkbox" id="s-women-ui" style="margin-top:3px;flex-shrink:0" ${(S.profile.prefs||{}).womenSimpleUi!==false?"checked":""}><span><b style="color:var(--text)">Simpler layout &amp; colors</b> — Pinterest-style cards on Home, shorter Plan, pastels. How-to videos prefer female coaches. Turn off anytime.</span></label></div>`:""}
      <div style="margin-top:8px"><label>When time is tight (Train tab)</label><select id="s-quick"><option value="0" ${!(Number((S.profile.prefs||{}).quickSessionMin))?"selected":""}>Full session</option><option value="15" ${Number((S.profile.prefs||{}).quickSessionMin)>0?"selected":""}>~15 min — first two lifts only</option></select></div>
      <button class="btn btn-cta btn-block" id="s-save" style="margin-top:10px">Save & recalculate</button>
      <details class="settings-adapt-fold settings-section" data-k="adaptation reset bench squat dead run multiplier advanced deload">
        <summary class="settings-adapt-sum">Advanced · adaptation multipliers</summary>
        <div class="settings-adapt-body">
          <p style="font-size:11px;color:var(--text3);margin:0 0 10px;line-height:1.45">These drift from 1.000 as you log. Reset only if prescriptions feel systematically off.</p>
          <div style="display:flex;gap:10px;font-size:12px;color:var(--text2);flex-wrap:wrap;font-variant-numeric:tabular-nums"><span>B <b>${S.adapt.bench.toFixed(3)}</b></span><span>S <b>${S.adapt.squat.toFixed(3)}</b></span><span>D <b>${S.adapt.dead.toFixed(3)}</b></span><span>R <b>${S.adapt.run.toFixed(3)}</b></span></div>
          <button type="button" class="btn btn-ghost btn-sm" id="s-reset" style="margin-top:8px">Reset to 1.000</button>
        </div>
      </details>
      </div>
    <div class="card settings-section" data-k="account email firebase sign plan switch onboard offline sync program start date calendar block" id="settings-account"><div class="card-h"><h2>Account & plan</h2></div>
      ${currentUser?`<div style="font-size:13px;font-weight:700;margin-bottom:4px">${currentUser.email}</div><div style="font-size:10px;color:var(--mint);margin-bottom:10px">Syncing to cloud</div><button class="btn btn-ghost btn-block" id="s-signout">Sign Out</button>`:`<div style="font-size:12px;color:var(--gold);margin-bottom:8px">${offlineMode?"Offline mode":"Not connected"}</div>`}
      <div style="margin-top:12px"><label>Program start date</label><input type="date" id="s-pstart" value="${(S.program&&S.program.start)||iso()}"></div>
      <p style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.45">Session 1 = first allowed train day on or after this date (then your template continues in weekday order). Save with “Save &amp; recalculate” below or use Switch plan.</p>
      <div style="margin-top:12px"><label>Current Plan (#${(S.planId||0)+1}/64)</label>
        <select id="s-plan" class="settings-plan-select">${PLANS.map(p=>`<option value="${p.id}" ${p.id===S.planId?"selected":""}>${p.name}</option>`).join("")}</select></div>
      <button class="btn btn-ice btn-block" id="s-plan-save" style="margin-top:6px">Switch Plan</button>
      <button class="btn btn-ghost btn-block" id="s-reonboard" style="margin-top:8px">Re-run Onboarding Wizard</button>
    </div>
        </div></div>
  </details>
  <details class="settings-fold settings-section" id="settings-plates" data-k="plate barbell calculator load weight gym plates per side olympic metric kg lb" open><summary>Bar load helper</summary><div class="settings-fold-body">
    ${(()=>{const m=useMetric();const hint=m?"Pairs per side for a standard kg set (25, 20, 15, 10, 5, 2.5, 1.25 kg).":"Pairs per side for a standard Olympic set (45, 35, 25, 10, 5, 2.5 lb).";const tot=m?"Target total (kg)":"Target total (lb)";const ph=m?"e.g. 102.5":"e.g. 225";const bi=m?`<option value="20" selected>20 kg</option><option value="15">15 kg</option><option value="10">10 kg technique</option><option value="0">No bar</option>`:`<option value="45" selected>45 lb</option><option value="35">35 lb</option><option value="20">20 lb technique</option><option value="0">No bar</option>`;const bl=m?"Bar (kg)":"Bar weight";return`<p style="font-size:12px;color:var(--text2);margin-bottom:10px">${hint}</p><div class="grid3"><div><label>${tot}</label><input type="number" id="pl-total" step="0.5" placeholder="${ph}" min="0"></div><div><label>${bl}</label><select id="pl-bar">${bi}</select></div><div style="align-self:end"><button type="button" class="btn btn-secondary-solid btn-block" id="pl-calc">Calculate</button></div></div>`})()}
    <div id="pl-out" style="font-size:13px;color:var(--text);margin-top:12px;line-height:1.45;font-weight:500"></div>
  </div></details>
  <details class="settings-fold settings-section" id="settings-health" data-k="health wearables apple google fit steps calories activity privacy clipboard manual sync metrics exercise"><summary>Activity &amp; health</summary><div class="settings-fold-body">
    <p style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px">Browser PWAs cannot read Apple Health or Google Fit directly. Log activity here (or paste step counts). Nothing leaves this device except via Firebase sync or export. Walks and hikes also fit under Overview → <b style="color:var(--text)">Walks, hikes &amp; extras</b>.</p>
    <div class="settings-health-panel card" style="padding:14px;margin-bottom:14px;background:var(--surface);border:1px solid var(--border-lit)">
      <div style="font-size:12px;font-weight:600;margin-bottom:10px;color:var(--text)">Daily health log</div>
      <p style="font-size:11px;color:var(--text3);margin:-4px 0 10px;line-height:1.45">Optional totals for today. High activity can nudge run conditioning; very low days do the opposite.</p>
      <div class="grid3" style="gap:10px">
        <div><label>Active calories</label><input type="number" id="health-cal" placeholder="540" min="0"></div>
        <div><label>Exercise minutes</label><input type="number" id="health-exmin" placeholder="42" min="0"></div>
        <div><label>Steps</label><input type="number" id="health-steps" placeholder="9800" min="0"></div>
      </div>
      <button type="button" class="btn btn-ice btn-block" id="health-log-save" style="margin-top:12px">Save health entry</button>
    </div>
    <div style="font-size:12px;font-weight:600;margin-bottom:6px">Quick steps</div>
    <p style="font-size:11px;color:var(--text3);margin-bottom:8px;line-height:1.45"><b style="color:var(--text)">Shortcut tip:</b> copy steps from Health or Fit, then paste here.</p>
    <label>Steps only (fast log)</label>
    <div class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap"><input type="number" id="health-steps-quick" placeholder="e.g. 8420" style="max-width:160px"><button type="button" class="btn btn-sm btn-mint" id="health-steps-save">Save steps</button><button type="button" class="btn btn-sm btn-ghost" id="health-paste-steps">Paste clipboard</button></div>
  </div></details>
  <details class="settings-fold settings-section" data-k="data backup export import clear logs json csv" id="settings-data" open><summary>Data &amp; backup</summary><div class="settings-fold-body">
    <p style="font-size:12px;color:var(--text2);margin-bottom:10px">Export a full backup of your training state, or import a saved JSON file from another device.</p>
    <div class="row settings-data-actions" style="flex-wrap:wrap;gap:8px"><button type="button" class="btn btn-ghost" id="s-clear">Clear logs</button><button type="button" class="btn btn-ghost" id="s-export">Export JSON</button><button type="button" class="btn btn-ghost" id="s-export-csv">Export CSV</button><button type="button" class="btn btn-ghost" id="s-import-btn">Import</button><input type="file" id="s-import-file" accept="application/json" style="display:none"></div>
  </div></details>`;
}
function bindSettings(){
  const fil=document.getElementById("s-filter");
  function applySettingsFilter(){
    const root=document.getElementById("you-inner");
    if(!root||!fil)return;
    const q=fil.value.toLowerCase().trim();
    const all=[...root.querySelectorAll(".settings-section")];
    if(!q.length){all.forEach(sec=>sec.classList.remove("hidden"));return;}
    const blob=sec=>((sec.dataset.k||"")+" "+(sec.textContent||"")).toLowerCase();
    const matched=new Set(all.filter(sec=>blob(sec).includes(q)));
    all.forEach(sec=>{
      let ok=matched.has(sec);
      if(!ok){
        let p=sec.parentElement;
        while(p){
          if(p.classList&&p.classList.contains("settings-section")&&matched.has(p)){ok=true;break}
          p=p.parentElement;
        }
      }
      if(!ok)ok=[...sec.querySelectorAll(".settings-section")].some(sub=>matched.has(sub));
      sec.classList.toggle("hidden",!ok);
    });
  }
  if(fil){fil.oninput=applySettingsFilter;if(fil.value.trim())applySettingsFilter()}
  bindMmssPaceInput(document.getElementById("s-run"));
  const hsq=document.getElementById("health-steps-save"),hst=document.getElementById("health-steps-quick"),hpa=document.getElementById("health-paste-steps");
  const hls=document.getElementById("health-log-save"),hcal=document.getElementById("health-cal"),hex=document.getElementById("health-exmin"),hst2=document.getElementById("health-steps");
  if(hls&&hcal&&hex&&hst2)hls.onclick=async()=>{const cal=Number(hcal.value)||0,exMin=Number(hex.value)||0,steps=Number(hst2.value)||0;if(cal<=0&&exMin<=0&&steps<=0){toast("Enter at least one of calories, exercise minutes, or steps.");return}const snap=S.healthLog.slice(),ar=S.adapt.run;S.healthLog.push({date:iso(),cal,exMin,steps});S.healthLog=S.healthLog.slice(-120);if(steps>=500){if(steps>10500)S.adapt.run=clamp(S.adapt.run+0.01,.85,1.2);if(steps<3500)S.adapt.run=clamp(S.adapt.run-0.01,.85,1.2)}if(exMin>=50)S.adapt.run=clamp(S.adapt.run+0.005,.85,1.2);if(exMin>0&&exMin<15)S.adapt.run=clamp(S.adapt.run-0.005,.85,1.2);hcal.value="";hex.value="";hst2.value="";await persist();render();toast("Health entry saved",{undo:()=>{S.healthLog=snap;S.adapt.run=ar;persist();render()}})};
  if(hsq&&hst)hsq.onclick=async()=>{const steps=Number(hst.value)||0;if(steps<500){toast("Enter a realistic step count (500+).");return}const snap=S.healthLog.slice(),ar=S.adapt.run;S.healthLog.push({date:iso(),cal:0,exMin:0,steps});S.healthLog=S.healthLog.slice(-120);if(steps>10500)S.adapt.run=clamp(S.adapt.run+0.01,.85,1.2);if(steps<3500)S.adapt.run=clamp(S.adapt.run-0.01,.85,1.2);hst.value="";await persist();render();toast("Steps saved",{undo:()=>{S.healthLog=snap;S.adapt.run=ar;persist();render()}})};
  if(hpa&&hst)hpa.onclick=async()=>{try{const t=await navigator.clipboard.readText();const n=parseInt(String(t).replace(/[^0-9]/g,""),10);if(n>=500)hst.value=String(n);else toast("Clipboard did not look like a step count.")}catch{toast("Allow clipboard access or type steps manually.")}};
  const plBtn=document.getElementById("pl-calc"),plOut=document.getElementById("pl-out");
  if(plBtn&&plOut)plBtn.onclick=()=>{const total=Number(document.getElementById("pl-total").value)||0,bar=Number(document.getElementById("pl-bar").value)||(useMetric()?20:45);const o=runPlateCalc(total,bar);if(o.err){plOut.textContent=o.err;return}plOut.textContent=o.text};
  const sLight=document.getElementById("s-light");
  if(sLight)sLight.onchange=async()=>{S.profile.prefs={...(S.profile.prefs||{}),appearance:sLight.checked?"light":"dark"};await persist();applyVisualTheme(false);render()};
  const sUnits=document.getElementById("s-units");
  if(sUnits)sUnits.onchange=async()=>{S.profile.prefs={...(S.profile.prefs||{}),units:sUnits.value==="metric"?"metric":"imperial"};await persist();render();toast("Units updated")};
  document.getElementById("s-save").onclick=async()=>{S.profile.bench1RM=massFieldToLb(document.getElementById("s-b").value)||S.profile.bench1RM;S.profile.squat1RM=massFieldToLb(document.getElementById("s-sq").value)||S.profile.squat1RM;S.profile.dead1RM=massFieldToLb(document.getElementById("s-dl").value)||S.profile.dead1RM;S.profile.weight=massFieldToLb(document.getElementById("s-wt").value)||S.profile.weight;S.profile.goalWt=massFieldToLb(document.getElementById("s-gw").value)||S.profile.goalWt;S.profile.waist=Number(document.getElementById("s-waist").value)||0;S.profile.hips=Number(document.getElementById("s-hips").value)||0;S.profile.shoulders=Number(document.getElementById("s-shoulders").value)||0;S.profile.bodyFat=Number(document.getElementById("s-bf").value)||0;S.profile.sex=document.getElementById("s-sex").value;const qm=Number(document.getElementById("s-quick")?.value)||0;const wmEl=document.getElementById("s-wm");const appearance=(document.getElementById("s-light")?.checked)?"light":"dark";const uEl=document.getElementById("s-units");const units=(uEl&&uEl.value)==="metric"?"metric":"imperial";const _prefs={...(S.profile.prefs||{}),lifeStage:document.getElementById("s-life").value,womenMode:wmEl?wmEl.value:((S.profile.prefs||{}).womenMode||"auto"),equipment:document.getElementById("s-eq").value,style:document.getElementById("s-style").value,appearance,units,quickSessionMin:qm};if(S.profile.sex==="female")_prefs.womenSimpleUi=!!(document.getElementById("s-women-ui")&&document.getElementById("s-women-ui").checked);else delete _prefs.womenSimpleUi;S.profile.prefs=_prefs;const r=parseMM(document.getElementById("s-run").value);if(r>0)S.profile.run4mi=r;const ps=document.getElementById("s-pstart");if(ps){const v=(ps.value||"").trim();if(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(parseIsoNoon(v).getTime()))S.program.start=v}await persist();applyVisualTheme(false);render();toast("Saved")};
  document.getElementById("s-reset").onclick=async()=>{if(!confirm("Reset all adaptation multipliers to 1.000? Prescribed loads and run pace will change until your logs move them again."))return;const prev={...S.adapt};S.adapt={bench:1,squat:1,dead:1,run:1};await persist();render();toast("Adaptation reset",{undo:()=>{S.adapt=prev;persist();render()}})};
  const so=document.getElementById("s-signout");if(so)so.onclick=()=>{if(confirm("Sign out? You can sign back in later; local data on this device stays until you clear it."))doSignOut()};
       document.getElementById("s-plan-save").onclick=async()=>{const next=Number(document.getElementById("s-plan").value);const nm=PLANS[next].name;if(!confirm(`Switch to plan "${nm}"? Week alignment stays the same; review Plan when ready.`))return;S.planId=next;const ps=document.getElementById("s-pstart");if(ps){const v=(ps.value||"").trim();if(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(parseIsoNoon(v).getTime()))S.program.start=v}await persist();render();toast("Switched to: "+nm)};
  document.getElementById("s-reonboard").onclick=()=>{if(!confirm("Re-run the full onboarding wizard? Your logs stay saved, but you'll step through goals and schedule again."))return;S.profile.onboarded=false;save();showOnboarding()};
  document.getElementById("s-clear").onclick=async()=>{if(!confirm("Clear all workout logs and weight history? This cannot be auto-restored except via undo in the next few seconds or an exported backup."))return;const logs=S.logs.slice(),wl=S.weightLog.slice(),ad={...S.adapt};S.logs=[];S.weightLog=[];S.adapt={bench:1,squat:1,dead:1,run:1};await persist();render();toast("Logs cleared.",{undo:()=>{S.logs=logs;S.weightLog=wl;S.adapt=ad;persist();render()},duration:7200})};
  document.getElementById("s-export").onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="hybrid-warrior-backup.json";a.click()};
  const csvBtn=document.getElementById("s-export-csv");
  if(csvBtn)csvBtn.onclick=()=>{
    const esc=(v)=>`"${String(v??"").replace(/"/g,'""')}"`;
    const logsHead=["type","date","week","exercise","planned_sets","planned_reps","planned_weight","actual_sets","actual_reps","actual_weight","outcome","score","note"];
    const logsRows=(S.logs||[]).map(l=>["log",l.date,l.week,l.exercise,l.tS,l.tR,l.tW,l.aS,l.aR,l.aW,l.outcome,l.score,l.note||""]);
    const healthHead=["type","date","active_calories","exercise_minutes","steps"];
    const healthRows=(S.healthLog||[]).map(h=>["health",h.date,h.cal||0,h.exMin||0,h.steps||0]);
    const lines=[logsHead.join(","),...logsRows.map(r=>r.map(esc).join(",")),"",healthHead.join(","),...healthRows.map(r=>r.map(esc).join(","))];
    const b=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="hybrid-training-export.csv";a.click();
  };
  document.getElementById("s-import-btn").onclick=()=>document.getElementById("s-import-file").click();
  document.getElementById("s-import-file").onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{const prev=structuredClone(S);S=merge(structuredClone(DEF),JSON.parse(await f.text()));trimStaleSkipped(S);normalizeProgramStart(S);await persist();render();toast("Imported state.",{undo:()=>{S=prev;persist();render()},duration:7200})}catch{toast("Invalid file")}};
}

// ═══════════════════════════════════════════════════════════
//  PDF LOADER
// ═══════════════════════════════════════════════════════════
async function ensurePdf(){if(pdfLib)return;pdfLib=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.mjs");pdfLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs"}
async function getPdf(n,s){await ensurePdf();if(pdfCache.has(n))return pdfCache.get(n);const d=await pdfLib.getDocument(s).promise;pdfCache.set(n,d);return d}

// ═══════════════════════════════════════════════════════════
//  MASTER RENDER
// ═══════════════════════════════════════════════════════════
function maybeShowWomenMissWelcome(){
  if(!useWomenSoftUi()||!S.profile.onboarded)return;
  const m=oldestUnresolvedMiss();
  if(!m)return;
  const key="hw-miss-welcome-"+iso();
  if(sessionStorage.getItem(key))return;
  const ob=document.getElementById("obScreen");
  if(ob&&ob.classList.contains("show"))return;
  const auth=document.getElementById("authScreen");
  if(auth&&auth.style.display!=="none"&&getComputedStyle(auth).display!=="none")return;
  const app=document.getElementById("app");
  if(!app||getComputedStyle(app).display==="none")return;
  const pl=rollingPlanForDate(m.date);
  const focus=(pl.focus||"Training").split("·")[0].trim().slice(0,56);
  const wrap=document.createElement("div");
  wrap.className="miss-welcome-overlay";
  wrap.setAttribute("role","dialog");
  wrap.setAttribute("aria-modal","true");
  wrap.setAttribute("aria-labelledby","miss-welcome-title");
  wrap.innerHTML=`<div class="miss-welcome-card"><h3 id="miss-welcome-title">Missed ${m.dayName}</h3><p>Want to do the <b>${m.date}</b> session now, or skip it for this block?</p><p style="font-size:12px;color:var(--text3);margin-bottom:0;line-height:1.45">${focus}${pl.exs.length?` · ${pl.exs.length} exercise${pl.exs.length!==1?"s":""}`:""}</p><div class="miss-welcome-actions"><button type="button" class="btn btn-cta" id="mw-do">Do this workout</button><button type="button" class="btn btn-secondary-solid" id="mw-skip">Skip this session</button><button type="button" class="btn btn-ghost" id="mw-later">Not now</button></div></div>`;
  document.body.appendChild(wrap);
  const done=()=>{sessionStorage.setItem(key,"1");wrap.remove()};
  document.getElementById("mw-do").onclick=()=>{done();trainSessionDate=m.date;tab=TAB_TRAIN;trainSub="workout";render()};
  document.getElementById("mw-skip").onclick=async()=>{ensureScheduleAdjust().missChoices[m.date]={choice:"skip"};await persist();done();render()};
  document.getElementById("mw-later").onclick=()=>done();
}
function render(){
  try{
    autoWeek();
    normalizeTabs();
    applyVisualTheme(document.getElementById("obScreen")&&document.getElementById("obScreen").classList.contains("show"));
    renderNav();
    const app=document.getElementById("app");
    let html,bindFn;
    if(tab===TAB_TRAIN){html=`<div class="pane show" id="p-train">${renderTrain()}</div>`;bindFn=bindTrain}
    else if(tab===TAB_PLAN){
      const planClass=[useWomenSoftUi()?"plan-women-simple":"",planCompactOn()?"plan-compact":""].filter(Boolean).join(" ");
      html=`<div class="pane show ${planClass}" id="p-plan">${renderProgram()}</div>`;
      bindFn=bindProgram;
    }
    else{html=`<div class="pane show" id="p-you">${renderYou()}</div>`;bindFn=bindYou}
    const frag=document.createDocumentFragment();
    const tpl=document.createElement("template");
    tpl.innerHTML=html;
    frag.appendChild(tpl.content);
    app.replaceChildren(frag);
    bindFn();
    const psw=sessionStorage.getItem("hw-plan-scroll-wk");
    if(psw&&tab===TAB_PLAN){sessionStorage.removeItem("hw-plan-scroll-wk");requestAnimationFrame(()=>{document.querySelector(`#p-plan .pw-head[data-w="${psw}"]`)?.scrollIntoView({behavior:"smooth",block:"start"})})}
    const hs=sessionStorage.getItem("hw-scroll");if(hs){sessionStorage.removeItem("hw-scroll");scrollToHashAfterRender(hs)}
    if(sessionStorage.getItem("ease-open")==="1"){sessionStorage.removeItem("ease-open");requestAnimationFrame(()=>document.getElementById("train-ease-wiz")?.classList.add("show"))}
    maybeShowWomenMissWelcome();
    updateGlobalFabVisibility();
  }catch(err){
    const e=document.getElementById("authErr");
    if(e){e.textContent=`render failed: ${err&&err.message?err.message:"unknown"}`;e.classList.add("show")}
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
function isThemePreviewHost(){
  const h=(location.hostname||"").toLowerCase();
  return h==="localhost"||h==="127.0.0.1"||h==="[::1]";
}
/** Local dev only: e.g. http://127.0.0.1:8080/index.html?themePreview=female — previews feminine/masculine styling without Firebase (does not save profile). */
function tryThemePreviewBoot(){
  if(!isThemePreviewHost())return false;
  const q=new URLSearchParams(location.search);
  const t=(q.get("themePreview")||"").toLowerCase();
  if(!t)return false;
  const female=t==="female"||t==="feminine"||t==="woman";
  const male=t==="male"||t==="masculine"||t==="man";
  if(!female&&!male)return false;
  S.profile.sex=female?"female":"male";
  S.profile.onboarded=true;
  if(female)S.profile.prefs={...(S.profile.prefs||{}),womenSimpleUi:true};
  const auth=document.getElementById("authScreen");if(auth)auth.style.display="none";
  const ob=document.getElementById("obScreen");if(ob)ob.classList.remove("show");
  const nav=document.getElementById("mainNav");if(nav)nav.style.display="";
  const appEl=document.getElementById("app");if(appEl)appEl.style.display="";
  applyVisualTheme(false);
  render();
  return true;
}
function initRestBarDock(){
  const d=document.getElementById("restDone"),a30=document.getElementById("restAdd30"),s30=document.getElementById("restSkip30");
  if(d)d.onclick=()=>stopRestTimer();
  if(a30)a30.onclick=()=>{restEndMs+=3e4;toast("+30s")};
  if(s30)s30.onclick=()=>{restEndMs-=3e4;if(restEndMs<Date.now()+8e3)restEndMs=Date.now()+8e3};
}
export async function bootstrapApp(){
  initRestBarDock();
  bindGlobalSearch();
  bindGlobalFab();
  const sk=document.getElementById("skip-main");
  if(sk)sk.addEventListener("click",()=>{requestAnimationFrame(()=>{const a=document.getElementById("app");if(a)try{a.focus()}catch{}})});
  if(tryThemePreviewBoot())return;
  applyVisualTheme(true);
  try{
    bindAuthUI();
  }catch(err){
    throw err;
  }
  if(!location.hash)location.hash=TAB_YOU;
  const routeTab=tabFromHash();
  if(routeTab)tab=routeTab;
  window.addEventListener("hashchange",()=>{const t=tabFromHash();if(t){tab=t;render();}});
  window.addEventListener("online",()=>{if(currentUser){toast("Back online.");cloudPush();render()}});
  window.addEventListener("offline",()=>{render()});
  const cfg=getResolvedFirebaseConfig();
  if(cfg){
    try{showAuthLoading();await initFB(cfg);fbAuth.onAuthStateChanged(u=>{if(u)enterApp(u);else{offlineMode=false;showAuthLogin()}})}
    catch(err){
      showAuthSetup()}
  }
  else{showAuthLogin();showAuthErr("Missing Firebase config. Add window.__HYBRID_FIREBASE_CONFIG__ in index.html.");}
  if("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost")){
    navigator.serviceWorker.register("./sw.js").then((reg)=>{
      try{reg.update()}catch{}
      if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
      reg.addEventListener("updatefound",()=>{
        const nw=reg.installing;
        if(!nw)return;
        nw.addEventListener("statechange",()=>{
          if(nw.state==="installed"&&navigator.serviceWorker.controller)nw.postMessage({type:"SKIP_WAITING"});
        });
      });
      navigator.serviceWorker.addEventListener("controllerchange",()=>{
        location.reload();
      },{once:true});
    }).catch(()=>{});
  }
  setInterval(()=>{const p=document.getElementById("navPill");if(p){const w=S.program.week;p.textContent=`Week ${w}/13 · ${phaseName(w)}`}},6e4);
  updateGlobalFabVisibility();
}

// Restored from pre-module-split workout_tracker.html (program engine).
function applyWomenBlueprint(out,slot,w){
  if(womenBlueprintMode()==="none")return out;
  const mode=womenBlueprintMode();
  const tier=womenBaselineTier();
  const quick=(S.profile.prefs||{}).style==="burner"||S.schedule.sessionMin<=35;
  const life=(S.profile.prefs||{}).lifeStage||"general";
  const isHome=(S.profile.prefs||{}).equipment==="home"||mode==="home";
  const dn=w===4||w===8?" (DELOAD)":"";
  const phase=w<=4?"foundation":w<=8?"build":w<=12?"intensify":"test";
  const phaseSetBoost=phase==="build"?1:phase==="intensify"?1:0;
  const phaseRepShift=phase==="foundation"?2:phase==="intensify"?-2:phase==="test"?-1:0;
  const phaseLoad=phase==="foundation"?0.92:phase==="build"?1:phase==="intensify"?1.08:0.96;
  const isDeload=w===4||w===8;
  const roundSets=Math.max(2,(quick?2:(tier==="advanced"?4:3))+phaseSetBoost-(isDeload?1:0));
  const repMain=Math.max(8,(tier==="advanced"?12:15)+phaseRepShift);
  const repHigh=Math.max(10,(tier==="advanced"?15:20)+phaseRepShift);
  const squatBase=Math.max(10,r5((S.profile.squat1RM||95)*0.15));
  const hingeBase=Math.max(20,r5((S.profile.dead1RM||135)*0.35));
  const rowBase=Math.max(12,r5((S.profile.bench1RM||95)*0.4));

  const block={
    glute:[{eid:"hip_thrust",sets:roundSets,reps:repMain,target:hingeBase,unit:"lb/band",reason:"Glute shelf mass builder"},
      {eid:"fire_hydrant",sets:roundSets,reps:repHigh,target:0,unit:"BW/band",reason:"Glute medius and side booty"},
      {eid:"clamshell",sets:roundSets,reps:repHigh,target:0,unit:"BW/band",reason:"Hip stability and outer glute"},
      {eid:"donkey_kick",sets:roundSets,reps:repHigh,target:0,unit:"BW/band",reason:"Round glute shape"},
      {eid:"side_leg_raise",sets:roundSets,reps:repHigh,target:0,unit:"BW/band",reason:"Hip-dip and abductors"}],
    backArms:[{eid:"row",sets:roundSets,reps:repMain,target:rowBase,unit:"lb/hand",reason:"Hourglass V-taper width"},
      {eid:"cross_press",sets:roundSets,reps:repMain,target:10,unit:"lb/hand",reason:"Back + arm sculpt"},
      {eid:"face_pull",sets:roundSets,reps:repHigh,target:0,unit:"band",reason:"Posture and rounded-shoulder fix"},
      {eid:"chest_sweep",sets:roundSets,reps:repHigh,target:5,unit:"lb/hand",reason:"Long and lean arm tone"},
      {eid:"champagne",sets:roundSets,reps:repHigh,target:5,unit:"lb/hand",reason:"Shoulder definition"}],
    abs:[{eid:"kb_around",sets:roundSets,reps:repMain,target:10,unit:"lb",reason:"Deep core anti-rotation"},
      {eid:"suitcase",sets:roundSets,reps:35,target:12,unit:"sec/side",reason:"Oblique and waistline control"},
      {eid:"db_leg_raise",sets:roundSets,reps:repMain,target:0,unit:"BW",reason:"Lower belly control"},
      {eid:"toe_tap",sets:roundSets,reps:repHigh,target:0,unit:"BW",reason:"DR-friendly deep core"},
      {eid:"plank",sets:roundSets,reps:40,target:0,unit:"sec",reason:"Corset stability"}],
    medball:[{eid:"medball_circuit",sets:roundSets,reps:45,target:0,unit:"sec",reason:"Full body medball power"},
      {eid:"air_squat",sets:roundSets,reps:repHigh,target:0,unit:"BW",reason:"Metabolic lower-body burn"},
      {eid:"suitcase",sets:roundSets,reps:30,target:12,unit:"sec/side",reason:"Core under fatigue"},
      {eid:"chest_sweep",sets:roundSets,reps:repHigh,target:5,unit:"lb/hand",reason:"Upper body toning"},
      {eid:"toe_tap",sets:roundSets,reps:repHigh,target:0,unit:"BW",reason:"Core finisher"}],
    postpartum:[{eid:"pelvic_breath",sets:3,reps:10,target:0,unit:"breaths",reason:"360 breathing + pelvic floor"},
      {eid:"toe_tap",sets:3,reps:12,target:0,unit:"BW",reason:"Modified deadbug / DR safe"},
      {eid:"hip_thrust",sets:3,reps:15,target:0,unit:"BW",reason:"Glute + pelvic support"},
      {eid:"face_pull",sets:2,reps:15,target:0,unit:"band",reason:"Posture restoration"},
      {eid:"side_leg_raise",sets:2,reps:12,target:0,unit:"BW",reason:"Hip stability and alignment"}],
    pregnancy:[{eid:"pelvic_breath",sets:3,reps:10,target:0,unit:"breaths",reason:"Prenatal breath-pelvic coordination"},
      {eid:"toe_tap",sets:3,reps:10,target:0,unit:"BW",reason:"Gentle abs activation"},
      {eid:"hip_thrust",sets:3,reps:12,target:0,unit:"BW",reason:"Bridge pelvic tilt pattern"},
      {eid:"lunge",sets:2,reps:10,target:0,unit:"BW",reason:"Labor prep lower-body strength"},
      {eid:"suitcase",sets:2,reps:20,target:8,unit:"sec/side",reason:"Safe trunk stability"}]
  };

  if(life==="pregnancy"||mode==="pregnancy"){out.focus="Pregnancy Safe Core + Mobility"+dn;out.exs=block.pregnancy;out.warmup="5 min walk + hip circles + side-body breathing";out.finisher="Gentle prenatal flow: child pose, happy baby, breathing (2 rounds).";return out}
  if(life==="postpartum"||mode==="postpartum"){out.focus="Postpartum Core Restore"+dn;out.exs=block.postpartum;out.warmup="3-5 min walk + 360 breathing + pelvic tilts";out.finisher="DR-friendly circuit: toe taps, bridges, bird-dog pattern (2-3 rounds).";return out}

  const fa=S.goals.focusAreas||[];
  const wantsGlute=fa.includes("Glute Shelf");
  const wantsPosture=fa.includes("Posture & Back Tone");
  const wantsAbs=fa.includes("Pilates Plus Tone")||fa.includes("Hourglass Shape");
  if(["GL","HYG","HL"].includes(slot)){out.focus=(mode==="glute_shelf"?"Glute Shelf Program":"Hourglass Glute Sculpt")+" · Focus: glutes/hips"+dn;out.exs=block.glute}
  else if(["HYL","HPL","HP"].includes(slot)){out.focus=(mode==="posture"?"Back & Posture Tone":"Hourglass Back Circuit")+" · Focus: upper-back/arms"+dn;out.exs=block.backArms}
  else if(["CT","FB","FBC","HB","HYP"].includes(slot)){
    if(wantsGlute&&!wantsPosture){out.focus="Glute + Lower Belly Sculpt · Focus: shelf + core"+dn;out.exs=w%2?block.glute:block.abs}
    else if(wantsPosture&&!wantsGlute){out.focus="Posture + Core Sculpt · Focus: back + waistline"+dn;out.exs=w%2?block.backArms:block.abs}
    else if(wantsAbs){out.focus="Lower Belly Sculpt Flow · Focus: deep core"+dn;out.exs=(isHome||quick)?block.medball:block.abs}
    else{out.focus=(mode==="pilates"?"Pilates Plus Abs & Arms":"Lower Belly Sculpt Flow")+" · Focus: core conditioning"+dn;out.exs=(isHome||quick)?block.medball:block.abs}
  }
  else if(slot==="SR"||slot==="TR"){out.focus="Runner Core + Shin Splint Prep"+dn;out.exs=[{eid:"toe_tap",sets:roundSets,reps:repHigh,target:0,unit:"BW",reason:"Core stability for running"},{eid:"side_leg_raise",sets:roundSets,reps:repMain,target:0,unit:"BW",reason:"Hip abduction alignment"},{eid:"suitcase",sets:roundSets,reps:30,target:10,unit:"sec/side",reason:"Oblique control"}]}
  else {out.focus="Targeted Home Sculpt Session"+dn;out.exs=(isHome||quick)?block.medball:block.abs}

  out.warmup="Dynamic prep: leg swings 10/side, high lunge, downward dog, glute activation";
  out.exs=out.exs.map(ex=>({...ex,target:(typeof ex.target==="number"&&ex.target>0)?r5(ex.target*phaseLoad):ex.target}));
  out.finisher=mode==="glute_shelf"
    ?"Glute Burnout (2-3 rounds): hydrants 20/side, donkey kicks 20/side, clamshells 20/side."
    :mode==="pilates"
    ?"Pilates Arm + Core Burner (2-3 rounds): chest sweeps 15, champagne pours 15, toe taps 16."
    :"Hourglass Circuit (2-3 rounds): rows 12, cross press 12, suitcase hold 30s/side.";
  return out;
}

function calcLogScore(log){
  const type=inferType(log.exercise);
  const tW=Number(log.tW)||0,aW=Number(log.aW)||0,tR=Number(log.tR)||0,aR=Number(log.aR)||0;
  if(type==="run"){
    if(tW>0&&aW>0)return +(tW/aW).toFixed(2);
    return 1;
  }
  if(tW>0&&aW>0&&tR>0&&aR>0){
    const tEst=epley(tW,tR),aEst=epley(aW,aR);
    if(tEst>0&&aEst>0)return +clamp(aEst/tEst,.55,1.6).toFixed(2);
  }
  return 1;
}
function applyLog(log){
  const type=inferType(log.exercise);
  const tVol=Math.max(1,(log.tW||0)*(log.tR||1)*(log.tS||1));
  const aVol=Math.max(1,(log.aW||0)*(log.aR||1)*(log.aS||1));
  const liftScore=tVol>1?aVol/tVol:1;
  if(type==="bench"){const tw=clamp((liftScore-1)*.08,-.025,.025);S.adapt.bench=clamp(S.adapt.bench+tw,.88,1.25);const e=epley(log.aW,log.aR);if(e>S.profile.bench1RM*1.01)S.profile.bench1RM=Math.round(e);log.score=+liftScore.toFixed(2)}
  else if(type==="squat"){const tw=clamp((liftScore-1)*.08,-.025,.025);S.adapt.squat=clamp(S.adapt.squat+tw,.88,1.25);const e=epley(log.aW,log.aR);if(e>S.profile.squat1RM*1.01)S.profile.squat1RM=Math.round(e);log.score=+liftScore.toFixed(2)}
  else if(type==="dead"){const tw=clamp((liftScore-1)*.08,-.025,.025);S.adapt.dead=clamp(S.adapt.dead+tw,.88,1.25);const e=epley(log.aW,log.aR);if(e>S.profile.dead1RM*1.01)S.profile.dead1RM=Math.round(e);log.score=+liftScore.toFixed(2)}
  else if(type==="run"){
    const t=Number(log.tW||0),a=Number(log.aW||0);
    if(t>0&&a>0){
      const runScore=t/a;
      S.adapt.run=clamp(S.adapt.run+clamp((runScore-1)*.07,-.025,.025),.85,1.2);
      log.score=+runScore.toFixed(2);
    } else log.score=1;
  }
  else log.score=+liftScore.toFixed(2);
  applyFeelToLogAdapt(log);
  return log;
}
function applyDayAdaptation(dateStr){
  const wk=getWkForDate(dateStr);
  const plan=rollingPlanForDate(dateStr);
  let touched=0;
  for(const ex of (plan.exs||[])){
    const e=exById(ex.eid),name=e?e.name:ex.eid;
    const rows=S.logs.filter(l=>l.date===dateStr&&l.exercise===name);
    if(!rows.length)continue;
    const type=inferType(name);
    if(type==="run"){
      const t=Number(ex.target)||Number(rows[0].tW)||0;
      const samples=rows.map(r=>Number(r.aW)||0).filter(Boolean);
      if(!samples.length)continue;
      let runScore=t>0?t/(samples.reduce((a,b)=>a+b,0)/samples.length):1;
      if(rows.some(r=>r.outcome==="time"))runScore=Math.max(runScore,1);
      if(rows.some(r=>r.outcome==="fail"))runScore*=0.97;
      S.adapt.run=clamp(S.adapt.run+clamp((runScore-1)*.07,-.025,.025),.85,1.2);
      touched++;
      continue;
    }
    const plannedReps=Math.max(1,(Number(ex.reps)||1)*(Number(ex.sets)||1));
    let actualReps=0,bestEst=0;
    for(const r of rows){
      actualReps+=(Number(r.aR)||1)*(Number(r.aS)||1);
      bestEst=Math.max(bestEst,epley(Number(r.aW)||0,Number(r.aR)||0));
    }
    let liftScore=rows.reduce((s,r)=>s+(Number(r.score)||calcLogScore(r)),0)/rows.length;
    if(actualReps<plannedReps*0.95)liftScore*=0.97;
    liftScore=clamp(liftScore,.6,1.4);
    const tw=clamp((liftScore-1)*.08,-.025,.025);
    if(type==="bench"){S.adapt.bench=clamp(S.adapt.bench+tw,.88,1.25);if(bestEst>S.profile.bench1RM*1.01)S.profile.bench1RM=Math.round(bestEst);touched++}
    else if(type==="squat"){S.adapt.squat=clamp(S.adapt.squat+tw,.88,1.25);if(bestEst>S.profile.squat1RM*1.01)S.profile.squat1RM=Math.round(bestEst);touched++}
    else if(type==="dead"){S.adapt.dead=clamp(S.adapt.dead+tw,.88,1.25);if(bestEst>S.profile.dead1RM*1.01)S.profile.dead1RM=Math.round(bestEst);touched++}
  }
  return touched;
}

function mkDay(slot,w){
  const wf=wkFactor(w),p=S.profile,reps=phaseReps(w),sets=phaseSets(w);
  const fk=est5k(p.run4mi)/Math.max(S.adapt.run,.5),pmi=paceMi(fk);
  const b=r5(p.bench1RM*wf*S.adapt.bench),sq=r5(p.squat1RM*wf*S.adapt.squat),dl=r5(p.dead1RM*wf*S.adapt.dead);
  const isDeload=w===4||w===8,dn=isDeload?" (DELOAD)":"";
  const accP=w%2===0?"incline_db":"cgbench",accL=w%2===0?"lunge":"bss",accSh=w%3===0?"lat_raise":"ohp";
  const wt=weightTrend();let xf="";
  if(wt&&S.goals.fatLoss>0&&wt.perWeek>-S.goals.fatLoss/13*0.5)xf=" + Extra 5-min AMRAP (behind pace)";
  const h=(S.healthLog||[]).slice(-1)[0];
  if(h&&h.cal>0&&h.cal<250&&slot!=="TR"&&slot!=="SR")xf+=" + 10-min brisk walk (low burn day)";

  const S_={
    HP:{focus:"Heavy Push"+dn,warmup:"5 min cardio → band pull-aparts → bar×10, 95×8, 135×5",
      exs:[{eid:"bench",sets,reps:reps[1],target:b,unit:"lb",reason:`${Math.round(wf*100)}% 1RM × ${S.adapt.bench.toFixed(2)}`},
        {eid:accP,sets:3,reps:w<=4?10:8,target:r5(b*(accP==="incline_db"?.4:.65)),unit:"lb",reason:"Push accessory"},
        {eid:"row",sets:4,reps:w<=4?10:8,target:r5(b*.75),unit:"lb",reason:"Superset — stay at rack"},
        {eid:w%2?"pullup":"face_pull",sets:3,reps:w%2?8:15,target:0,unit:w%2?"BW":"band",reason:"Pull balance"},
        {eid:"pushup",sets:1,reps:100,target:0,unit:"BW",reason:"100 reps AFAP"}],
      finisher:"50 Burpees + 50 Sit-Ups for time"+xf},
    HPL:{focus:"Heavy Pull"+dn,warmup:"5 min row machine → band pull-aparts → light rows",
      exs:[{eid:"row",sets,reps:reps[1],target:r5(b*.8),unit:"lb",reason:"Heavy barbell row"},
        {eid:"pullup",sets:4,reps:w<=4?8:6,target:0,unit:"BW",reason:"Vertical pull"},
        {eid:"face_pull",sets:3,reps:15,target:0,unit:"band",reason:"Rear delt health"},
        {eid:"farmer",sets:4,reps:40,target:r5(dl*.2),unit:"lb/hand",reason:"Grip + core"},
        {eid:"plank",sets:3,reps:60,target:0,unit:"sec",reason:"Anti-extension core"}],
      finisher:"4 rounds: 15 Burpees + 20 Sit-Ups"+xf},
    HL:{focus:"Heavy Lower"+dn,warmup:"5 min bike → BW squats → 95×10, 135×8, 185×5",
      exs:[{eid:"squat",sets,reps:reps[1],target:sq,unit:"lb",reason:`${Math.round(wf*100)}% 1RM × ${S.adapt.squat.toFixed(2)}`},
        {eid:"deadlift",sets:isDeload?2:w<=4?3:4,reps:w<=8?5:3,target:dl,unit:"lb",reason:`${Math.round(wf*100)}% 1RM × ${S.adapt.dead.toFixed(2)}`},
        {eid:accL,sets:3,reps:12,target:r5(sq*.2),unit:"lb/hand",reason:"Unilateral volume"},
        {eid:"rdl",sets:3,reps:10,target:r5(dl*.3),unit:"lb",reason:"Hamstring volume"}],
      finisher:"100 BW Squats for time"+xf},
    GL:{focus:"Glute & Hip"+dn,warmup:"5 min bike → hip circles → BW squats ×15",
      exs:[{eid:"rdl",sets,reps:reps[0],target:r5(dl*.45),unit:"lb",reason:"Posterior chain"},
        {eid:"bss",sets:3,reps:10,target:r5(sq*.15),unit:"lb/hand",reason:"Single-leg strength"},
        {eid:"squat",sets:3,reps:w<=4?10:8,target:r5(sq*.7),unit:"lb",reason:"Squat volume"},
        {eid:"lunge",sets:3,reps:12,target:r5(sq*.15),unit:"lb/hand",reason:"Walking lunges"},
        {eid:"plank",sets:3,reps:45,target:0,unit:"sec",reason:"Core stability"}],
      finisher:"50 Air Squats + 50 Lunges for time"+xf},
    SR:{focus:"Speed Intervals"+dn,warmup:"10 min jog → leg swings → 2×100m strides",
      exs:[{eid:"int800",sets:isDeload?3:w<=4?4:w<=8?5:6,reps:1,target:Math.round(pmi/2),unit:"sec ("+fmtPace(Math.round(pmi))+" pace)",reason:`800m at ${fmtPace(Math.round(pmi))} target`},
        {eid:"plank",sets:3,reps:60,target:0,unit:"sec",reason:"Core for running economy"}],
      finisher:"2-min plank + 2×30s mountain climbers"+xf},
    TR:{focus:"Tempo Run"+dn,warmup:"10 min jog → dynamic stretches → strides",
      exs:[{eid:"tempo",sets:1,reps:isDeload?16:w<=4?20:w<=8?24:w<=12?28:16,target:Math.round(pmi),unit:fmtPace(Math.round(pmi)),reason:`Threshold from est 5K ${mmss(Math.round(fk))}`},
        {eid:"burpee",sets:3,reps:12,target:0,unit:"BW",reason:"Full-body power after tempo (no sport-specific skills)"}],
      finisher:"4-min AMRAP burpees — stop before form breaks"+xf},
    FB:{focus:"Full Body"+dn,warmup:"5 min cardio → dynamic stretches → bar×10",
      exs:[{eid:"squat",sets:3,reps:w<=4?8:6,target:r5(sq*.85),unit:"lb",reason:"Squat foundation"},
        {eid:"bench",sets:3,reps:w<=4?8:6,target:r5(b*.85),unit:"lb",reason:"Bench foundation"},
        {eid:"row",sets:3,reps:w<=4?10:8,target:r5(b*.65),unit:"lb",reason:"Pull balance"},
        {eid:"plank",sets:3,reps:45,target:0,unit:"sec",reason:"Core"}],
      finisher:"5-min AMRAP: 10 Burpees + 10 Air Squats"+xf},
    FBC:{focus:"Full Body Circuit"+dn,warmup:"5 min jog → dynamic stretches",
      exs:[{eid:"squat",sets:3,reps:12,target:r5(sq*.6),unit:"lb",reason:"Circuit squat"},
        {eid:"bench",sets:3,reps:12,target:r5(b*.6),unit:"lb",reason:"Circuit bench"},
        {eid:"row",sets:3,reps:12,target:r5(b*.5),unit:"lb",reason:"Circuit row"},
        {eid:"burpee",sets:3,reps:10,target:0,unit:"BW",reason:"Metabolic boost"},
        {eid:"plank",sets:3,reps:30,target:0,unit:"sec",reason:"Core"}],
      finisher:"Tabata Burpees 8×20/10"+xf},
    HYP:{focus:"Hypertrophy Push"+dn,warmup:"5 min cardio → arm circles → bar×10, 95×8",
      exs:[{eid:"bench",sets:4,reps:w<=4?10:8,target:r5(b*.8),unit:"lb",reason:"Volume bench"},
        {eid:"incline_db",sets:3,reps:12,target:r5(b*.3),unit:"lb/hand",reason:"Upper chest"},
        {eid:accSh,sets:3,reps:accSh==="ohp"?10:15,target:accSh==="ohp"?r5(b*.3):r5(b*.08),unit:"lb",reason:"Shoulder volume"},
        {eid:"dip",sets:3,reps:w<=4?12:10,target:0,unit:"BW",reason:"Tricep volume"},
        {eid:"pushup",sets:1,reps:100,target:0,unit:"BW",reason:"100-rep finisher"}],
      finisher:"50 Burpees for time"+xf},
    HYL:{focus:"Hypertrophy Pull"+dn,warmup:"5 min row machine → band pull-aparts",
      exs:[{eid:"row",sets:4,reps:w<=4?10:8,target:r5(b*.65),unit:"lb",reason:"Volume row"},
        {eid:"pullup",sets:4,reps:w<=4?8:6,target:0,unit:"BW",reason:"Lat width"},
        {eid:"face_pull",sets:4,reps:15,target:0,unit:"band",reason:"Rear delt / posture"},
        {eid:"farmer",sets:4,reps:40,target:r5(dl*.15),unit:"lb/hand",reason:"Grip + traps"}],
      finisher:"100 Push-Ups + 100 Sit-Ups for time"+xf},
    HYG:{focus:"Hypertrophy Legs"+dn,warmup:"5 min bike → BW squats ×20 → leg swings",
      exs:[{eid:"squat",sets:4,reps:w<=4?10:8,target:r5(sq*.75),unit:"lb",reason:"Volume squat"},
        {eid:"rdl",sets:3,reps:12,target:r5(dl*.3),unit:"lb",reason:"Hamstring volume"},
        {eid:"bss",sets:3,reps:10,target:r5(sq*.12),unit:"lb/hand",reason:"Single-leg hyp"},
        {eid:"lunge",sets:3,reps:12,target:r5(sq*.12),unit:"lb/hand",reason:"Walking lunge"},
        {eid:"air_squat",sets:1,reps:100,target:0,unit:"BW",reason:"100-rep Beatdown"}],
      finisher:"3-min AMRAP burpees (or 5-min easy walk if legs are fried)"+xf},
    CT:{focus:"Conditioning Circuit"+dn,warmup:"5 min light jog → dynamic stretches",
      exs:[{eid:"burpee",sets:5,reps:isDeload?10:15,target:0,unit:"BW",reason:"Full-body conditioning"},
        {eid:"air_squat",sets:5,reps:20,target:0,unit:"BW",reason:"Leg endurance"},
        {eid:"pushup",sets:5,reps:isDeload?10:20,target:0,unit:"BW",reason:"Push endurance"},
        {eid:"plank",sets:3,reps:45,target:0,unit:"sec",reason:"Core"},
        {eid:"pushup",sets:3,reps:25,target:0,unit:"BW",reason:"Push volume after metabolic work"}],
      finisher:"Tabata Burpees 8×20/10"+xf},
    PW:{focus:"Power Day"+dn,warmup:"5 min cardio → bar×10, 95×5, 135×3",
      exs:[{eid:"deadlift",sets:isDeload?3:5,reps:w<=8?3:2,target:r5(dl*.9),unit:"lb",reason:"Heavy pulls"},
        {eid:"bench",sets:4,reps:w<=4?5:3,target:r5(b*.9),unit:"lb",reason:"Speed bench"},
        {eid:"squat",sets:3,reps:w<=4?5:3,target:r5(sq*.85),unit:"lb",reason:"Power squat"},
        {eid:"farmer",sets:4,reps:40,target:r5(dl*.25),unit:"lb/hand",reason:"Heavy carry"}],
      finisher:"5×100m all-out sprints"+xf},
    HB:{focus:"Hybrid Power + Conditioning"+dn,warmup:"5 min cardio → arm circles → bar×10, 95×8",
      exs:[{eid:"bench",sets:4,reps:w<=4?8:6,target:r5(b*.85),unit:"lb",reason:"85% of main target"},
        {eid:accSh,sets:3,reps:accSh==="ohp"?8:12,target:accSh==="ohp"?r5(b*.35):r5(b*.1),unit:"lb",reason:"Shoulder work"},
        {eid:"farmer",sets:isDeload?4:6,reps:40,target:r5(dl*.2),unit:"lb/hand",reason:"Grip + core"},
        {eid:"air_squat",sets:1,reps:100,target:0,unit:"BW",reason:"100-rep Beatdown"}],
      finisher:"5-min AMRAP Burpees"+xf}
  };
  const out=S_[slot]||{focus:"Recovery",exs:[],finisher:"Rest."};
  applyWomenBlueprint(out,slot,w);
  if(S.profile.prefs&&S.profile.prefs.equipment==="home"){
    out.exs=out.exs.map(ex=>{
      if(ex.eid==="bench")return {...ex,eid:"pushup",target:0,unit:"BW",reason:"Home-friendly push alternative"};
      if(ex.eid==="deadlift")return {...ex,eid:"rdl",target:r5((ex.target||0)*0.45),unit:"lb",reason:"DB hinge replacement"};
      if(ex.eid==="squat")return {...ex,eid:"bss",target:r5((ex.target||0)*0.2),unit:"lb/hand",reason:"DB split-squat replacement"};
      return ex;
    });
  }
  if(S.profile.prefs&&S.profile.prefs.style==="burner"){
    out.exs=out.exs.map(ex=>({ ...ex, sets:Math.min(ex.sets,3), reps:typeof ex.reps==="number"?Math.min(ex.reps,15):ex.reps }));
    if(out.finisher&&slot!=="SR"&&slot!=="TR")out.finisher="10-15 min targeted burner: 3 rounds of 12-15 reps per move.";
  }
  const safety=getSafetyMode();
  if(safety==="pregnancy"||safety==="postpartum"){
    const blocked=safety==="pregnancy"
      ?["burpee","int800","tempo","deadlift"]
      :["burpee","int800"];
    out.exs=out.exs.map(ex=>{
      if(!blocked.includes(ex.eid))return ex;
      if(ex.eid==="deadlift")return {...ex,eid:"rdl",target:r5((ex.target||0)*0.35),reason:"Pregnancy-safe hinge swap"};
      if(ex.eid==="int800"||ex.eid==="tempo")return {...ex,eid:"plank",sets:3,reps:45,target:0,unit:"sec",reason:"Safe core conditioning swap"};
      return {...ex,eid:"lunge",sets:3,reps:10,target:0,unit:"BW",reason:"Low-impact safety swap"};
    });
    out.warmup=(out.warmup?out.warmup+" · ":"")+(safety==="pregnancy"
      ?"Prenatal breathing 2 min + gentle mobility + pelvic floor coordination"
      :"Postpartum breathing 2 min + gentle core activation");
    out.finisher=safety==="pregnancy"
      ?"Low-impact finisher: 10-min walk + diaphragmatic breathing"
      :"Postpartum finisher: 8-10 min easy incline walk + core reset";
  }
  return out;
}

export { EX, exById, EX_MEDIA, EX_MEDIA_FEMALE, EX_QUICK_DEMO_VIDEO, EX_MUSCLE_IDS, DEF, S, currentUser, persist, load, save, initFB, cloudPush, mkDay, todayPlanFiltered, applyLog, applyDayAdaptation, rollingPlanForDate, render, renderDash, renderToday, renderProgram, bindDash, bindToday, bindAuthUI };
