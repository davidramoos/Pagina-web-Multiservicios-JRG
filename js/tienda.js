(function(){
const nz=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const qs=new URLSearchParams('');
const st={q:qs.get('q')||'',s:'',b:qs.get('marca')||'',v:'',pr:'',x:'',o:'',d:false,n:24};let cat=qs.get('cat')||'';
if(!CATS.some(c=>c[0]===cat))cat='';
$('#pq').value=st.q;
const inCat=()=>P.filter(p=>!cat||p.c===cat);
const lab=k=>(CATS.find(c=>c[0]===k)||[,''])[1];
function chips(){$('#cats').innerHTML=CATS.map(c=>`<button class="chip${c[0]===cat?' on':''}" data-c="${c[0]}">${c[1]}${c[0]?` <small>${P.filter(p=>p.c===c[0]).length}</small>`:''}</button>`).join('')}
function opts(id,label,vals,cur){const u=[...new Set(vals.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));const el=$(id);el.innerHTML=`<option value="">${label}</option>`+u.map(v=>`<option${v===cur?' selected':''}>${esc(v)}</option>`).join('');el.hidden=u.length<2&&!cur;return u}
function filtros(){const l=inCat();
 opts('#fs','Todas las subcategorías',l.map(p=>p.s),st.s);
 const bs=opts('#fb','Todas las marcas',l.map(p=>p.b),st.b);if(st.b&&!bs.includes(st.b))st.b='';
 opts('#fv','Compatible con…',l.map(p=>p.v),st.v);
 opts('#fp','Presentación',l.map(p=>p.pr),st.pr);
 opts('#fx','Viscosidad',l.map(p=>p.x),st.x)}
function render(){const q=nz(st.q);
 let l=inCat().filter(p=>(!st.s||p.s===st.s)&&(!st.b||p.b===st.b)&&(!st.v||p.v===st.v)&&(!st.pr||p.pr===st.pr)&&(!st.x||p.x===st.x)&&(!st.d||p.st)&&(!q||q.split(/\s+/).every(w=>nz(p.n+' '+p.b+' '+p.s+' '+p.v+' '+lab(p.c)).includes(w))));
 if(st.o==='min')l.sort((a,b)=>a.p-b.p);if(st.o==='max')l.sort((a,b)=>b.p-a.p);if(st.o==='az')l.sort((a,b)=>a.n.localeCompare(b.n,'es',{numeric:true}));
 $('#pcount').textContent=l.length.toLocaleString('es-CO')+(l.length===1?' producto':' productos')+(cat?' en '+lab(cat):'');
 $('#pgrid').innerHTML=l.length?l.slice(0,st.n).map(cardHTML).join(''):'<div class="empty"><p>No encontramos productos con ese filtro. Prueba otra categoría o quita algún filtro.</p><p>¿Buscas una referencia específica? <a class="lnk" href="https://wa.me/573125529044?text=Hola%20Multiservicios%20JRG%2C%20estoy%20buscando%20un%20producto%20que%20no%20encontr%C3%A9%20en%20la%20tienda." target="_blank" rel="noopener">Escríbenos por WhatsApp</a> y te ayudamos.</p></div>';
 $('#more').hidden=l.length<=st.n;$('#more').textContent='Mostrar más ('+(l.length-st.n).toLocaleString('es-CO')+' restantes)'}
$('#cats').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;cat=b.dataset.c;Object.assign(st,{s:'',b:'',v:'',pr:'',x:'',n:24});chips();filtros();render()};
$('#pq').oninput=e=>{st.q=e.target.value;st.n=24;render()};
[['fs','s'],['fb','b'],['fv','v'],['fp','pr'],['fx','x']].forEach(([id,k])=>$('#'+id).onchange=e=>{st[k]=e.target.value;st.n=24;render()});
$('#fo').onchange=e=>{st.o=e.target.value;render()};$('#fd').onchange=e=>{st.d=e.target.checked;st.n=24;render()};
$('#more').onclick=()=>{st.n+=24;render()};
function shopSet(o){o=o||{};cat=CATS.some(c=>c[0]===o.cat)?o.cat:'';Object.assign(st,{q:o.q||'',s:'',b:o.marca||'',v:'',pr:'',x:'',n:24});$('#pq').value=st.q;chips();filtros();render()}
window.shopSet=shopSet;(window.descHooks=window.descHooks||[]).push(render);chips();filtros();render();

})();
