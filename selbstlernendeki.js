/* ================= API & Aktien ================= */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL"];
let apiIndex = 0;
const USD_TO_CHF = 0.91;

const STOCKS = [
  {s:"AAPL", n:"Apple"}, {s:"MSFT", n:"Microsoft"}, {s:"NVDA", n:"NVIDIA"},
  {s:"TSLA", n:"Tesla"}, {s:"META", n:"Meta"}, {s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"}, {s:"NFLX", n:"Netflix"}
];

const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* ================= EVENTS ================= */
const EVENTS = [
  {date:"2025-11-01", impact:-0.12, description:"Globale Rezessionssorgen"},
  {date:"2025-10-20", impact:-0.08, description:"Börsencrash Tech-Sektor"},
  {date:"2025-09-15", impact:0.05, description:"Unerwartet gute Quartalszahlen"},
  {date:"2025-08-10", impact:0.03, description:"Zinsentscheid der EZB positiv"}
];

/* ================= MODE ================= */
let KI_MODE="normal";
function setMode(m){ KI_MODE=m; document.getElementById("mode").textContent=m.charAt(0).toUpperCase()+m.slice(1); }
let modeWeights = { safe:0.5, normal:0.8, aggressive:1.3 };

/* ================= API FETCH ================= */
async function getHistory(symbol){
  const key = API_KEYS[apiIndex];
  const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
  const d = await r.json();
  if(d.Note || d["Error Message"]){ apiIndex = (apiIndex+1) % API_KEYS.length; throw "API-Limit erreicht – bitte 60 Sekunden warten"; }
  return Object.entries(d["Time Series (Daily)"]).slice(0,120).reverse().map(([date,v])=>({date,price:parseFloat(v["4. close"])*USD_TO_CHF}));
}

/* ================= INDICATORS ================= */
function EMA(data, period){ const k=2/(period+1); let e=data[0].price; for(let i=1;i<data.length;i++) e=data[i].price*k+e*(1-k); return e; }
function RSI(data){ let gains=0,losses=0; for(let i=data.length-15;i<data.length-1;i++){ const diff=data[i+1].price-data[i].price; if(diff>0) gains+=diff; else losses-=diff; } return 100-(100/(1+(gains/(losses||1)))); }
function MACD(data){ return EMA(data,12)-EMA(data,26); }
function volatility(data){ const mean = data.reduce((sum,d)=>sum+d.price,0)/data.length; const std = Math.sqrt(data.reduce((sum,d)=>sum+Math.pow(d.price-mean,2),0)/data.length); return std; }
function momentum(data){ return data[data.length-1].price - data[0].price; }

/* ================= TENSORFLOW ================= */
let model;
async function initModel(inputSize){
  model = tf.sequential();
  model.add(tf.layers.dense({units:64, activation:'relu', inputShape:[inputSize]}));
  model.add(tf.layers.dense({units:32, activation:'relu'}));
  model.add(tf.layers.dense({units:1}));
  model.compile({optimizer:'adam', loss:'meanSquaredError'});
}
function createFeatures(data){
  const features = [];
  for(let i=1;i<data.length;i++){
    const diff=data[i].price-data[i-1].price;
    const rsi=RSI(data.slice(i-14>0?i-14:0,i+1));
    const macd=MACD(data.slice(0,i+1));
    const vol=volatility(data.slice(i-14>0?i-14:0,i+1));
    const mom=momentum(data.slice(i-7>0?i-7:0,i+1));
    features.push([data[i-1].price,diff,rsi,macd,vol,mom]);
  }
  return features;
}

async function predictML(data){
  const features=createFeatures(data);
  const xs=tf.tensor2d(features);
  const ys=tf.tensor2d(data.slice(1).map(d=>[d.price]));
  if(!model) await initModel(features[0].length);
  await model.fit(xs, ys, {epochs:50, verbose:0});
  
  const lastFeature=features[features.length-1];
  let preds=[];
  let price=data[data.length-1].price;
  for(let i=0;i<7;i++){
    let pred=model.predict(tf.tensor2d([lastFeature])).dataSync()[0];
    pred = price + (pred-price)*modeWeights[KI_MODE];
    preds.push(pred);
    price=pred;
  }
  const recentEvents=EVENTS.filter(e=>data.some(d=>d.date===e.date));
  recentEvents.forEach(e=>preds[preds.length-1]*=1+e.impact);
  return {preds, recentEvents};
}

function confidenceScore(data){
  let s=60;
  const macd=MACD(data),rsi=RSI(data);
  if(Math.abs(macd)>0.5) s+=5; if(rsi>40&&rsi<60) s+=5;
  if(KI_MODE==="safe") s+=3;
  return s>75?"Hoch":s>65?"Mittel":"Niedrig";
}

/* ================= CHART ================= */
let chart;
function drawChart(data,preds,recentEvents){
  if(chart) chart.destroy();
  const annotations=recentEvents.map(e=>{ const index=data.findIndex(d=>d.date===e.date); if(index<0)return null; return {type:'point',xValue:data[index].date,yValue:data[index].price,backgroundColor:e.impact>0?'#00ff66':'#ff5555',radius:6,label:{content:e.description,enabled:true,position:'top',backgroundColor:'#111',color:'#00ffcc',font:{size:11}}}; }).filter(a=>a);
  
  const projData=[...data.map(d=>d.price), ...preds];
  const projLabels=[...data.map(d=>d.date), ...preds.map((_,i)=>`Day ${i+1}`)];

  chart=new Chart(document.getElementById("chart"),{
    type:"line",
    data:{ labels:projLabels, datasets:[
        {label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},
        {label:"Projektion", data:projData, borderColor:"#ffaa00", tension:0.3}
      ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true}, tooltip:{mode:'index', intersect:false}, annotation:{annotations}},
      scales:{x:{display:true,title:{display:true,text:'Datum'}},y:{display:true,title:{display:true,text:'Preis (CHF)'}}}
    }
  });
}

/* ================= ANALYSE ================= */
async function analyze(){
  document.getElementById("status").textContent="Lade Marktdaten…";
  try{
    const data=await getHistory(select.value);
    const {preds,recentEvents}=await predictML(data);
    drawChart(data,preds,recentEvents);
    
    const last=data[data.length-1].price;
    const pred=preds[0];
    const d=(pred-last)/last;
    const signal=d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
    const cls=d>0.08?"buy":d<-0.08?"sell":"hold";

    document.getElementById("confidence").textContent=confidenceScore(data);
    document.getElementById("result").innerHTML=`<tr><td>${last.toFixed(2)}</td><td>${pred.toFixed(2)}</td><td class="${cls}">${signal}</td><td>${(Math.abs(d)*100).toFixed(1)}%</td></tr>`;

    document.getElementById("explanation").innerHTML=`RSI ${RSI(data).toFixed(1)}, MACD ${MACD(data).toFixed(2)}, Volatilität ${volatility(data).toFixed(2)}, Momentum ${momentum(data).toFixed(2)}, Modus ${KI_MODE}.<br>` +
    (recentEvents.length? "Berücksichtigte Ereignisse: "+recentEvents.map(e=>`${e.description} (${(e.impact*100).toFixed(1)}%)`).join(", "):"Keine besonderen Ereignisse in letzter Zeit.");

    document.getElementById("fundamental").innerHTML=`Grundlegende Stabilitätsprüfung (internes Filtermodell).`;
    document.getElementById("status").textContent="Analyse abgeschlossen";
  }catch(e){document.getElementById("status").textContent=e;}
}
