import "./exercises.js?v=20260407r1";
import { S, initFB } from "./state.js?v=20260407r1";
import { rollingPlanForDate } from "./engine.js?v=20260407r1";
import { bootstrapApp, render } from "./ui.js?v=20260407r1";

function traceBoot(step, data) {
  try {
    const row = `${new Date().toISOString()} | ${step} | ${JSON.stringify(data || {})}`;
    const key = "hw-debug-trace";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    prev.push(row);
    localStorage.setItem(key, JSON.stringify(prev.slice(-20)));
    const el = document.getElementById("authErr");
    if (el) {
      el.textContent = row;
      el.classList.add("show");
    }
  } catch {}
}

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
    traceBoot("app.start.enter", { readyState: document.readyState });
    // #region agent log
    fetch('http://127.0.0.1:7350/ingest/5a792972-80cc-4833-b3b9-85d19829cb21',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3e0776'},body:JSON.stringify({sessionId:'3e0776',runId:'pre-fix-1',hypothesisId:'H1',location:'js/app.js:start',message:'start entered',data:{readyState:document.readyState,hasAuthScreen:!!document.getElementById("authScreen")},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    ensurePremiumStylesheet();
    traceBoot("app.start.stylesheet.ok");
    window.HWModular = { state: S, engine: { rollingPlanForDate }, ui: { render }, services: { initFB } };
    traceBoot("app.start.modular.ok");
    await bootstrapApp();
    traceBoot("app.start.bootstrap.done");
  }catch(err){
    traceBoot("app.start.catch", { name: err && err.name, message: err && err.message });
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
      e.textContent=`App failed to initialize: ${err&&err.message?err.message:"unknown error"}`;
      e.classList.add("show");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { start(); }, { once: true });
} else {
  start();
}
