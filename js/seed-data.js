// All data below is fictional demo data.
const d=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
export const PRODUCTS=['Tomato','Onion','Spinach','Green chilli','Capsicum','Brinjal'];
const F=[['F1','Farm A — Lakshmi Devi','Shamirpet'],['F2','Farm B — Ravi Naik','Medchal'],['F3','Farm C — Sunita Goud','Ghatkesar'],['F4','Farm D — Mohan Rao','Shankarpally'],['F5','Farm E — Fatima Begum','Chevella'],['F6','Farm F — Venkat Yadav','Moinabad'],['F7','Farm G — Padma Kumari','Keesara'],['F8','Farm H — Imran Ali','Maheshwaram']];
const L=[['F1','Tomato','A',150,28,1],['F2','Tomato','A',200,26,1],['F3','Tomato','A',150,30,2],['F4','Tomato','B',300,20,1],['F5','Onion','A',400,24,0],['F5','Onion','B',250,18,0],['F6','Spinach','A',80,35,1],['F6','Brinjal','A',90,32,1],['F7','Green chilli','A',120,55,1],['F8','Capsicum','A',100,48,2]];
export const seed=()=>({v:1,seq:100,buyer:'B1',farmer:'F1',cart:[],
farms:F.map(([id,name,village])=>({id,name,village,verified:false})),
lots:L.map(([farmId,product,grade,kg,price,n],i)=>({id:'L'+(i+1),farmId,product,grade,kg,price,ready:d(n),reserved:0,delivered:0})),
buyers:[{id:'B1',name:'Demo Bistro',type:'Restaurant'},{id:'B2',name:'Demo Fresh Mart',type:'Retailer'},{id:'B3',name:'Demo Caterers',type:'Caterer'}],
requests:[{id:'R1',buyer:'B2',product:'Spinach',qty:200,grade:'A',date:d(4),loc:'Demo Fresh Mart, Kondapur (fictional)',budget:null,recurring:true,note:'',status:'open'},{id:'R2',buyer:'B3',product:'Onion',qty:300,grade:'A',date:d(4),loc:'Demo Caterers kitchen, Gachibowli (fictional)',budget:25,recurring:false,note:'',status:'open'}],
orders:[]});
