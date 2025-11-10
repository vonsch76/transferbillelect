function downloadconfig() {
  return {
        'billingo_apikey' : '', 
        'parentFolderId'  : '',                                            //folder to move the files to, can be empty
        'refssid'         : '',                                           //ssid of the reference google sheet
        'ssname'          : 'utalasok_' + tperiod(true),                  //base filename for the spreadsheet and electra text file
        'startday'        : tperiod(true),                                //first day of the current week
        'endday'          : tperiod(false, 6),                            //offset to first day, week starts at 0, so 6 is already one week
        'shiftweekend'    : true,
        'sendaccount'     : '',                                           //account originating the transfer, 24 numbers
        'method'          : ['wire_transfer'],                             //values : aruhitel, bankcard, barion, barter, cash, cash_on_delivery, coupon, elore_utalas, ep_kartya, kompenzacio, levonas, online_bankcard, other, paylike, payoneer, paypal, paypal_utolag, payu, pick_pack_pont, postai_csekk, postautalvany, skrill, szep_card, transferwise, upwork, utalvany, valto, wire_transfer
        };
}
