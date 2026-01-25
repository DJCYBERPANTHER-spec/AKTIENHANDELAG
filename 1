const fetch = require("node-fetch");
const TOKEN = "d5ohqjhr01qjast6qrjgd5ohqjhr01qjast6qrk0";
exports.handler = async function(event) {
  const symbol = event.queryStringParameters.symbol;
  const type = event.queryStringParameters.type || "quote";
  const days = parseInt(event.queryStringParameters.days,10)||90;
  try{
    let url="";
    if(type==="quote") url=`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${TOKEN}`;
    else if(type==="candle"){
      const now=Math.floor(Date.now()/1000);
      const from=now-days*24*3600;
      url=`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${TOKEN}`;
    }else return {statusCode:400, body:"Unknown type"};
    const res=await fetch(url);
    const data=await res.json();
    return {statusCode:200, body:JSON.stringify(data), headers:{"Access-Control-Allow-Origin":"*"}};
  }catch(err){
    return {statusCode:500, body:JSON.stringify({error:err.message}), headers:{"Access-Control-Allow-Origin":"*"}};
  }
};
