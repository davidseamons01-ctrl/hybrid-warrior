// Runtime engine extracted from inline script
const PLANS=(function(){
  const G=["strength","hybrid","fat_loss","muscle"];
  const gN=["Strength","Hybrid Athlete","Fat Loss","Hypertrophy"];
  const fN=["3-4 Day","5-6 Day"];
  const dN=["Express","Full"];
  const sN=["Men's","Women's"];
  const eN=["Foundation","Advanced"];

  const base={
    strength:{
      "00":["FB","SR","FB"],           "01":["HP","SR","HL","TR"],
      "10":["HP","SR","HL","TR","HB"], "11":["HP","HPL","HL","SR","PW"]
    },
    hybrid:{
      "00":["FB","SR","FB"],           "01":["HP","SR","HL","TR"],
      "10":["HP","SR","HL","TR","HB"], "11":["HP","SR","HL","TR","HB"]
    },
    fat_loss:{
      "00":["CT","SR","FBC"],          "01":["HB","SR","CT","TR"],
      "10":["CT","SR","HB","TR","CT"], "11":["HB","SR","HL","TR","CT"]
    },
    muscle:{
      "00":["FB","FB","FB"],           "01":["HYP","HYG","HYL"],
      "10":["HYP","HYL","HYG","HB","CT"],"11":["HYP","HYL","HYG","HP","HL"]
    }
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
    if(s===1) sl=feminizeSlots(G[g],sl,d===0);
    if(e===0) sl=sl.map(x=>x==="PW"?"FB":x==="HPL"?"FB":x);
    plans.push({id:g*16+f*8+d*4+s*2+e,name:`${sN[s]} ${gN[g]} · ${fN[f]} ${dN[d]} (${eN[e]})`,goal:G[g],slots:sl});
  }
  return plans;
})();

function isWomensPlanSelected(){
  const pid=S.planId!=null?S.planId:0;
  return (((pid>>1)&1)===1);
}

function selectPlan(){
  const fa=S.goals.focusAreas||[];
  const lift=fa.some(a=>["Bench Press","Squat","Deadlift"].includes(a));
  const run=fa.includes("5K Running");
  const fat=fa.includes("Lose Weight")||fa.includes("Improve Conditioning");
  const musc=fa.includes("Build Muscle");
  const femShape=fa.some(a=>["Hourglass Shape","Glute Shelf","Posture & Back Tone","Pilates Plus Tone"].includes(a));
  let g=lift&&!run&&!fat?0:lift&&run?1:fat?2:musc?3:(femShape?3:1);
  const f=S.schedule.days.length>=5?1:0;
  const expressBias=(S.profile.prefs&&S.profile.prefs.style==="burner")||S.schedule.sessionMin<=35;
  const d=expressBias?0:(S.schedule.sessionMin>45?1:0);
  const s=S.profile.sex==="female"?1:0;
  const total=(S.profile.bench1RM||0)+(S.profile.squat1RM||0)+(S.profile.dead1RM||0);
  const e=S.profile.weight>0&&total/S.profile.weight>3.5?1:0;
  if(S.profile.sex==="female"&&fa.length){
    const hasPilates=fa.includes("Pilates Plus Tone");
    const hasHourglass=fa.includes("Hourglass Shape");
    const hasGluteShelf=fa.includes("Glute Shelf");
    const hasPosture=fa.includes("Posture & Back Tone");
    const hasConditioning=fa.includes("Improve Conditioning")||fa.includes("Lose Weight");
    if((hasHourglass||hasGluteShelf||hasPosture||hasPilates)&&!lift&&!run){
      g=hasConditioning?2:3;
    }
  }
  return g*16+f*8+d*4+s*2+e;
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
function useWomenSoftUi(){return S.profile.sex==="female"&&(S.profile.prefs||{}).womenSimpleUi!==false}
function planCompactOn(){return useWomenSoftUi()?sessionStorage.getItem("hw-plan-compact")!=="0":sessionStorage.getItem("hw-plan-compact")==="1"}
function applyVisualTheme(forceNeutral=false){
  const b=document.body;
  if(!b)return;
  b.classList.remove("theme-neutral","theme-feminine","theme-masculine","women-vivid");
  const m=document.getElementById("meta-theme");
    if(forceNeutral||!S.profile.onboarded){
    b.classList.add("theme-neutral");
  }else if(S.profile.sex==="female"){
    b.classList.add("theme-feminine");
    if(useWomenSoftUi())b.classList.add("women-vivid");
  }else{
    b.classList.add("theme-masculine");
  }
  applyAppearanceMeta(m);
}
function applyAppearanceMeta(m){
  m=m||document.getElementById("meta-theme");if(!m)return;
  if((S.profile.prefs||{}).appearance==="light"){
    document.body.classList.add("appearance-light");
    const pink=document.body.classList.contains("theme-feminine")&&document.body.classList.contains("women-vivid");
    m.setAttribute("content",pink?"#fff5f9":"#e8eaef");
    return
  }
  document.body.classList.remove("appearance-light");
  if(document.body.classList.contains("theme-feminine")){
    m.setAttribute("content",document.body.classList.contains("women-vivid")?"#1a121c":"#1e1c24");
  }else if(document.body.classList.contains("theme-masculine"))m.setAttribute("content","#181b22");
  else m.setAttribute("content","#17171d");
}

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

// ═══════════════════════════════════════════════════════════
//  PROGRAM ENGINE — Slot-Based Day Generator
// ═══════════════════════════════════════════════════════════
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
      exs:[        {eid:"tempo",sets:1,reps:isDeload?16:w<=4?20:w<=8?24:w<=12?28:16,target:Math.round(pmi),unit:fmtPace(Math.round(pmi)),reason:`Threshold from est 5K ${mmss(Math.round(fk))}`},
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

function getSafetyMode(){
  if(S.profile.sex!=="female")return "none";
  const life=((S.profile.prefs||{}).lifeStage||"general");
  const wm=((S.profile.prefs||{}).womenMode||"auto");
  const fa=S.goals.focusAreas||[];
  if(life==="pregnancy"||wm==="pregnancy"||fa.includes("Pregnancy Safe"))return "pregnancy";
  if(life==="postpartum"||wm==="postpartum"||fa.includes("Postpartum Recovery"))return "postpartum";
  return "none";
}

function weeklyExpectedChanges(){
  const plan=PLANS[S.planId!=null?S.planId:0];
  const slots=plan?plan.slots:[];
  const W={
    glutes:{HL:3,GL:4,HYG:4,HB:2,FBC:1,CT:1,FB:2},
    core:{CT:4,FBC:3,SR:2,TR:2,HB:2,FB:2,GL:2,HYG:2},
    back:{HPL:4,HYL:4,HP:2,FB:2,HB:1,PW:2},
    posture:{HPL:4,HYL:3,GL:2,HP:2,FB:2,TR:1,SR:1}
  };
  const score={glutes:0,core:0,back:0,posture:0};
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

function slotMeta(slot){
  const meta={
    HP:{muscles:"Chest, triceps, upper-back balance",why:"Build pressing strength and upper-body muscle while keeping shoulders healthy.",expect:"Bench/press numbers trend up; chest and arm growth."},
    HPL:{muscles:"Lats, mid-back, rear delts, grip",why:"Improve posture and pulling strength to support an athletic frame.",expect:"Back width and posture improve; stronger pulling."},
    HL:{muscles:"Quads, glutes, hamstrings, trunk",why:"Heavy lower-body loading drives global strength and body recomposition.",expect:"Leg/hip strength rises and calorie burn stays high."},
    GL:{muscles:"Glute max/medius, hamstrings, core",why:"Emphasizes lower-body shape, hip stability, and spinal support.",expect:"Better glute development, hip stability, and lower-body tone."},
    SR:{muscles:"Cardio system, calves, hips, core",why:"Intervals improve speed and 5K performance with measurable pacing targets.",expect:"Faster splits and improved aerobic power."},
    TR:{muscles:"Cardio system, posterior chain, core",why:"Tempo work improves endurance at hard sustainable pace.",expect:"Lower race pace and improved stamina."},
    FB:{muscles:"Full-body",why:"Efficient full-body stimulus when time is limited.",expect:"Steady strength and body-composition progress."},
    FBC:{muscles:"Full-body + cardio",why:"Circuit density increases calorie burn while preserving strength work.",expect:"Higher work capacity and fat-loss support."},
    HYP:{muscles:"Chest, shoulders, triceps",why:"Higher-volume upper pushing for visible muscle gain.",expect:"More upper-body fullness and definition."},
    HYL:{muscles:"Back, rear delts, biceps, grip",why:"Volume pulling for back shape and shoulder balance.",expect:"Improved V-taper look and posture."},
    HYG:{muscles:"Glutes, quads, hamstrings",why:"Leg-focused hypertrophy for shape and strength.",expect:"Leg and glute growth with stronger lower body."},
    CT:{muscles:"Full-body conditioning",why:"Low-barrier circuits improve fitness and support weight-loss goals.",expect:"Higher daily calorie burn and improved conditioning."},
    PW:{muscles:"Full-body neural power",why:"High-intensity low-rep work improves force production.",expect:"Explosive strength and athletic power increase."},
    HB:{muscles:"Upper body, core, conditioning",why:"Hybrid day bridges strength and conditioning for balanced performance.",expect:"Strength maintenance with high work output."}
  };
  return meta[slot]||null;
}

// ═══════════════════════════════════════════════════════════
//  ADAPTATION ENGINE
// ═══════════════════════════════════════════════════════════
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
function markFatigueFromSession(dateStr){
  if(!S.fatigue)S.fatigue={sessionHardStreak:0,lastSessionIso:"",pendingDeload:false};
  if(S.fatigue.lastSessionIso===dateStr)return;
  const dayRows=(S.logs||[]).filter(l=>l.date===dateStr);
  if(!dayRows.length)return;
  const failCount=dayRows.filter(r=>r.outcome==="fail").length;
  const hardCount=dayRows.filter(r=>(r.liftFeel||"")==="hard").length;
  const hardSession=(failCount>0)||(hardCount>=Math.max(1,Math.ceil(dayRows.length*0.5)));
  S.fatigue.sessionHardStreak=hardSession?(Number(S.fatigue.sessionHardStreak)||0)+1:0;
  S.fatigue.lastSessionIso=dateStr;
  if(failCount>0||S.fatigue.sessionHardStreak>=2)S.fatigue.pendingDeload=true;
}
function applyFatigueDeload(){
  if(!S.fatigue)S.fatigue={sessionHardStreak:0,lastSessionIso:"",pendingDeload:false};
  S.adapt.bench=clamp(S.adapt.bench*0.9,.8,1.25);
  S.adapt.squat=clamp(S.adapt.squat*0.9,.8,1.25);
  S.adapt.dead=clamp(S.adapt.dead*0.9,.8,1.25);
  S.adapt.run=clamp(S.adapt.run*0.95,.8,1.2);
  S.fatigue.pendingDeload=false;
  S.fatigue.sessionHardStreak=0;
}
function warmupSteps(w){
  const txt=String(w||"").trim();
  if(!txt)return[];
  return txt.split(/\s*(?:→|\+|\.|;|\n)\s*/).map(x=>x.trim()).filter(Boolean);
}
function enrichWarmupForRecovery(plan,dateIso){
  if(!plan||!plan.warmup)return plan;
  const prev=(S.logs||[]).filter(l=>l.date<dateIso).map(l=>l.date).sort().pop();
  if(!prev)return plan;
  const pp=rollingPlanForDate(prev);
  const heavy=(pp.exs||[]).filter(ex=>{const e=exById(ex.eid);const t=(e&&e.tags)||[];return t.includes("legs")||t.includes("lower")||t.includes("glutes")||t.includes("hamstrings");}).length;
  if(heavy<2)return plan;
  if(String(plan.warmup).includes("Recovery Focus:"))return plan;
  return {...plan,warmup:plan.warmup+" · Recovery Focus: Extra 3-min hamstring/glute mobility"};
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
    if(actualReps<plannedReps*0.95)liftScore*=0.97; // did not complete planned reps
    liftScore=clamp(liftScore,.6,1.4);
    const tw=clamp((liftScore-1)*.08,-.025,.025);
    if(type==="bench"){S.adapt.bench=clamp(S.adapt.bench+tw,.88,1.25);if(bestEst>S.profile.bench1RM*1.01)S.profile.bench1RM=Math.round(bestEst);touched++}
    else if(type==="squat"){S.adapt.squat=clamp(S.adapt.squat+tw,.88,1.25);if(bestEst>S.profile.squat1RM*1.01)S.profile.squat1RM=Math.round(bestEst);touched++}
    else if(type==="dead"){S.adapt.dead=clamp(S.adapt.dead+tw,.88,1.25);if(bestEst>S.profile.dead1RM*1.01)S.profile.dead1RM=Math.round(bestEst);touched++}
  }
  markFatigueFromSession(dateStr);
  return touched;
}

