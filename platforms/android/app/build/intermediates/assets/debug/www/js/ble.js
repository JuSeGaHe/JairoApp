var timer;
var timerSendData; 
var name_network;
var password_network;

var parameters = {
    service: "FFE0",
    characteristic: "FFE1"
};

var loader = {
	
	visibleLoader: function(){
		document.getElementById("elementLoader").style.visibility = "visible";
	},

	hideLoader: function(){
		document.getElementById("elementLoader").style.visibility = "hidden";
	},

	timeoutScan: function(){
		ons.notification.alert("No devices found");
		connectDevices.showMainPage();
		loader.hideLoader();
	},

	bluethootNotActive: function(){
		ons.notification.alert("It is necessary to activate bluetooth");
		connectDevices.showMainPage();
		loader.hideLoader();
	},

	timeoutMeasure: function(){
		clearInterval(timerSendData);
		ons.notification.alert("No measurements were received");
		connectDevices.showMainPage();
		loader.hideLoader();
	}
};

function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

var scanDevices = {

	onScan: function() {
		ble.enable(
		    function() {
		    	loader.visibleLoader();
		        timer = setTimeout(function() { loader.timeoutScan(); }, 30000);
				ble.startScan([], scanDevices.onDiscoverDevice, scanDevices.onError);
		    },
		    function() {
		        loader.bluethootNotActive();
		    }
		);
	},

	onDiscoverDevice: function(device){
		var list = document.getElementById("scrollDevices");
        if(device.name != undefined || device.name !=null){
        	clearTimeout(timer);
        	loader.hideLoader();
            document.getElementById("imageNotFound").style.display = "none";
            var listItem = document.createElement('ons-card'), 
            html = '<b>' + device.name + '</b>';
            listItem.dataset.deviceid = device.id;
            listItem.dataset.deviceName = device.name;
            listItem.innerHTML = html;
            list.appendChild(listItem);
            listItem.addEventListener('click', scanDevices.onAlertDialog, false);
        }
	},

	onAlertDialog: function(e){
		ons.notification.confirm({
            message: 'Do you want to pair this device?',
            callback: function(idx) {
              switch (idx) {
                case 1:
                	window.sessionStorage.setItem('deviceID',e.target.dataset.deviceid);
                	window.sessionStorage.setItem('deviceName',e.target.dataset.deviceName);
                    connectDevices.onConnect();
                    break; 
                }
            }
        });
	},

	onError: function(e){
		ons.notification.alert(e);
	}

};

var connectDevices = {

	onConnect: function(){
		loader.visibleLoader();
		ble.connect(window.sessionStorage.getItem("deviceID"), connectDevices.onConnectSuccess, connectDevices.onError);
	},

	onConnectSuccess: function(){
		loader.hideLoader();
		ons.notification.alert('Successful Connection');
		connectDevices.onStartNotification();
	},

	onStartNotification: function(){
		ble.startNotification(window.sessionStorage.getItem("deviceID"),
                 parameters.service,
                 parameters.characteristic, 
                 notificationDevices.onReadData, 
                 notificationDevices.onError);
		connectDevices.sendDataStatusWIFI();
	},

	sendDataStatusWIFI: function(){
		var convertData = stringToBytes("=");
		ble.write(window.sessionStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristic,
                  convertData,
                  function(){ connectDevices.showMainPage(); },
                  notificationDevices.onError);	
	},

	onDisconnectSuccess: function(){
		loader.hideLoader();
		window.sessionStorage.clear();
		ons.notification.alert('Successful Disconnection');
		activity1.onCreate();
	},

	onDisconnect: function() {
		loader.visibleLoader();
        ble.disconnect(window.sessionStorage.getItem("deviceID"), connectDevices.onDisconnectSuccess, connectDevices.onErrorDisconnect);
    },

	showMainPage: function(){
		document.querySelector('#myNavigator').resetToPage("page1.html", { animation: "slide" });
	},

	onError: function(e){
		loader.hideLoader();
		ons.notification.alert("Could not connect to the device");
		window.sessionStorage.clear();
		activity1.onCreate();
	},

	onErrorDisconnect: function(e){
		loader.hideLoader();
		ons.notification.alert(e);
	}
};

var notificationDevices = {

	showMainPage: function(){
		loader.visibleLoader();
		document.querySelector('#myNavigator').pushPage('page3.html', {data: {title: 'Page 3'}});
	},

	onStartNotification: function(){
		notificationDevices.showMainPage();
		timerSendData = setInterval(function(){ notificationDevices.sendParameter(); }, 1500);
		timer = setTimeout(function() { loader.timeoutMeasure(); }, 4000);
	},

	sendParameter: function(){
		var convertData = stringToBytes("D");
		ble.write(window.sessionStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristic,
                  convertData,
                  true,
                  notificationDevices.onError); 
	},

	onReadData: function(data){
		var info = bytesToString(data);
		info = info.trim();
		switch(info[0]){
			case 'S':
				loader.hideLoader();
				clearTimeout(timer);
				var chain = info.slice(1,-1);
				var info_split = chain.split("&");
				document.getElementById("volt").innerHTML = info_split[0];
				document.getElementById("current").innerHTML = info_split[1];
				document.getElementById("temp1").innerHTML = info_split[2];
				document.getElementById("temp2").innerHTML = info_split[3];
				break;
			case 'M':
				loader.hideLoader();
				clearTimeout(timer);
				var chain = info.slice(1,-1);
				var info_split = chain.split("&");
				document.getElementById("pres1").innerHTML = info_split[0];
				document.getElementById("pres2").innerHTML = info_split[1];
				document.getElementById("hum1").innerHTML = info_split[2];
				document.getElementById("hum2").innerHTML = info_split[3];
				break;
			default:
				window.sessionStorage.setItem("sendWIFI", info);
				activity1.onCreate()
				break;
		}
	},

	onCancel: function(){
		clearInterval(timerSendData);
		connectDevices.sendDataStatusWIFI();
	},

	onError: function(e){
		ons.notification.alert(e);
	}
};

var sendDataDevices = {
	onWriteNetwork: function(){
		loader.visibleLoader();
		var net = ","+name_network+"{"+password_network+"|";
		var convertData = stringToBytes(net);
		ble.write(window.sessionStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristic,
                  convertData,
                  sendDataDevices.onSuccess,
                  sendDataDevices.onFailure);
	},

	onSuccess:function(){
		loader.hideLoader();
		alertNetwork.onDismiss();
		ons.notification.alert("Network data received");
		activity1.onCreate();
	},

	onFailure: function(e){
		loader.hideLoader();
		alertNetwork.onDismiss();
		ons.notification.alert(e);
	}
};

var alertNetwork = {
	onReciveData: function(){
		name_network = $("#network").val();
	    password_network = $("#net-password").val();
	    if(name_network == "" || name_network == undefined || password_network == "" || password_network == undefined){
	        ons.notification.alert('The data is incomplete');
	    } else {
	        alertNetwork.onDismiss();
	        sendDataDevices.onWriteNetwork();
	    }
	},

	onDismiss:function(){
		document.getElementById('my-alert-network').hide();
	}
}