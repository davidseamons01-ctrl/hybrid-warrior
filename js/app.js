import "./exercises.js?v=h53c012fb1c9c";
import { S, initFB } from "./state.js?v=h53c012fb1c9c";
import { rollingPlanForDate } from "./engine.js?v=h53c012fb1c9c";
import { bootstrapApp, render } from "./ui.js?v=h53c012fb1c9c";

function ensurePremiumStylesheet() {
  const href = "./css/styles.css?v=h53c012fb1c9c";
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => (l.getAttribute("href") || "").indexOf("css/styles.css") !== -1)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function start() {
  try{
    ensurePremiumStylesheet();
    window.HWModular = { state: S, engine: { rollingPlanForDate }, ui: { render }, services: { initFB } };
    await bootstrapApp();
  }catch(err){
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
