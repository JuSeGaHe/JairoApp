ons.ready(function(){
  ons.disableDeviceBackButtonHandler();
  document.addEventListener('backbutton', function () {}, false);
});
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

}

document.addEventListener('show', function(event) {

  var page = event.target;
  if (page.id === 'page1') {
    activity1.onCreate();
    activity1.callbacksButton(page);
  } else if(page.id === 'page2'){
    scanDevices.onScan();
  } else if(page.id === 'page3'){
    //notificationDevices.onStartNotification();
  }
});

function clearLocalStorage(){
    window.sessionStorage.clear();
}

var activity1 = {
  onCreate: function(){

    if(window.sessionStorage.getItem("deviceName") != undefined || window.sessionStorage.getItem("deviceName") != null){
      document.getElementById("title-device").innerHTML = "Disconnect Device";
      document.getElementById("row-device").innerHTML = window.sessionStorage.getItem("deviceName");
      document.getElementById("row-device").style.color = "green";
      document.getElementById("btn_escanear").style.display = "none";
      document.getElementById("btn_desconectar").style.display = "block";
      document.getElementById("btn_red").disabled = false;
      document.getElementById("btn_mediciones").disabled = false;
    } else {
      document.getElementById("title-device").innerHTML = "Scan Device";
      document.getElementById("row-device").innerHTML = "Any device paired";
      document.getElementById("row-device").style.color = "red";
      document.getElementById("btn_escanear").style.display = "block";
      document.getElementById("btn_desconectar").style.display = "none";
      document.getElementById("btn_red").disabled = true;
      document.getElementById("btn_mediciones").disabled = true;
    }

    if(window.sessionStorage.getItem("sendWIFI") != undefined || window.sessionStorage.getItem("sendWIFI") != null){
      var responseWIFI = window.sessionStorage.getItem("sendWIFI");
      switch(responseWIFI[0]){
        case '&':
          document.getElementById("row-wifi").innerHTML = "Connecting to " + responseWIFI.slice(1);
          document.getElementById("row-wifi").style.color = "orange";
          break;
        case '#':
          document.getElementById("row-wifi").innerHTML = "Connected to " + responseWIFI.slice(1);
          document.getElementById("row-wifi").style.color = "green";
          break;
        case '%':
          document.getElementById("row-wifi").innerHTML = "Not connected";
          document.getElementById("row-wifi").style.color = "red";
          break;  
      }
    } else {
      document.getElementById("row-wifi").innerHTML = "Not connected";
      document.getElementById("row-wifi").style.color = "red";
    }

  },
  callbacksButton: function(page){
    page.querySelector('#btn_escanear').onclick = function() {
      myNavigator.pushPage('page2.html', {data: {title: 'Page 2'}});
    };
    page.querySelector('#btn_red').onclick = function() {
      var dialog = document.getElementById('my-alert-network');

          if (dialog) {
              dialog.show();
          } else {
              ons.createElement('alert-network.html', { append: true })
                .then(function(dialog) {
                  dialog.show();
                });
          }
    };
    page.querySelector('#btn_mediciones').onclick = function() {
      notificationDevices.onStartNotification();
    };
    page.querySelector('#btn_desconectar').onclick = function() {
      connectDevices.onDisconnect();
    };
  }
};
