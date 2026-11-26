/* Nieve navideña: gotitas (como la del logo) con gorro de Papá Noel.
   - Se activa sola del 15 de noviembre al 10 de enero.
   - Forzar para probar: agregar ?nieve=1 a la dirección (apagar: ?nieve=0).
   - Para quitarla del todo: borrar la línea <script src="js/navidad.js"> de index.html. */
(function(){
  var q=''; try{q=new URLSearchParams(location.search).get('nieve')}catch(e){}
  var d=new Date(),m=d.getMonth()+1,dia=d.getDate();
  var epoca=(m===11&&dia>=15)||m===12||(m===1&&dia<=10);
  if(q==='0'||(!epoca&&q!=='1'))return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  var KEY='jrg_nieve_off',off=false;
  try{off=localStorage.getItem(KEY)==='1'}catch(e){}

  var css=
  '#nieve{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:58}'+
  '#nieve.off{display:none}'+
  '#nieve .nd{position:absolute;top:0;will-change:transform;animation:nieve-cae linear infinite}'+
  '#nieve .nd svg{display:block;width:100%;height:auto;animation:nieve-bal ease-in-out infinite alternate;filter:drop-shadow(0 2px 3px rgba(10,42,102,.25))}'+
  '@keyframes nieve-cae{from{transform:translate3d(0,-14vh,0)}to{transform:translate3d(0,112vh,0)}}'+
  '@keyframes nieve-bal{from{transform:translateX(-26px) rotate(-12deg)}to{transform:translateX(26px) rotate(12deg)}}'+
  '#nieve-btn{position:fixed;left:14px;bottom:18px;z-index:61;border:2px solid #fff;border-radius:999px;background:#0A2A66;color:#fff;font:700 .82rem Figtree,system-ui,sans-serif;padding:8px 14px;cursor:pointer;box-shadow:0 6px 18px rgba(10,42,102,.35)}'+
  '#nieve-btn:hover{background:#1565C0}'+
  '@media (max-width:600px){#nieve-btn{bottom:84px;padding:7px 11px;font-size:.75rem}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* gota con carita y gorro (viewBox 64x84) */
  var SVG='<svg viewBox="0 0 64 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+
  '<defs><linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6CC0FF"/><stop offset=".55" stop-color="#1E7BE0"/><stop offset="1" stop-color="#0A4FB0"/></linearGradient></defs>'+
  '<path d="M32 14C32 14 9 40 9 58a23 23 0 0 0 46 0C55 40 32 14 32 14Z" fill="url(#ng)" stroke="#0A2A66" stroke-width="2.2" stroke-linejoin="round"/>'+
  '<path d="M18 52c0-7 4-14 8-19" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>'+
  '<ellipse cx="25" cy="56" rx="4.6" ry="5.6" fill="#fff"/><ellipse cx="39" cy="56" rx="4.6" ry="5.6" fill="#fff"/>'+
  '<circle cx="26" cy="57" r="2.4" fill="#0B1B3A"/><circle cx="40" cy="57" r="2.4" fill="#0B1B3A"/>'+
  '<path d="M22 66c3 8 17 8 20 0Z" fill="#7A1010" stroke="#0A2A66" stroke-width="1.4" stroke-linejoin="round"/>'+
  '<path d="M27 71c3 2.4 7 2.4 10 0c-1.6-2.2-8.4-2.2-10 0Z" fill="#FF6B6B"/>'+
  '<g transform="rotate(-14 32 24)">'+
  '<path d="M17 28C19 12 29 3 47 4c-6 3-8 8-8 14c3 3 7 6 8 10Z" fill="#E2231A" stroke="#8E1010" stroke-width="1.4" stroke-linejoin="round"/>'+
  '<rect x="13" y="25" width="38" height="10" rx="5" fill="#fff" stroke="#C9D6EA" stroke-width="1.2"/>'+
  '<circle cx="48" cy="6" r="5.4" fill="#fff" stroke="#C9D6EA" stroke-width="1.2"/>'+
  '</g></svg>';

  var box=document.createElement('div');box.id='nieve';box.setAttribute('aria-hidden','true');
  var n=(window.innerWidth<700)?11:22,i,e;
  for(i=0;i<n;i++){
    e=document.createElement('div');e.className='nd';
    var s=20+Math.random()*26;                       /* tamaño px */
    e.style.left=(Math.random()*96)+'%';
    e.style.width=s+'px';
    e.style.opacity=(.72+Math.random()*.28).toFixed(2);
    var dur=11+Math.random()*12;                     /* segundos */
    e.style.animationDuration=dur.toFixed(1)+'s';
    e.style.animationDelay='-'+(Math.random()*dur).toFixed(1)+'s';
    e.innerHTML=SVG;
    var sv=e.firstChild;
    sv.style.animationDuration=(3+Math.random()*3).toFixed(1)+'s';
    sv.style.animationDelay='-'+(Math.random()*4).toFixed(1)+'s';
    box.appendChild(e);
  }
  var btn=document.createElement('button');btn.id='nieve-btn';btn.type='button';
  function pinta(){box.classList.toggle('off',off);btn.textContent=off?'❄ Activar nieve':'❄ Quitar nieve';btn.setAttribute('aria-pressed',String(!off))}
  btn.onclick=function(){off=!off;try{localStorage.setItem(KEY,off?'1':'0')}catch(e){}pinta()};
  function monta(){document.body.appendChild(box);document.body.appendChild(btn);pinta()}
  if(document.body)monta();else document.addEventListener('DOMContentLoaded',monta);
})();
