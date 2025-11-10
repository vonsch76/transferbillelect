Transfer accounts payable from Billingo.hu-s Spendings to Electra, using Billingo API

Ezzel a Google Apps Scripttel a heti fizetendő számláiadat félautomatikusan átrakhatod Electra forintátutalás formátumba, így beavatkozás nélkül a fizetendő összegek, számlaszámok stimmelni fognak.
Előfeltételek: Billingo.hu API, Electra hozzáférés, referencia Google Sheet
Hátrány: Félautomata, első lépésben előállítja az utalásokról a Google Sheetet, amely szerkeszthető, majd második lépéseben elkészül a TXT fájl, amely letölthető és Electra rendszerbe forintátutalásként feltölthető. Az ékezeteket Electra rendszerbe átmásoláskor megszünteti.

Telepítés:
1. Készíts egy új Google Apps Sciptet.
2. Másold át a fájlokat.
3. Töltsd ki a config.gs-t az adataiddal.
4. Készítsd el a referencia Google Sheetet.

Konfigurációs beállítások
        'billingo_apikey' : '', //Billingo.hu által generált API kulcsod
        'parentFolderId'  : '', //könyvtár, ahol a fájlokat látni szeretnéd. (Lépj böngészőben az adott könyvtárba és másold át a folders/ utáni karaktersorozatot.) Üres is lehet. 
        'refssid'         : '', //referencia Google Sheet file azonosítója. (Ha megnyitod a Google Sheets filet, akkor a 'spreadsheets/d/' és '/edit' közötti rész.
        'ssname'          : 'utalasok_' + tperiod(true),                  //a Google sheets file neve, az Electra file egy r-es toldatot kap
        'startday'        : tperiod(true),                                //az adott hét első napja
        'endday'          : tperiod(false, 6),                            //periódus vége, első naphoz képest. Első nap 0, így 6 egy hét lesz.
        'shiftweekend'    : true,                                         //szombat-vasárnapra kerülő utalásokat következő hétfőre tolja
        'sendaccount'     : '',                                           //küldő számlaszám, 24 szám, semmi más 
        'method'          : ['wire_transfer'],                            //keresett fizetési módok : aruhitel, bankcard, barion, barter, cash, cash_on_delivery, coupon, elore_utalas, ep_kartya, kompenzacio, levonas, online_bankcard, other, paylike, payoneer, paypal, paypal_utolag, payu, pick_pack_pont, postai_csekk, postautalvany, skrill, szep_card, transferwise, upwork, utalvany, valto, wire_transfer Ha többet akarsz megadni, akkor pl ['wire_transfer', 'aruhitel']

A referencia Google Sheet file felépítése
  A oszlop - Billingo azonosító. Az egyes sheetekből töltheted fel pl.
  B oszlop - fél neve Billingoban szereplő módon
  C oszlop - számlaszám: 16 vagy 24 karakter, '-' lehet közben

Használat:
1. Nyisd meg a Google Apps Scriptet és válaszd ki a projektet.
2. Válaszd a code.gs-t és futtast a 'get_weeklytransfers'-t. Erre elkészül a Google Apps Sheet file, amit vagy a Drive recent menüjére kattintva vagy a link új ablak/tab-ba másolásával érhetsz el. A fájl formátuma: A - fizetendő összeg, B - fizetés időpontja, C - Billingo partnerszám, D - partner neve, E - partner országkódja, F - megjegyzés.
3. Nyisd meg és szerkeszd a fájlt, új tételeket is hozzáadhatsz, kötelező mezők: összeg, időpont, név. A formátumnál vedd figyelembe a fájlban szereplő formátumot.
4. Ha minden megfelelő futtasd a 'convert_weeklytransfer'-t, majd töltsd fel a bankba. Átutalás előtt ellenőrizd az adatokat még egyszer.

A partner keresése első körben a Billingo által megadott ügyfélkódok között (referencia táblázat A oszlop), második körben a nevek között történik. Ha egynél több találat van, akkor az Electra TXT fájlba nem kerül be.
