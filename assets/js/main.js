const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function pctES(n){ return (Math.round(n*100)/100).toLocaleString("es-ES")+"%"; }
function numES(n){ return Number(n).toLocaleString("es-ES"); }
function getCSSVar(name,fallback){
  const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v||fallback;
}

/* ================= REVEAL ================= */
const reveals=document.querySelectorAll(".reveal");
if(reveals.length){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) entry.target.classList.add("visible");
    });
  });
  reveals.forEach(el=>io.observe(el));
}

/* ================= PROGRESS ================= */
const progressBar=document.getElementById("progressBar");
if(progressBar){
  window.addEventListener("scroll",()=>{
    const h=document.documentElement;
    const p=h.scrollTop/(h.scrollHeight-h.clientHeight);
    progressBar.style.width=(p*100)+"%";
  },{passive:true});
}

/* ================= COUNTER ================= */
document.querySelectorAll("[data-count]").forEach(el=>{
  let done=false;
  const obs=new IntersectionObserver(entries=>{
    if(done)return;
    if(entries[0].isIntersecting){
      done=true;
      const target=Number(el.dataset.count);
      let n=0;
      const interval=setInterval(()=>{
        n+=target/30;
        if(n>=target){n=target;clearInterval(interval);}
        el.textContent=Math.floor(n).toLocaleString("es-ES");
      },20);
    }
  });
  obs.observe(el);
});

/* ================= BAR ================= */
document.querySelectorAll(".barFill").forEach(bar=>{
  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
      bar.style.transition="transform .8s cubic-bezier(.2,.8,.2,1)";
      bar.style.transform="scaleX("+(bar.dataset.value/100)+")";
    }
  });
  obs.observe(bar);
});

/* ================= BACK TOP ================= */
const backTop=document.getElementById("backTop");
if(backTop){
  window.addEventListener("scroll",()=>{
    backTop.style.display=window.scrollY>500?"block":"none";
  },{passive:true});
  backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
}

/* ================= HERO PARALLAX ================= */
const hero=document.getElementById("hero");
let heroY=0,heroS=1,heroDim=0,heroTicking=false;

function setHeroVars(y,s,dim){
  document.documentElement.style.setProperty("--heroY",`${y}px`);
  document.documentElement.style.setProperty("--heroS",`${s}`);
  document.documentElement.style.setProperty("--heroDim",`${dim}`);
}

function computeHeroTargets(){
  if(!hero)return null;
  const rect=hero.getBoundingClientRect();
  const vh=window.innerHeight||document.documentElement.clientHeight;
  if(rect.bottom<=0||rect.top>=vh)return null;

  const heroH=hero.offsetHeight||1;
  const scrolled=clamp(-rect.top,0,heroH);
  const t=clamp(scrolled/heroH,0,1);

  return{y:scrolled*0.30,s:1+(t*0.10),dim:t};
}

function animateHero(){
  heroTicking=false;
  if(!hero||prefersReduced)return;
  const tgt=computeHeroTargets();
  if(!tgt)return;

  const ease=0.10;
  heroY+=(tgt.y-heroY)*ease;
  heroS+=(tgt.s-heroS)*ease;
  heroDim+=(tgt.dim-heroDim)*ease;

  setHeroVars(heroY,heroS,heroDim);

  if(Math.abs(tgt.y-heroY)>0.1||Math.abs(tgt.s-heroS)>0.0005||Math.abs(tgt.dim-heroDim)>0.002){
    requestAnimationFrame(animateHero);
  }
}

function requestHeroTick(){
  if(heroTicking)return;
  heroTicking=true;
  requestAnimationFrame(animateHero);
}

if(hero&&!prefersReduced){
  setHeroVars(0,1,0);
  window.addEventListener("scroll",requestHeroTick,{passive:true});
  window.addEventListener("resize",requestHeroTick);
  requestHeroTick();
}

/* ================= CHARTS ================= */
(()=>{
  const elReuniones=document.getElementById("chartReuniones");
  const elRedes=document.getElementById("chartRedes");
  const elGenero=document.getElementById("chartGenero");
  const elTemas=document.getElementById("chartConsultasTemas");
  const elCG=document.getElementById("chartConsultasGenero");

  const hasCharts=elReuniones&&elRedes&&elGenero&&elTemas&&elCG;
  if(!hasCharts||!window.Chart)return;

  const COLORS={
    dark:"#114632",
    accent:getCSSVar("--accent","#239F71"),
    mid:"#73B09A",
    light:"#ADDDCB",
    slate:"#4D6B60",
    mint:"#E3FCF5",
    men:"rgba(17,70,50,.22)",
    grid:"rgba(0,0,0,.08)"
  };

  Chart.defaults.font.family="system-ui,-apple-system,Segoe UI,Roboto,Arial";
  Chart.defaults.animation.duration=prefersReduced?0:900;
  Chart.defaults.color=COLORS.dark;
  Chart.defaults.borderColor=COLORS.grid;

  /* 🔥 IMPORTANTE: evita el temblor */
  Chart.defaults.interaction={mode:"nearest",intersect:true};
  Chart.defaults.hover={mode:"nearest",intersect:true};

  function verticalGradient(ctx,area,top,bottom){
    const g=ctx.createLinearGradient(0,area.top,0,area.bottom);
    g.addColorStop(0,top);
    g.addColorStop(1,bottom);
    return g;
  }

  function barGradient(chart,top,bottom){
    const{ctx,chartArea}=chart;
    if(!chartArea)return top;
    return verticalGradient(ctx,chartArea,top,bottom);
  }

  const reuniones=[
    {label:"Junta Directiva / Equipo Técnico",value:11},
    {label:"Vocalías Consejo Asesor",value:6},
    {label:"Grupo de Educación",value:11},
    {label:"Comisión Incidencia Política",value:5},
    {label:"Grupo Voluntariado",value:3}
  ];

  const totalReuniones=reuniones.reduce((a,b)=>a+b.value,0);

  new Chart(elReuniones,{
    type:"doughnut",
    data:{
      labels:reuniones.map(d=>d.label),
      datasets:[{
        data:reuniones.map(d=>d.value),
        backgroundColor:[COLORS.accent,COLORS.mid,COLORS.light,COLORS.slate,COLORS.mint],
        borderWidth:0,
        hoverOffset:12,
        cutout:"64%"
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:"bottom"},
        tooltip:{
          callbacks:{
            label:(item)=>{
              const v=item.raw;
              const p=(v/totalReuniones)*100;
              return ` ${item.label}: ${numES(v)} (${pctES(p)})`;
            }
          }
        }
      }
    }
  });

  const redes={
    labels:["X / Twitter","Facebook","Instagram","YouTube"],
    seguidores:[1782,2529,1197,88],
    publicaciones:[200,187,310,4],
    interacciones:[459,3041,1908,493]
  };

  const chartRedes=new Chart(elRedes,{
    type:"bar",
    data:{
      labels:redes.labels,
      datasets:[{
        label:"Seguidores",
        data:redes.seguidores,
        borderWidth:0,
        borderRadius:10,
        backgroundColor:(ctx)=>barGradient(ctx.chart,COLORS.accent,COLORS.light)
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:(item)=>` ${item.dataset.label}: ${numES(item.raw)}`}}
      },
      scales:{
        y:{beginAtZero:true,grid:{color:COLORS.grid}},
        x:{grid:{display:false}}
      }
    }
  });

  const tabs=Array.from(document.querySelectorAll(".tab"));
  function setActiveTab(btn){
    tabs.forEach(t=>{
      const active=t===btn;
      t.classList.toggle("is-active",active);
      t.setAttribute("aria-selected",active?"true":"false");
      t.tabIndex=active?0:-1;
    });
    const metric=btn.dataset.m;
    const pretty=metric==="seguidores"?"Seguidores":metric==="publicaciones"?"Publicaciones":"Interacciones";
    chartRedes.data.datasets[0].label=pretty;
    chartRedes.data.datasets[0].data=redes[metric];
    chartRedes.update();
  }

  tabs.forEach(btn=>{
    btn.addEventListener("click",()=>setActiveTab(btn));
  });

})();
