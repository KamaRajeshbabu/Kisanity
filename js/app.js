import * as K from './store.js';
import {PRODUCTS} from './seed-data.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const inr=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const kg=n=>`${Math.round(n*100)/100} kg`;
const S=()=>K.get(),farm=id=>S().farms.find(f=>f.id===id)||{},lot=id=>S().lots.find(l=>l.id===id)||{},buyer=id=>S().buyers.find(b=>b.id===id)||{};
const ui={msg:'',err:'',match:null,q:''};
const bd=(t,c='')=>`<span class="b ${c}">${esc(t)}</span>`;
const btn=(a,id,t,c='')=>`<button class="${c}" data-a="${a}" data-id="${esc(id)}">${t}</button>`;
const tbl=(h,rows)=>rows.length?`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<p class="empty">Nothing here yet.</p>';
const tl=o=>o.status==='Cancelled'?bd('Cancelled','r'):`<ol class="tl">${K.FLOW.map((s,i)=>`<li class="${i<=K.FLOW.indexOf(o.status)?'on':''}">${s}</li>`).join('')}</ol>`;
const acts=o=>(K.FLOW.indexOf(o.status)>=0&&o.status!=='Completed'?btn('step',o.id,'Advance (demo)'):'')+(['Confirmed','Pickup scheduled'].includes(o.status)?btn('cancel',o.id,'Cancel','ghost'):'');
const ordRows=os=>os.map(o=>[o.id,o.ch,o.lines.map(x=>`${esc(farm(x.farmId).name)}: ${kg(x.kg)}`).join('<br>'),`${inr(o.total)}<br><small>incl. ${inr(o.fee)} illustrative fee</small>`,tl(o),acts(o)]);
const mstate=r=>{if(r.status==='ordered')return bd('Fully ordered','g');const p=K.propose(r);return bd({full:'Fully matchable',partial:'Partially matchable',none:'Unmatched'}[p.state],{full:'g',partial:'o',none:'r'}[p.state])+(r.status==='partial'?' '+bd('Partly ordered'):'')};
const day=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const sel=(k,list,cur)=>`<label>Acting as<select data-sel="${k}">${list.map(([v,t])=>`<option value="${v}" ${v===cur?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;

function matchPanel(){const r=S().requests.find(x=>x.id===ui.match);if(!r)return'';const p=K.propose(r);
return `<section class="card" aria-label="Demand matching"><h2>Proposed allocation — ${esc(r.id)}: ${kg(r.qty)} ${esc(r.product)}, grade ${r.grade}</h2>${p.lines.length?tbl(['Farm','Grade','Price/kg','Available','Allocate (kg)'],p.lines.map(x=>{const l=lot(x.lotId);return[esc(farm(l.farmId).name),l.grade,inr(l.price),kg(K.avail(l)),`<input type="number" min="0" max="${K.avail(l)}" step="any" value="${x.kg}" data-lot="${l.id}" aria-label="Kilograms from ${esc(farm(l.farmId).name)}">`]})):'<p class="empty">No eligible supply (checked product, grade, date, price target and stock).</p>'}
<p>Still needed: ${kg(K.rem(r))} · proposed: ${kg(p.matched)} · <strong>${p.short>0?'Shortfall '+kg(p.short):'Fully matched'}</strong></p>${p.lines.length?btn('confirm',r.id,'Confirm allocation (demo order)'):''}${btn('close','x','Close','ghost')}</section>`}

const views={
home:()=>`<section class="hero"><div><h1>Demand in. Supply matched. Orders fulfilled.</h1><p>A prototype of a market-access and procurement layer: a buyer posts what they need, the platform assembles it from several small farms, and farmer, buyer and operator all see the same order.</p><p><a class="btn" href="#/buyer">Try the 500 kg tomato demo</a></p><p class="mut">Simulated: fictional farms, buyers, prices and orders. No Kheyti integration, partnership or farmer data is implied.</p></div><img src="assets/logo/kisanity-logo.jpg" alt="Kisanity — From Farmers to Every Home"></section>
<div class="grid"><div class="card" style="--acc:var(--g)"><h2>Farmer</h2><p>List harvest, see commitments.</p><a class="btn" href="#/farmer">Open farmer workspace</a></div><div class="card"><h2>Business buyer</h2><p>Request produce, review the multi-farm allocation, track fulfilment.</p><a class="btn" href="#/buyer">Open buyer workspace</a></div><div class="card"><h2>Consumer</h2><p>Buy from the same supply pool.</p><a class="btn" href="#/shop">Open marketplace</a></div></div>
<h2>How it works</h2><div class="flow">${['Farmers','Harvest availability','Supply aggregation','Demand matching','Procurement','Quality & fulfilment','Buyers / consumers'].map(x=>`<span>${x}</span>`).join('')}</div>
<h2>Roadmap</h2>${tbl(['Phase','Scope','Status'],[['1','B2B procurement and supply aggregation','Prototype'],['2','B2C commerce and repeat ordering','Prototype (basic)'],['3','Fulfilment optimisation; institutional procurement (B2G)','Planned'],['4','Market intelligence and predictive coordination','Planned']])}`,

buyer:()=>{const s=S(),b=s.buyer,reqs=s.requests.filter(r=>r.buyer===b),ords=s.orders.filter(o=>o.ch==='B2B'&&o.who===b),live=ords.filter(o=>!['Completed','Cancelled'].includes(o.status)),spend=ords.filter(o=>o.status!=='Cancelled').reduce((a,o)=>a+o.total,0);
return `<h1>Buyer workspace</h1>${sel('buyer',s.buyers.map(x=>[x.id,`${x.name} (${x.type})`]),b)}
<div class="grid"><div class="card stat"><b>${reqs.filter(r=>r.status!=='ordered').length}</b>Open requests</div><div class="card stat"><b>${live.length}</b>Active orders</div><div class="card stat"><b>${inr(spend)}</b>Simulated spend</div></div>
<h2>New procurement request</h2><form data-f="req"><label>Product<select name="product">${PRODUCTS.map(p=>`<option>${p}</option>`).join('')}</select></label><label>Quantity (kg)<input name="qty" type="number" min="1" step="any" value="500" required></label><label>Grade<select name="grade"><option>A</option><option>B</option></select></label><label>Required by<input name="date" type="date" value="${day(3)}" required></label><label>Delivery location<input name="loc" value="Demo Bistro, Banjara Hills (fictional)" required></label><label>Target price (₹/kg, optional)<input name="budget" type="number" min="1" step="any"></label><label>Quality / packaging notes<input name="note"></label><label class="chk"><input name="rec" type="checkbox"> Recurring requirement</label><button>Submit request</button></form>
${ui.match?matchPanel():''}
<h2>Your requests</h2>${tbl(['ID','Product','Qty','Grade','By','Status',''],reqs.map(r=>[r.id,esc(r.product),kg(r.qty),r.grade,r.date,mstate(r),r.status==='ordered'?'':btn('match',r.id,'Match supply')]))}
<h2>Orders and fulfilment</h2>${tbl(['Order','Channel','Farm contributions','Total','Timeline',''],ordRows(ords))}`},

farmer:()=>{const s=S(),id=s.farmer,ls=s.lots.filter(l=>l.farmId===id),os=s.orders.filter(o=>o.status!=='Cancelled'&&o.lines.some(x=>x.farmId===id)),mine=o=>o.lines.filter(x=>x.farmId===id),sum=k=>ls.reduce((a,l)=>a+l[k],0);
return `<h1>Farmer workspace</h1><p class="mut">${esc(farm(id).village)} · profile is fictional and unverified</p>${sel('farmer',s.farms.map(f=>[f.id,f.name]),id)}
<div class="grid"><div class="card stat"><b>${kg(ls.reduce((a,l)=>a+K.avail(l),0))}</b>Available</div><div class="card stat"><b>${kg(sum('reserved'))}</b>Committed to orders</div><div class="card stat"><b>${kg(sum('delivered'))}</b>Delivered</div></div>
<h2>Harvest and inventory</h2>${tbl(['Lot','Product','Grade','Total','Available','Committed','Delivered','Ready by','Indicative price'],ls.map(l=>[l.id,esc(l.product),l.grade,kg(l.kg),kg(K.avail(l)),kg(l.reserved),kg(l.delivered),l.ready,inr(l.price)+'/kg']))}
<h2>Add supply listing</h2><form data-f="lot"><label>Product<select name="product">${PRODUCTS.map(p=>`<option>${p}</option>`).join('')}</select></label><label>Quantity (kg)<input name="kg" type="number" min="1" step="any" required></label><label>Grade<select name="grade"><option>A</option><option>B</option></select></label><label>Available from<input name="date" type="date" value="${day(1)}" required></label><label>Price (₹/kg)<input name="price" type="number" min="1" step="any" required></label><button>Add listing</button></form>
<h2>Order commitments</h2>${tbl(['Order','Product','Quantity','Price','Status','Payment'],os.flatMap(o=>mine(o).map(x=>[o.id,esc(x.product),kg(x.kg),inr(x.price)+'/kg',o.status,o.status==='Completed'?'Settled (demo)':'Pending'])))}
<h2>Transaction history (illustrative)</h2>${tbl(['Order','Gross','Net settlement estimate'],os.filter(o=>o.status==='Completed').map(o=>{const g=mine(o).reduce((a,x)=>a+x.kg*x.price,0);return[o.id,inr(g),inr(g)+' (fee is buyer-paid in this demo)']}))}
<h2>Open buyer demand</h2>${tbl(['Product','Still needed','Grade','By','Location'],s.requests.filter(r=>r.status!=='ordered').map(r=>[esc(r.product),kg(K.rem(r)),r.grade,r.date,esc(r.loc)]))}`},

shop:()=>{const s=S(),ls=s.lots.filter(l=>K.avail(l)>0&&(!ui.q||l.product===ui.q)),c=s.cart.map(x=>({...x,l:lot(x.lotId)})),sub=c.reduce((a,x)=>a+x.qty*x.l.price,0),fee=Math.round(sub*K.FEE);
return `<h1>Consumer marketplace</h1><label>Category<select data-sel="q"><option value="">All</option>${PRODUCTS.map(p=>`<option ${ui.q===p?'selected':''}>${p}</option>`).join('')}</select></label>
<h2>Available produce</h2>${tbl(['Product','Source','Grade','Price','Available','Qty (kg)',''],ls.map(l=>[esc(l.product),`${esc(farm(l.farmId).name)}, ${esc(farm(l.farmId).village)} ${bd('Demo, unverified')}`,l.grade,inr(l.price)+'/kg',kg(K.avail(l)),`<input type="number" min="1" step="any" value="1" data-q="${l.id}" aria-label="Quantity in kg of ${esc(l.product)}">`,btn('add',l.id,'Add to cart')]))}
<h2>Cart</h2>${c.length?tbl(['Item','Qty','Line total',''],c.map(x=>[esc(x.l.product),kg(x.qty),inr(x.qty*x.l.price),btn('rm',x.lotId,'Remove','ghost')]))+`<p>Subtotal ${inr(sub)} · illustrative platform fee ${inr(fee)} · <strong>Total ${inr(sub+fee)}</strong></p>`+btn('checkout','x','Place demo order'):'<p class="empty">Your cart is empty.</p>'}
<h2>Your orders</h2>${tbl(['Order','Items','Total','Status',''],s.orders.filter(o=>o.ch==='B2C').map(o=>[o.id,o.lines.map(x=>esc(x.product)+' '+kg(x.kg)).join('<br>'),inr(o.total),tl(o),btn('reorder',o.id,'Reorder','ghost')+(['Confirmed','Pickup scheduled'].includes(o.status)?btn('cancel',o.id,'Cancel','ghost'):'')]))}`},

ops:()=>{const s=S(),st=r=>r.status==='ordered'?'ordered':K.propose(r).state,n=f=>s.requests.filter(f).length,oc=a=>s.orders.filter(o=>a.includes(o.status)).length;
return `<h1>Operations control tower</h1><div class="grid"><div class="card stat"><b>${n(r=>st(r)==='none')}</b>Unmatched demand</div><div class="card stat"><b>${n(r=>st(r)==='partial')}</b>Partially matchable</div><div class="card stat"><b>${n(r=>r.status==='ordered')}</b>Fully ordered</div><div class="card stat"><b>${oc(['Confirmed','Pickup scheduled'])}</b>Pending pickup</div><div class="card stat"><b>${oc(['Quality check'])}</b>Pending quality check</div><div class="card stat"><b>${oc(['Completed'])}</b>Completed</div></div>
<h2>Procurement demand</h2>${tbl(['ID','Buyer','Product','Still needed','Grade','By','Matching'],s.requests.map(r=>[r.id,esc(buyer(r.buyer).name),esc(r.product),kg(K.rem(r)),r.grade,r.date,mstate(r)]))}
<h2>Orders (manual status updates)</h2>${tbl(['Order','Channel','Farm contributions','Total','Timeline',''],ordRows(s.orders))}
<h2>Inventory reservations</h2>${tbl(['Lot','Farm','Product','Grade','Total','Available','Committed','Delivered'],s.lots.map(l=>[l.id,esc(farm(l.farmId).name),esc(l.product),l.grade,kg(l.kg),kg(K.avail(l)),kg(l.reserved),kg(l.delivered)]))}
<p class="mut">Not built yet: delayed-fulfilment alerts, an exception queue, real quality or logistics data. Institutional procurement (B2G): planned.</p>`}};

const A={
reset(){K.reset();ui.match=null;return'Demo data restored to the seeded scenario.'},
match({id}){ui.match=id},close(){ui.match=null},
confirm({id}){const o=K.confirm(id,[...document.querySelectorAll('[data-lot]')].map(i=>({lotId:i.dataset.lot,kg:i.value===''?NaN:Number(i.value)})));ui.match=null;return`Order ${o.id} confirmed (demo): ${kg(o.lines.reduce((a,x)=>a+x.kg,0))} reserved across ${o.lines.length} farm(s).`},
step({id}){const o=K.step(id);return`${o.id} is now: ${o.status}`},
cancel({id}){K.cancel(id);return`${id} cancelled; reserved stock released.`},
add({id}){K.addCart(id,document.querySelector(`[data-q="${id}"]`).value);return'Added to cart.'},
rm({id}){K.removeCart(id)},
checkout(){const o=K.checkout();return`Order ${o.id} placed (demo).`},
reorder({id}){let n=0;for(const x of S().orders.find(o=>o.id===id).lines){try{K.addCart(x.lotId,x.kg);n++}catch(e){}}if(!n)throw new Error('None of these items have enough stock right now.');return`${n} item(s) added to your cart.`}};
const F={req(f){const r=K.addRequest({...f,buyer:S().buyer,recurring:f.rec==='on'});ui.match=r.id;return`Request ${r.id} created. Review the proposed allocation below.`},lot(f){K.addLot({...f,farm:S().farmer});return'Listing added (demo).'}};

function draw(){const r=views[location.hash.slice(2)]?location.hash.slice(2):'home';document.body.dataset.r=r==='farmer'?'farmer':r==='ops'?'ops':'buyer';
const nav=[['','Home'],['farmer','Farmer'],['buyer','Buyer'],['shop','Consumer'],['ops','Operations']];
document.getElementById('app').innerHTML=`<div class="demo" role="note">Simulated demo · fictional farms, buyers, prices and orders · saved only in this browser · not a live marketplace</div><header><a href="#/"><img src="assets/logo/kisanity-logo.jpg" alt="Kisanity home"></a><nav aria-label="Primary">${nav.map(([k,t])=>`<a href="#/${k}" ${(k||'home')===r?'aria-current="page"':''}>${t}</a>`).join('')}</nav>${btn('reset','x','Reset demo data','ghost')}</header><main>${ui.err?`<div class="msg er" role="alert">${esc(ui.err)}</div>`:''}${ui.msg?`<div class="msg ok" role="status">${esc(ui.msg)}</div>`:''}${views[r]()}</main>`}
const run=fn=>{ui.msg=ui.err='';try{const m=fn();if(m)ui.msg=m}catch(e){ui.err=e.message}draw();scrollTo(0,0)};
if(typeof document!=='undefined'){
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t)run(()=>A[t.dataset.a](t.dataset))});
document.addEventListener('submit',e=>{const t=e.target.closest('[data-f]');if(!t)return;e.preventDefault();const f=Object.fromEntries(new FormData(t));run(()=>F[t.dataset.f](f))});
document.addEventListener('change',e=>{const t=e.target.closest('[data-sel]');if(!t)return;const k=t.dataset.sel;if(k==='q')ui.q=t.value;else{S()[k]=t.value;K.save()}draw()});
addEventListener('hashchange',()=>{ui.msg=ui.err='';draw()});draw()}
export{views};
