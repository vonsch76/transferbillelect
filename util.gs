function billingoRequest(proto, page, params, argums) {
  let pay, resp;

  let url = 'https://api.billingo.hu/v3' + page;
  if(typeof params !== 'undefined')
    url = url.addQuery(params);
  if(typeof argums !== 'undefined') 
    pay = JSON.stringify(argums);
  let args = {  'method' : proto,
                'headers' : {
                  'X-API-KEY' : conf.billingo_apikey,
                },
                'muteHttpExceptions' : true,
  }; 
  if(typeof pay !== 'undefined'){
    args['payload'] = pay;
    args['contentType'] = 'application/json';
  }

  resp = UrlFetchApp.fetch(url,args);
  return ({'code' : resp.getResponseCode(), 'payload' : resp.getContentText().charAt(0) == '{' ?JSON.parse(resp.getContentText()) : resp.getContent()});
}

function tperiod(start=undefined, offset=undefined){
  let curr = new Date,  
      first = curr.getDay() ? curr.getDate() - curr.getDay() + 1 : curr.getDate() - 6; //date handles first day as Sunday
      last = first + offset; 
  
  if(start === true){
    return new Date(curr.setDate(first)).toISOString().substring(0,10);
  } else
    return new Date(curr.setDate(last)).toISOString().substring(0,10);
}

function removeaccent(content){
  let accent = {a:'á',e:'é',i:'í',o:'[óöő]',u:'[úüű]'}

  for(const acckey in accent)
    content = content.replace(new RegExp(accent[acckey],'ig'), acckey);

  return(content);
}

String.prototype.addQuery = function (obj) {
  return this + "?" + Object.entries(obj).flatMap(([k, v]) => Array.isArray(v) ? v.map(e => `${k}=${encodeURIComponent(e)}`) : `${k}=${encodeURIComponent(v)}`).join("&");
}
