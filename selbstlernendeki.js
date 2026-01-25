document.addEventListener("DOMContentLoaded", () => {

  /* ================= API & Aktien ================= */
  const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL"];
  let apiIndex = 0;

  const STOCKS = [
    {s:"AAPL", n:"Apple"}, {s:"MSFT", n:"Microsoft"}, {s:"NVDA", n:"NVIDIA"},
    {s:"TSLA", n:"Tesla"}, {s:"META", n:"Meta"}, {s:"GOOGL", n:"Alphabet"},
    {s:"AMZN", n:"Amazon"}, {s:"NFLX", n:"Netflix"}
  ];

  const select = document.getElementById("stockSelect");
  STOCKS.forEach(a=>{
    const o = document.createElement("option");
    o.value = a.s;
    o.textContent = `${a.s} – ${a.n}`;
    select.appendChild(o);
  });

  /* ================= MODE ================= */
  window.KI_MODE="normal";
  window.setMode=function(m){ 
    KI_MODE=m; 
    document.getElementById("mode").textContent = m.charAt(0).toUpperCase() + m.slice(1); 
  };
  const modeWeights = { safe:0.5, normal:0.8, aggressive:1.3 };

  /* ================= EVENTS ================= */
  const EVENTS = [
    {date:"2025-11-01", impact:-0.12, description:"Globale Rezessionssorgen"},
    {date:"2025-10-20", impact:-0.08, description:"Börsencrash Tech-Sektor"},
    {date:"2025-09-15", impact:0.05, description:"Unerwartet gute Quartalszahlen"},
    {date:"2025-08-10", impact:0.03, description:"Zinsentscheid der EZB positiv"}
  ];

  /* ================= USD→CHF ================= */
  async function getUsdToChfRate() {
    try {
      const response = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=CHF");
      const data = await response.json();
      if(data && data.rates && data.rates.CHF){
        return data.rates.CHF;
      } else { return 0.91; }
    } catch(e){ return 0.91; }
  }

  /* ================= API FETCH ================= */
  async function getHistory(symbol){
    const USD_TO_CHF = await getUsdToChfRate();
    const key = API_KEYS[apiIndex];
    const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
    const d = await r.json();

    if(!d["Time Series (Daily)"]){
        apiIndex = (apiIndex + 1) % API_KEYS.length;
        throw "Keine historischen Daten verfügbar oder API-Limit erreicht";
    }

    return Object.entries(d["Time Series (Daily)"])
        .slice(0,120)
        .reverse()
        .map(([date,v])=>({date, price: parseFloat(v["4. close"]) * USD_TO_CHF}))
        .filter(e => !isNaN(e.price));
  }

  /* ================= INDICATORS ================= */
  function EMA(data, period){ const k=2/(period+1); let e=data[0].price; for(let i=1;i<data.length;i++) e=data[i].price*k+e*(1-k); return e; }
  function RSI(data){ 
    if(data.length<15) return 50;
    let gains=0,losses=0; 
    for(let i=data.length-15;i<data.length-1;i++){
      const diff=data[i+1].price-data[i].price; 
      if(diff>0) gains+=diff; else losses-=diff; 
    } 
    return 100-(100/(1+(gains/(losses||1)))); 
  }
  function MACD(data){ if(data.length<26) return 0; return EMA(data,12)-EMA(data,26); }
  function volatility(data){ 
    if(data.length===0) return 0;
    const mean = data.reduce((sum,d)=>sum+d.price,0)/data.length; 
    const std = Math.sqrt(data.reduce((sum,d)=>sum+Math.pow(d.price-mean,2),0)/data.length); 
    return std; 
  }
  function momentum(data){ return data.length>1 ? data[data.length-1].price - data[0].price : 0; }

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
    if(!data || data.length<15) return [];
    const features = [];
    for(let i=1;i<data.length;i++){
      if(!data[i] || data[i].price===undefined) continue;
      const diff = data[i].price - data[i-1].price;
      const rsi = RSI(data.slice(Math.max(0,i-14),i+1));
      const macd = MACD(data.slice(0,i+1));
      const vol = volatility(data.slice(Math.max(0,i-14),i+1));
      const mom = momentum(data.slice(Math.max(0,i-7),i+1));
      features.push([data[i-1].price,diff,rsi,macd,vol,mom]);
    }
    return features;
  }

  async function predictML(data){
    const features=createFeatures(data);
    if(features.length===0) return {preds:[], upper:[], lower:[]};

    const xs=tf.tensor2d(features);
    const ys=tf.tensor2d(data.slice(1).map(d=>[d.price]));
    if(!model) await initModel(features[0].length);
    await model.fit(xs, ys, {epochs:50, verbose:0});

    const lastFeature=features[features.length-1];
    let preds=[], upper=[], lower=[];
    let price=data[data.length-1].price;
    for(let i=0;i<7;i++){
      let pred = model.predict(tf.tensor2d([lastFeature])).dataSync()[0];
      pred = price + (pred-price)*modeWeights[KI_MODE];
      preds.push(pred);
      upper.push(pred*1.03);
      lower.push(pred*0.97);
      price=pred;
    }
    return {preds, upper, lower};
  }

  function confidenceScore(data){
    let s=60;
    const macd=MACD(data),rsi=RSI(data);
    if(Math.abs(macd)>0.5) s+=5; 
    if(rsi>40&&rsi<60) s+=5;
    if(KI_MODE==="safe") s+=3;
    return s>75?"Hoch":s>65?"Mittel":"Niedrig";
  }

  /* ================= CHART ================= */
  let chart;
  function drawChart(data,preds,upper,lower){
    if(chart) chart.destroy();
    if(!data || data.length===0) return;

    const projData=[...data.map(d=>d.price), ...preds];
    const projLabels=[...data.map(d=>d.date), ...preds.map((_,i)=>`Day ${i+1}`)];

    chart=new Chart(document.getElementById("chart"),{
      type:"line",
      data:{
        labels:projLabels,
        datasets:[
          {label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},
          {label:"Projektion", data:projData, borderColor:"#ffaa00", tension:0.3},
          {label:"Konfidenzband Oben", data:[...Array(data.length).fill(null), ...upper], borderColor:"#00ffcc", borderDash:[5,5], fill:false},
          {label:"Konfidenzband Unten", data:[...Array(data.length).fill(null), ...lower], borderColor:"#ff5555", borderDash:[5,5], fill:false}
        ]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:true}, tooltip:{mode:'index', intersect:false}},
        scales:{x:{display:true,title:{display:true,text:'Datum'}},y:{display:true,title:{display:true,text:'Preis (CHF)'}}}
      }
    });
  }

  /* ================= ANALYSE ================= */
  window.analyze = async function(){
    document.getElementById("status").textContent="Lade Marktdaten…";
    try{
        const data = await getHistory(select.value);
        if(!data || data.length===0) throw "Keine Daten verfügbar";

        const {preds, upper, lower} = await predictML(data);
        drawChart(data, preds, upper, lower);

        const last=data[data.length-1].price;
        const pred=preds.length>0 ? preds[0] : last;
        const d=(pred-last)/last;
        const signal=d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
        const cls=d>0.08?"buy":d<-0.08?"sell":"hold";

        document.getElementById("confidence").textContent=confidenceScore(data);
        document.getElementById("result").innerHTML=`<tr><td>${last.toFixed(2)}</td><td>${pred.toFixed(2)}</td><td class="${cls}">${signal}</td><td>${(Math.abs(d)*100).toFixed(1)}%</td></tr>`;
        document.getElementById("status").textContent="Analyse abgeschlossen";
    }catch(e){
        document.getElementById("status").textContent=e;
    }
  }

});
