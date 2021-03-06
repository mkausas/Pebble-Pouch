Pebble.addEventListener('showConfiguration', function(e) {
  // Show config page
  Pebble.openURL('http://0cdc8d30.ngrok.io');
});

var start_month;
var start_day;
var start_year;
var end_month;
var end_day;
var end_year;
var budget;

Pebble.addEventListener('webviewclosed', function(e) {
  // "start_month=1&start_day=1&start_year=15&end_month=1&end_day=1&end_year=15&budget=500"
  console.log('Configuration window returned: ' + e.response);
  var x = e.response;
  // start month
  start_month = parseInt(x.substring(x.indexOf('=') + 1, x.indexOf('&')));
  x = x.substring(x.indexOf('&') + 1);
  start_day = parseInt(x.substring(x.indexOf('=') + 1, x.indexOf('&')));
  x = x.substring(x.indexOf('&') + 1);
  start_year = parseInt(x.substring(x.indexOf('=') + 1, x.indexOf('&')));
  x = x.substring(x.indexOf('&') + 1);
  end_month = parseInt(x.substring(x.indexOf('=') + 1, x.indexOf('&')));
  x = x.substring(x.indexOf('&') + 1);
  end_day = parseInt(x.substring(x.indexOf('=') + 1, x.indexOf('&')));
  x = x.substring(x.indexOf('&') + 1);
  end_year = parseInt(x.substring(x.indexOf('=') + 1, x.indexOf('&')));
  x = x.substring(x.indexOf('&') + 1);
  budget = parseInt(x.substring(x.indexOf('=') + 1));
  console.log("Start date: " + start_month + "/" + start_day + "/" + start_year);
  console.log("End date: " + end_month + "/" + end_day + "/" + end_year);
  console.log("User wants budget of: $" + budget);
  
  sendInfo();
});

function getInfo(type) {
  // create http request
  var xmlHttp = null;
  xmlHttp = new XMLHttpRequest();
  
  var apiKey = "72aafb5e4adc36c1b33cbd9a7549853a";
  var requestURL = "";
  var requestType = "GET";
  switch (type) {
    // Find all bills for a specific account (GET); all billing information
    case 0:
      requestURL = "http://api.reimaginebanking.com/accounts/55cef43a2644c1aa1065164b/bills?key=" + apiKey;
      break;
      
    // Find all accounts (GET); contains balance 
    case 1:
      requestURL = "http://api.reimaginebanking.com/accounts?type=Credit%20Card&key=" + apiKey;  
      break;
  }
      
  xmlHttp.open( requestType, requestURL, false );
  xmlHttp.send( null );
  
  var obj = JSON.parse(xmlHttp.responseText);
  
  if (xmlHttp.status == 200) {
//     console.log("Got status of 200!");
  } else {
    console.log("Response not 200");
  }

  return obj;
}
  
function sendInfo() {
  console.log("About to send info!");

  var info = {0 : 0};
  
  // Get capital one info
  var json = getInfo(1);
  if (json) {
    info = {300 : 0};
    console.log("Current Balance: " + json[0].balance);
//       info = {0 : json[0].balance};
    info[0] = json[0].balance;
    // grab the bill data
    json = getInfo(0);
    var numBills = json.length;
    console.log("Number of Bills: " + numBills);
    info[1] = numBills;

    for (var i = 0; i < numBills; i++) {
      var currentBill = json[i]; 
      console.log("Bill " + i);
      console.log("Payee: " + currentBill.payee);
      console.log("Payment Date: " + currentBill.payment_date);
      console.log("Payment Amount: " + currentBill.payment_amount);

      var fullDate = currentBill.payment_date;
      var splitDate = fullDate.split("/");

      var startingPoint = (i * 5) + 2;
      // bill payee and amount
      info[startingPoint] = currentBill.payee;
      info[startingPoint + 1] = currentBill.payment_amount;

      // Date info
      info[startingPoint + 2] = parseInt(splitDate[0]);
      info[startingPoint + 3] = parseInt(splitDate[1]);
      info[startingPoint + 4] = parseInt(splitDate[2]);
      console.log("Month " + parseInt(splitDate[0]));
      console.log("Day " + parseInt(splitDate[1]));
      console.log("Year " + parseInt(splitDate[2]));
    }
  }

  if (start_month) {
//       info[300] = 1;
    info = {300 : 1};

    info[1000] = start_month;
    info[1001] = start_day;
    info[1002] = start_year;
    info[1003] = end_month;
    info[1004] = end_day;
    info[1005] = end_year;
    info[1006] = budget;
  }

  Pebble.sendAppMessage(info,
    function(e) {
      console.log('Successfully delivered message with transactionId=' + e.data.transactionId);
    },
    function(e) {
      console.log('Unable to deliver message with transactionId=' + e.data.transactionId + ' Error is: ' + e.error.message);
    }
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    sendInfo();
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log("AppMessage received!");
    
    
    
  }                     
);
