const reveals=document.querySelectorAll(".reveal")
const io=new IntersectionObserver(e=>{
e.forEach(x=>{
if(x.isIntersecting){
x.target.classList.add("visible")
}
})
})
reveals.forEach(r=>io.observe(r))

window.addEventListener("scroll",()=>{
const h=document.documentElement
const p=h.scrollTop/(h.scrollHeight-h.clientHeight)
document.getElementById("progressBar").style.width=p*100+"%"
})

document.querySelectorAll("[data-count]").forEach(el=>{
let done=false
new IntersectionObserver(e=>{
if(done)return
if(e[0].isIntersecting){
done=true
let t=Number(el.dataset.count)
let n=0
const i=setInterval(()=>{
n+=t/30
if(n>=t){n=t;clearInterval(i)}
el.textContent=Math.floor(n).toLocaleString()
},20)
}
}).observe(el)
})

document.querySelectorAll(".barFill").forEach(bar=>{
new IntersectionObserver(e=>{
if(e[0].isIntersecting){
bar.style.transition="transform .7s"
bar.style.transform="scaleX("+(bar.dataset.value/100)+")"
}
}).observe(bar)
})

const back=document.getElementById("backTop")
window.addEventListener("scroll",()=>{
back.style.display=window.scrollY>500?"block":"none"
})
back.onclick=()=>window.scrollTo({top:0,behavior:"smooth"})
