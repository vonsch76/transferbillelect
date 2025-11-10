let conf = downloadconfig();

function get_weeklytransfers() {

  let resp,
      p = 0, 
      spendings = new Array(),
      ss, ssheet, 
      havefile = DriveApp.getFilesByName(conf.ssname);

  if(!havefile.hasNext()){
      ss = SpreadsheetApp.create(conf.ssname);
      if(conf.parentFolderId)
      DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(conf.parentFolderId));
  } 
  else{
    Logger.log ('Spreadsheet file is present!');
    return;
  }

  ssheet = ss.getSheets()[0];

  conf.method.forEach(function(exp) {
    do {
      resp = billingoRequest('GET', '/spendings', {'page' : p, 'per_page' : 100, 'start_date' : conf.startday, 'end_date' : conf.endday, 'currencies' : 'HUF', 'payment_methods' : exp}, undefined );
      if(resp['code'] == 200){
        spendings = spendings.concat(resp['payload']['data']);
      } else {
        Logger.log('Error at getting the invoices from Billingo: ' + resp);
        return;
      }
      p++;
      } while (p*100 <= resp['payload']['total'])
  }
  )
  spendings.forEach(function(exp) {
    let doffset = 0,
        dtemp = new Date(exp['due_date'] + ' 12:00:00 +0100');

    if(conf.shiftweekend)
      switch(dtemp.getDay()){
        case 6: doffset++;
        case 0: doffset++;
      }
      
    ssheet.appendRow([exp['total_gross'], Utilities.formatDate(new Date(dtemp.setDate(dtemp.getDate() + doffset)), 'CET', 'yyyy-MM-dd hh:mm:ss a'), exp['partner']['id'], exp['partner']['name'], exp['partner']['address']['country_code'], '\'' + exp['invoice_number']]);
  }
  )

  ssheet.getRange('B:B').setNumberFormat('yyyy-mm-dd');
  ssheet.setColumnWidth(4,200);
  ssheet.setColumnWidth(5,30);
  Logger.log('Link to spreadsheet: ' + ss.getUrl());
}

function convert_weeklytransfers() {
  let ssid, 
      havefiles = DriveApp.getFilesByName(conf.ssname);
  
  if(havefiles.hasNext()){
      while(havefiles.hasNext()){
        let havefile = havefiles.next();
        ssid = havefile.getId();
      }

      //block variables
      let refsearch, refrow, 
      ss, sdata, 
      stxt, 
      scontent = [], 
      refss, refdata,
      eltxt = {
                  'osszeg'   : undefined,     // Az átutalás összege két tizedessel, tizedesponttal * 1 - 15
                  'erteknap' : undefined,     // Terhelés dátuma ÉÉÉÉHHNN 16-23
                  'szamla'   : ' '.repeat(13), // A terhelendő számla száma (ha a kezdeményező pénzforgalmi jelzőszáma nincs kitöltve) * 24-36
                  'kdpfjsz'  : conf.sendaccount, // Kezdeményező pénzforgalmi jelzőszáma (ha a terhelendő számlaszáma nincs megadva) * 37-60
                  'pfszj'    : undefined,     // Kedvezményezett pénzforgalmi jelzőszáma * 61-84
                  'kednev'   : undefined,     // Kedvezményezett ügyfél neve, telephelye * 85-116
                  'orszagkod': undefined,     // Kedvezményezett országkódja 117-118
                  'jogcim'   : ' '.repeat(3), // jogcim 119-121
                  'filler'   : ' '.repeat(15),// fenntartott 122-136
                  'indok'    : undefined,     // Közlemény rovat 137-206
                  'referencia': ' '.repeat(6),// fenntartott 207-212
                  'kulsref'  : ' '.repeat(10),// Ügyfél által megadható azonosító, megjelenik a kivonaton 213-222
                  'refszam'  : ' '.repeat(6), // Bizonylatszám 223-228
                  'megjegyzes': ' '.repeat(20),// Ügyfél saját belső használatára (a bank nem dolgozza fel) 229-248
                  'CRLF'     : '\r\n'         // 0x0D 0x0A * 249-250
      };

      //reference table
      refss = SpreadsheetApp.openById(conf.refssid);
      refdata = refss.getActiveSheet();

      ss = SpreadsheetApp.openById(ssid);
      sdata = ss.getActiveSheet().getDataRange().getValues();

      sdata.forEach(function(exp){
        eltxt['osszeg'] = ' '.repeat(12-exp[0].toString().length) + (exp[0]).toFixed(2) ;  //works both ways, filled with space or 0 at the beginning, or filled with space at the end. '.' or ',' as separator
        eltxt['erteknap'] = new Date(exp[1]).toISOString().substring(0,10).replaceAll('-','');
        
        refsearch = exp[2] ? refdata.createTextFinder(exp[2]).findAll() : '';
        switch(refsearch.length){
          case 0 : // another search is needed for full name
            refsearch = refdata.createTextFinder(exp[3]).findAll();
            if(refsearch.length > 1 || refsearch.length == 0){
              Logger.log('The second search found ' + refsearch.length + ' options for ' + exp[3] + '!');
              return;
            }
          case 1 : 
            refrow = refdata.getRange(refsearch[0].getRow(), 1, 1, 3).getValues();
            eltxt['pfszj'] = refrow[0][2].replaceAll('-','').length == 24 ? refrow[0][2].replaceAll('-','') : refrow[0][2].replaceAll('-','') + '0'.repeat(8);
            eltxt['kednev'] = refrow[0][1].length >= 32 ? refrow[0][1].substring(0, 32) : refrow[0][1] + ' '.repeat(32-refrow[0][1].length);
            break;
          default:
              Logger.log('The first search found ' + refsearch.length + ' options!');
        }
        eltxt['orszagkod'] = exp[4] ? exp[4] : 'HU';
        eltxt['indok'] = exp[5] + ' '.repeat(70-exp[5].toString().length);
        scontent += Object.values(eltxt).join('');

        //clear mandatory elements to avoic errors
        eltxt['indok'] = eltxt['kednev'] = eltxt['pfszj'] = eltxt['osszeg'] = '';
      })

      // export the output
      stxt = DriveApp.createFile(conf.ssname + 'r.txt', removeaccent(scontent));
      if(conf.parentFolderId)
      DriveApp.getFileById(stxt.getId()).moveTo(DriveApp.getFolderById(conf.parentFolderId));

      Logger.log('Link to Electra file: ' + ss.getUrl());
  } 
  else{
    Logger.log('Can not open spreadsheet file!');
    return;
  }
  
}
