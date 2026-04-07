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
  ensurePremiumStylesheet();
  window.HWModular = { state: S, engine: { rollingPlanForDate }, ui: { render }, services: { initFB } };
  await bootstrapApp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { start(); }, { once: true });
} else {
  start();
}
