const prefersReduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches
function pctES(n){return(Math.round(n*100)/100).toLocaleString("es-ES")+"%"}
function numES(n){return Number(n).toLocaleString("es-ES")}
function getCSSVar(n,f){const v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||f}

const reveals=document.querySelectorAll(".reveal")
if(reveals.length){
  const io=new IntersectionObserver(e=>{e.forEach(x=>x.isIntersecting&&x.target.classList.add("visible"))})
  reveals.forEach(r=>io.observe(r))
}

const progressBar=document.getElementById("progressBar")
if(progressBar){
  window.addEventListener("scroll",()=>{
    const h=document.documentElement
    const p=h.scrollTop/(h.scrollHeight-h.clientHeight)
    progressBar.style.width=p*100+"%"
  },{passive:true})
}

const backTop=document.getElementById("backTop")
if(backTop){
  window.addEventListener("scroll",()=>{backTop.style.display=window.scrollY>500?"block":"none"},{passive:true})
  backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}))
}

document.querySelectorAll("[data-count]").forEach(el=>{
  let done=false
  new IntersectionObserver(e=>{
    if(done)return
    if(e[0].isIntersecting){
      done=true
      const t=Number(el.dataset.count)
      let n=0
      const i=setInterval(()=>{
        n+=t/30
        if(n>=t){n=t;clearInterval(i)}
        el.textContent=Math.floor(n).toLocaleString("es-ES")
      },20)
    }
  },{threshold:.35}).observe(el)
})

document.querySelectorAll(".barFill").forEach(bar=>{
  new IntersectionObserver(e=>{
    if(e[0].isIntersecting){
      bar.style.transition="transform .8s cubic-bezier(.2,.8,.2,1)"
      bar.style.transform="scaleX("+(bar.dataset.value/100)+")"
    }
  },{threshold:.35}).observe(bar)
})

const zoomSections=[...document.querySelectorAll("[data-zoom]")]
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n))

function applyZoom(){
  if(prefersReduced)return
  const vh=window.innerHeight
  zoomSections.forEach(sec=>{
    const img=sec.querySelector(".hero__img,.impact__img")
    if(!img)return
    const r=sec.getBoundingClientRect()
    const prog=clamp(1-((r.top+vh)/(vh+r.height)),0,1)
    const scale=1.08+prog*0.10
    const y=(prog-0.5)*-24
    img.style.transform=`translate3d(0,${y}px,0) scale(${scale})`
  })
}

if(zoomSections.length&&!prefersReduced){
  applyZoom()
  window.addEventListener("scroll",applyZoom,{passive:true})
  window.addEventListener("resize",applyZoom)
}

(()=>{
  if(!window.Chart)return

  const COLORS={
    dark:"#114632",
    accent:getCSSVar("--accent","#239F71"),
    mid:"#73B09A",
    light:"#ADDDCB",
    slate:"#4D6B60",
    mint:"#E3FCF5",
    men:"rgba(17,70,50,.22)",
    grid:"rgba(0,0,0,.08)"
  }

  Chart.defaults.font.family="system-ui,-apple-system,Segoe UI,Roboto,Arial"
  Chart.defaults.animation.duration=prefersReduced?0:900
  Chart.defaults.color=COLORS.dark
  Chart.defaults.borderColor=COLORS.grid
  Chart.defaults.interaction={mode:"nearest",intersect:true}
  Chart.defaults.hover={mode:"nearest",intersect:true}

  function verticalGradient(ctx,area,t,b){
    const g=ctx.createLinearGradient(0,area.top,0,area.bottom)
    g.addColorStop(0,t)
    g.addColorStop(1,b)
    return g
  }
  function barGradient(chart,t,b){
    const{ctx,chartArea}=chart
    if(!chartArea)return t
    return verticalGradient(ctx,chartArea,t,b)
  }

  const charts={}

  const reuniones=[
    {label:"Junta Directiva / Equipo Técnico",value:11},
    {label:"Vocalías Consejo Asesor",value:6},
    {label:"Grupo de Educación",value:11},
    {label:"Comisión Incidencia Política",value:5},
    {label:"Grupo Voluntariado",value:3}
  ]

  const redes={
    labels:["X / Twitter","Facebook","Instagram","YouTube"],
    seguidores:[1782,2529,1197,88],
    publicaciones:[200,187,310,4],
    interacciones:[459,3041,1908,493]
  }

  const generoActividades=[
    {label:"Asamblea",mujeres:73.53,hombres:26.47},
    {label:"Reuniones ONGs (2)",mujeres:76.06,hombres:23.94},
    {label:"Junta Directiva",mujeres:66.56,hombres:33.44},
    {label:"Vocalías Consejo Asesor",mujeres:68.02,hombres:31.98},
    {label:"Grupo Educación",mujeres:74.02,hombres:25.98},
    {label:"Incidencia política",mujeres:65,hombres:35},
    {label:"Voluntariado",mujeres:86.67,hombres:13.33},
    {label:"Formaciones",mujeres:79.71,hombres:20.29},
    {label:"30 años (institucional)",mujeres:71.21,hombres:28.79},
    {label:"30 años (encuentro ONGs)",mujeres:76.67,hombres:23.23},
    {label:"Coord. estatal / Red CCAA",mujeres:74.67,hombres:25.33}
  ]

  const consultasTemas=[
    {label:"Normativas",total:63,mujeres:90.48,hombres:9.52},
    {label:"Cuestiones administrativas",total:6,mujeres:66.67,hombres:33.33},
    {label:"Inf. ciudadana / otras ONGs",total:13,mujeres:69.23,hombres:30.77},
    {label:"Instituciones",total:10,mujeres:70,hombres:30},
    {label:"Coord. autonómicas",total:3,mujeres:100,hombres:0},
    {label:"Acogida ONGs CONGDEX",total:13,mujeres:100,hombres:0},
    {label:"Otras",total:13,mujeres:84.62,hombres:15.38}
  ]

  const elReuniones=document.getElementById("chartReuniones")
  if(elReuniones){
    const total=reuniones.reduce((a,b)=>a+b.value,0)
    charts.chartReuniones=new Chart(elReuniones,{
      type:"doughnut",
      data:{labels:reuniones.map(d=>d.label),datasets:[{data:reuniones.map(d=>d.value),backgroundColor:[COLORS.accent,COLORS.mid,COLORS.light,COLORS.slate,COLORS.mint],borderWidth:0,hoverOffset:12,cutout:"64%"}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:i=>{const v=i.raw;const p=v/total*100;return` ${i.label}: ${numES(v)} (${pctES(p)})`}}}}}
    })
  }

  const elRedes=document.getElementById("chartRedes")
  if(elRedes){
    charts.chartRedes=new Chart(elRedes,{
      type:"bar",
      data:{labels:redes.labels,datasets:[{label:"Seguidores",data:redes.seguidores,borderWidth:0,borderRadius:10,backgroundColor:c=>barGradient(c.chart,COLORS.accent,COLORS.light)}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>` ${i.dataset.label}: ${numES(i.raw)}`}}},scales:{y:{beginAtZero:true,grid:{color:COLORS.grid}},x:{grid:{display:false}}}}
    })

    const tabs=[...document.querySelectorAll(".tab")]
    const update=m=>{
      const pretty=m==="seguidores"?"Seguidores":m==="publicaciones"?"Publicaciones":"Interacciones"
      charts.chartRedes.data.datasets[0].label=pretty
      charts.chartRedes.data.datasets[0].data=redes[m]
      charts.chartRedes.update()
    }
    tabs.forEach(btn=>btn.addEventListener("click",()=>{
      tabs.forEach(b=>b.classList.remove("is-active"))
      btn.classList.add("is-active")
      update(btn.dataset.m)
    }))
  }

  const elGenero=document.getElementById("chartGenero")
  if(elGenero){
    charts.chartGenero=new Chart(elGenero,{
      type:"bar",
      data:{labels:generoActividades.map(d=>d.label),datasets:[
        {label:"Mujeres (%)",data:generoActividades.map(d=>d.mujeres),stack:"s",borderWidth:0,borderRadius:8,backgroundColor:c=>barGradient(c.chart,COLORS.accent,COLORS.light)},
        {label:"Hombres (%)",data:generoActividades.map(d=>d.hombres),stack:"s",borderWidth:0,borderRadius:8,backgroundColor:COLORS.men}
      ]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:i=>` ${i.dataset.label}: ${pctES(i.raw)}`}}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+"%"},grid:{color:COLORS.grid}},y:{ticks:{autoSkip:false},grid:{display:false}}}}
    })
  }

  const elTemas=document.getElementById("chartConsultasTemas")
  if(elTemas){
    charts.chartConsultasTemas=new Chart(elTemas,{
      type:"bar",
      data:{labels:consultasTemas.map(d=>d.label),datasets:[{label:"Consultas",data:consultasTemas.map(d=>d.total),borderWidth:0,borderRadius:10,backgroundColor:c=>barGradient(c.chart,COLORS.mid,COLORS.mint)}]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>` ${i.dataset.label}: ${numES(i.raw)}`}}},scales:{x:{beginAtZero:true,grid:{color:COLORS.grid}},y:{grid:{display:false}}}}
    })
  }

  const elCG=document.getElementById("chartConsultasGenero")
  if(elCG){
    charts.chartConsultasGenero=new Chart(elCG,{
      type:"bar",
      data:{labels:consultasTemas.map(d=>d.label),datasets:[
        {label:"Mujeres (%)",data:consultasTemas.map(d=>d.mujeres),stack:"g",borderWidth:0,borderRadius:8,backgroundColor:c=>barGradient(c.chart,COLORS.accent,COLORS.light)},
        {label:"Hombres (%)",data:consultasTemas.map(d=>d.hombres),stack:"g",borderWidth:0,borderRadius:8,backgroundColor:COLORS.men}
      ]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:"y",plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:i=>` ${i.dataset.label}: ${pctES(i.raw)}`}}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+"%"},grid:{color:COLORS.grid}},y:{ticks:{autoSkip:false},grid:{display:false}}}}
    })
  }

  document.querySelectorAll("[data-dl]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.dl
      const chart=charts[id]
      if(!chart)return
      const a=document.createElement("a")
      a.href=chart.toBase64Image("image/png",1)
      a.download=id+".png"
      a.click()
    })
  })

  let to=null
  window.addEventListener("resize",()=>{
    clearTimeout(to)
    to=setTimeout(()=>{Object.values(charts).forEach(c=>c&&c.update())},150)
  })
})()
