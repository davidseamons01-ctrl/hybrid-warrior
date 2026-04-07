import "./exercises.js";
import { S, initFB } from "./state.js";
import { rollingPlanForDate } from "./engine.js";
import { bootstrapApp, render } from "./ui.js";

function ensurePremiumStylesheet() {
  const href = "./css/styles.css";
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => l.getAttribute("href") === href)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function start() {
  try{
    // #region agent log
    fetch('http://127.0.0.1:7350/ingest/5a792972-80cc-4833-b3b9-85d19829cb21',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3e0776'},body:JSON.stringify({sessionId:'3e0776',runId:'pre-fix-1',hypothesisId:'H1',location:'js/app.js:start',message:'start entered',data:{readyState:document.readyState,hasAuthScreen:!!document.getElementById("authScreen")},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    ensurePremiumStylesheet();
    window.HWModular = { state: S, engine: { rollingPlanForDate }, ui: { render }, services: { initFB } };
    await bootstrapApp();
  }catch(err){
    // #region agent log
    fetch('http://127.0.0.1:7350/ingest/5a792972-80cc-4833-b3b9-85d19829cb21',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3e0776'},body:JSON.stringify({sessionId:'3e0776',runId:'pre-fix-1',hypothesisId:'H2',location:'js/app.js:start:catch',message:'start catch hit',data:{name:err&&err.name,message:err&&err.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error("Hybrid boot failed:",err);
    const auth=document.getElementById("authScreen");
    const setup=document.getElementById("auth-setup");
    const login=document.getElementById("auth-login");
    const loading=document.getElementById("auth-loading");
    if(auth)auth.style.display="flex";
    if(loading)loading.style.display="none";
    if(login)login.style.display="none";
    if(setup)setup.style.display="block";
    const e=document.getElementById("authErr");
    if(e){
      e.textContent="App failed to initialize. Refresh once, then check network/ad-blocker if this persists.";
      e.classList.add("show");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { start(); }, { once: true });
} else {
  start();
}
