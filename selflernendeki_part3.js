/* ================= INDICATORS ================= */
function EMA(data, period){
    const k = 2/(period+1);
    let e = data[0].price;
    for(let i=1;i<data.length;i++) e = data[i].price*k + e*(1-k);
    return e;
}

function RSI(data){
    let gains=0,losses=0;
    for(let i=data.length-15;i<data.length-1;i++){
        const diff=data[i+1].price-data[i].price;
        if(diff>0) gains+=diff; else losses-=diff;
    }
    return 100-(100/(1+(gains/(losses||1))));
}

function MACD(data){
    return EMA(data,12)-EMA(data,26);
}
