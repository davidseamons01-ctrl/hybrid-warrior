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
async function loadFBSDK(){if(typeof firebase!=="undefined"&&firebase.app)return;const ld=s=>new Promise((r,j)=>{const el=document.createElement("script");el.src=s;el.onload=r;el.onerror=j;document.head.appendChild(el)});await ld("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");await ld("https://www.gstatic.com/firebasejs/10.12.4/firebase-auth-compat.js");await ld("https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js")}
function getSavedCfg(){try{return JSON.parse(localStorage.getItem("hw-fb-config")||"")}catch{return null}}
function saveCfg(c){localStorage.setItem("hw-fb-config",JSON.stringify(c))}
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
function getResolvedFirebaseConfig(){return getSavedCfg()||getEmbeddedFirebaseConfig()}
async function initFB(cfg){
  await loadFBSDK();
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
}
async function doSignOut(){
  offlineMode=false;
  if(fbAuth)await fbAuth.signOut();
  currentUser=null;
  document.getElementById("authScreen").style.display="flex";
  document.getElementById("mainNav").style.display="none";
  document.getElementById("app").style.display="none";
  getResolvedFirebaseConfig()?showAuthLogin():showAuthSetup();
}
function showAuthSetup(){
  document.getElementById("auth-setup").style.display="block";
  document.getElementById("auth-login").style.display="none";
  document.getElementById("auth-loading").style.display="none";
  const cfgInput=document.getElementById("auth-cfg");
  if(cfgInput)cfgInput.value="";
}
function applyAuthTabUI(){
  document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x.dataset.m===authMode));
  const go=document.getElementById("auth-go");
  if(go)go.textContent=authMode==="in"?"Sign In":"Create Account";
  const fg=document.getElementById("auth-forgot");
  if(fg)fg.style.display=authMode==="in"?"inline-flex":"none";
}
function showAuthLogin(){
  document.getElementById("auth-setup").style.display="none";
  document.getElementById("auth-login").style.display="block";
  document.getElementById("auth-loading").style.display="none";
  applyAuthTabUI();
}
function showAuthLoading(){
  document.getElementById("auth-setup").style.display="none";
  document.getElementById("auth-login").style.display="none";
  document.getElementById("auth-loading").style.display="block";
}
function showAuthErr(m){const el=document.getElementById("authErr");el.textContent=m;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),6000)}
function parseFirebaseConfig(raw){
  const txt=(raw||"").trim();
  if(!txt)throw new Error("Paste your Firebase config first.");
  let obj=null;
  // Case 1: pure JSON object
  try{obj=JSON.parse(txt)}catch{}
  // Case 2: pasted JS snippet like: const firebaseConfig = { ... };
  if(!obj){
    const m=txt.match(/\{[\s\S]*\}/);
    if(m){
      let block=m[0].replace(/,\s*([}\]])/g,"$1"); // remove trailing commas
      try{obj=JSON.parse(block)}catch{}
    }
  }
  if(!obj||typeof obj!=="object")throw new Error("Invalid config format. Paste the full firebaseConfig object.");
  return normalizeFirebaseConfigObject(obj);
}

function bindAuthUI(){
  document.getElementById("auth-cfg-save").onclick=async()=>{
    try{
      const cfg=parseFirebaseConfig(document.getElementById("auth-cfg").value);
      saveCfg(cfg);
      showAuthLoading();
      await initFB(cfg);
      authMode="up";
      showAuthLogin();
      toast("Config saved — create your account below.");
    }catch(e){
      showAuthErr(e.message||"Invalid config JSON.");
      showAuthSetup();
    }
  };
  document.querySelectorAll(".auth-tab").forEach(t=>t.onclick=()=>{authMode=t.dataset.m;applyAuthTabUI()});
  document.getElementById("auth-forgot").onclick=async()=>{
    const em=document.getElementById("auth-email").value.trim();
    if(!em){showAuthErr("Enter your email, then tap Forgot password.");return}
    if(!fbAuth){showAuthErr("Connect Firebase first.");return}
    try{await fbAuth.sendPasswordResetEmail(em);toast("Check your email for a reset link.")}catch(e){showAuthErr(e.message||"Could not send reset email.")}
  };
  document.getElementById("auth-go").onclick=async()=>{const em=document.getElementById("auth-email").value.trim(),pw=document.getElementById("auth-pass").value;if(!em||!pw){showAuthErr("Enter email and password.");return}if(pw.length<6){showAuthErr("Password must be 6+ characters.");return}try{showAuthLoading();let u;if(authMode==="in"){const c=await fbAuth.signInWithEmailAndPassword(em,pw);u=c.user}else{const c=await fbAuth.createUserWithEmailAndPassword(em,pw);u=c.user;try{await u.sendEmailVerification()}catch(err){console.warn(err)}}await enterApp(u)}catch(e){showAuthLogin();showAuthErr(e.code==="auth/user-not-found"?"No account. Switch to Create Account.":e.code==="auth/wrong-password"||e.code==="auth/invalid-credential"?"Wrong email or password.":e.code==="auth/email-already-in-use"?"Email in use. Switch to Sign In.":e.message)}};
  document.getElementById("auth-change-cfg").onclick=()=>showAuthSetup();
  document.getElementById("auth-pass").onkeydown=e=>{if(e.key==="Enter")document.getElementById("auth-go").click()};
}

