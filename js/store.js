import {seed,PRODUCTS} from './seed-data.js';
const KEY='kisanity-demo-v1';
export const FEE=0.03,FLOW=['Confirmed','Pickup scheduled','Quality check','Dispatched','Delivered','Settlement pending','Completed'];
let S=load();
function load(){try{const j=globalThis.localStorage?.getItem(KEY);if(j)return JSON.parse(j)}catch(e){}return seed()}
export const get=()=>S;
export const save=()=>{try{globalThis.localStorage?.setItem(KEY,JSON.stringify(S))}catch(e){}};
export const reset=()=>{S=seed();save();return S};
export const avail=l=>l.kg-l.reserved-l.delivered; // available = total - committed - delivered
const err=m=>{throw new Error(m)};
const pos=(v,n)=>{v=Number(v);if(!(v>0)||!isFinite(v))err(n+' must be a number above zero');return v};
const Lot=id=>S.lots.find(l=>l.id===id);
export const ordered=r=>S.orders.filter(o=>o.rid===r.id&&o.status!=='Cancelled').reduce((a,o)=>a+o.lines.reduce((s,x)=>s+x.kg,0),0);
export const rem=r=>r.qty-ordered(r);
const sync=r=>{if(r)r.status=rem(r)<=0?'ordered':ordered(r)>0?'partial':'open'};
export function addRequest(f){const qty=pos(f.qty,'Quantity');if(!PRODUCTS.includes(f.product))err('Choose a product');if(!f.date)err('Choose a delivery date');if(!f.loc?.trim())err('Enter a delivery location');let budget=null;if(f.budget){budget=pos(f.budget,'Target price')}
const r={id:'R'+S.seq++,buyer:f.buyer,product:f.product,qty,grade:f.grade==='B'?'B':'A',date:f.date,loc:f.loc.trim(),budget,recurring:!!f.recurring,note:f.note||'',status:'open'};S.requests.unshift(r);save();return r}
// Greedy allocation, cheapest first. Checks product, grade, date, price target, stock. (Location feasibility not modelled.)
export function propose(r){let need=rem(r);const lines=[];
const ok=S.lots.filter(l=>l.product===r.product&&(r.grade==='B'||l.grade==='A')&&l.ready<=r.date&&(!r.budget||l.price<=r.budget)&&avail(l)>0).sort((a,b)=>a.price-b.price);
for(const l of ok){if(need<=0)break;const kg=Math.min(need,avail(l));lines.push({lotId:l.id,kg});need-=kg}
return{lines,matched:rem(r)-need,short:need,state:need<=0?'full':lines.length?'partial':'none'}}
function mk(ch,who,lines,r){const sub=lines.reduce((a,x)=>a+x.kg*x.price,0),fee=Math.round(sub*FEE);
const o={id:'O'+S.seq++,ch,who,rid:r?r.id:null,lines,sub,fee,total:sub+fee,status:'Confirmed',log:[[Date.now(),'Confirmed']]};S.orders.unshift(o);sync(r);save();return o}
export function confirm(rid,lines){const r=S.requests.find(x=>x.id===rid);if(!r)err('Request not found');if(rem(r)<=0)err('This request is already fully ordered');
if(lines.some(x=>!(x.kg>=0)))err('Quantities cannot be negative or blank');const L=lines.filter(x=>x.kg>0);if(!L.length)err('Nothing to allocate');
const seen=new Set();for(const x of L){const l=Lot(x.lotId);if(!l)err('Unknown supply lot');if(seen.has(x.lotId))err('Duplicate lot in allocation');seen.add(x.lotId);if(l.product!==r.product)err('Lot does not match the requested product');if(x.kg>avail(l))err(`${l.id}: only ${avail(l)} kg available`)}
if(L.reduce((a,x)=>a+x.kg,0)>rem(r)+1e-9)err('Allocation exceeds the remaining requested quantity');
return mk('B2B',r.buyer,L.map(x=>{const l=Lot(x.lotId);l.reserved+=x.kg;return{lotId:l.id,farmId:l.farmId,product:l.product,kg:x.kg,price:l.price}}),r)}
export function step(id){const o=S.orders.find(x=>x.id===id);if(!o)err('Order not found');const i=FLOW.indexOf(o.status);if(i<0||i===FLOW.length-1)err('Order cannot advance from '+o.status);
o.status=FLOW[i+1];o.log.push([Date.now(),o.status]);if(o.status==='Delivered')for(const x of o.lines){const l=Lot(x.lotId);l.reserved-=x.kg;l.delivered+=x.kg}save();return o}
export function cancel(id){const o=S.orders.find(x=>x.id===id);if(!o)err('Order not found');if(!FLOW.slice(0,2).includes(o.status))err('Orders can only be cancelled before the quality check');
for(const x of o.lines)Lot(x.lotId).reserved-=x.kg;o.status='Cancelled';o.log.push([Date.now(),'Cancelled']);sync(S.requests.find(r=>r.id===o.rid));save()}
export function addLot(f){const kg=pos(f.kg,'Quantity'),price=pos(f.price,'Price');if(!PRODUCTS.includes(f.product))err('Choose a product');if(!f.date)err('Choose an availability date');
const l={id:'L'+S.seq++,farmId:f.farm,product:f.product,grade:f.grade==='B'?'B':'A',kg,price,ready:f.date,reserved:0,delivered:0};S.lots.push(l);save();return l}
export function addCart(id,q){const l=Lot(id);if(!l)err('Unknown product');q=pos(q,'Quantity');const c=S.cart.find(x=>x.lotId===id),have=c?c.qty:0;if(have+q>avail(l))err(`Only ${avail(l)-have} kg more available`);c?c.qty+=q:S.cart.push({lotId:id,qty:q});save()}
export const removeCart=id=>{S.cart=S.cart.filter(x=>x.lotId!==id);save()};
export function checkout(){if(!S.cart.length)err('Your cart is empty');for(const c of S.cart){const l=Lot(c.lotId);if(!l||c.qty>avail(l))err(`${l?l.product:'An item'} no longer has enough stock`)}
const lines=S.cart.map(c=>{const l=Lot(c.lotId);l.reserved+=c.qty;return{lotId:l.id,farmId:l.farmId,product:l.product,kg:c.qty,price:l.price}});S.cart=[];return mk('B2C','Demo consumer',lines,null)}
