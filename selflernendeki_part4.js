/* ================= PREDICTION ================= */
function predict(data){
    const last = data[data.length-1].price;
    let w = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
    let pred = last*(1+(EMA(data,10)-last)/last*0.5*w);

    const rsi = RSI(data);
    if(rsi>70) pred *= 0.97;
    if(rsi<30) pred *= 1.03;

    const recentEvents = EVENTS.filter(e => data.some(d => d.date === e.date));
    recentEvents.forEach(e => pred *= 1 + e.impact);

    return {pred, recentEvents};
}

function confidenceScore(data){
    let s=60;
    const macd = MACD(data);
    const rsi = RSI(data);
    if(Math.abs(macd)>0.5) s+=5;
    if(rsi>40 && rsi<60) s+=5;
    if(KI_MODE==="safe") s+=3;
    return s>75?"Hoch":s>65?"Mittel":"Niedrig";
}
