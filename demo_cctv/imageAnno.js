"use strict";

/**
* Test version (TuomoL)
*
* Extension requirements:
* - screen resolution 1920x1080
* - Mozilla or Chrome browser
* - Operating system Windows, Linux or MacOs
* - Browser must cover whole screen!
* - Taking screenshot: PrintScreen in (Win) and Ctrl+Alt+PrintScreen (Linux) and Command+Shift+3 (Mac)
*
*/

var SERVER_URL; // open for test purposes
var API_KEY;

const SCALE = window.devicePixelRatio;
const IMG = 700; // Send image size
const ER = 6378137; // (equatorial radius): 6378137.0 m
const ES = 0.00669437999014; // e2 (eccentricity squared)
const LAT_MOVE = 0.000009; // 1m/0.000009lat using estimation (average = 45deg)

var placeName;
var placeId;
var str2;
var lon_move; // lon need to calculate because its not that static than lat
var picture;
var k = 0;
var camera_count = 0;
var shapes = [];
var points = [];
var cameras = [];
var stop = false;
var coord = [];
var degree;
var business;
var latD;
var camera_lat;
var camera_lon;
var detailObj = [];
var loc_w;
var loc_h;
var camera_add = 0;
var server = 0;
var color2 = "#ff0000";
var point_changer = 0;
var remove = false;
var check = 0;

setRectangle();
selectDrawingareaButtons();
configServer();
listenersReg();

// Send iframe knowledge about server location if user has entered it
function configureServerLocation() {
	
	API_KEY = document.getElementById("apiKey").value;
	SERVER_URL = document.getElementById("protocol").value; // + "://" + document.getElementById("ip1").value + ":" + document.getElementById("port1").value;
	createIframe();
		
	document.getElementById("bg_label").remove();
	pasteHandler();
}

function makeSelectSearchable() {
	$(document).ready(function() {
		$('#model').searchable();
	});
	//document.querySelector('#model').searchable();
}

function configServer() {

	var label = document.createElement("LABEL");
	label.setAttribute("id", "bg_label");
	label.style = "position: absolute; z-index: 10000003; width: 300px; left:" + (window.innerWidth/2+(IMG/2/SCALE+30)) + "px; top: " + (window.innerHeight/2-(IMG/2/SCALE)) + "px; font-family: arial; background-color: #ffffff;";
	document.body.appendChild(label);

	var head = document.createElement("INPUT");
	head.setAttribute("type", "text");
	head.setAttribute("value", "Configure server location");
	head.style = "width: 280px; padding: 10px 10px; font-size: 20px; text-align: left; font-weight: bold; border: hidden;";
	head.readOnly = true;
	document.getElementById("bg_label").appendChild(head);

	document.getElementById("bg_label").appendChild(document.createElement("BR"));

	var protocol = document.createElement("INPUT");
	protocol.setAttribute("type", "text");
	protocol.setAttribute("id", "protocol");
	protocol.setAttribute("value", "https://1.2.3.4:20001");
	protocol.style = "padding: 10px 10px; font-size: 14px; border-radius: 4px; background-color: #ddddff; text-align: left;";
	document.getElementById('bg_label').appendChild(protocol);

	document.getElementById("bg_label").appendChild(document.createElement("BR"));

	var example = document.createElement("INPUT");
	example.setAttribute("type", "text");
	example.setAttribute("value", "Example: http://0.0.0.0:8888");
	example.style = "width: 280px; padding: 10px 10px; font-size: 10px; text-align: left; font-style: italic; border: hidden;";
	example.readOnly = true;
	document.getElementById("bg_label").appendChild(example);
	
	document.getElementById("bg_label").appendChild(document.createElement("BR"));

	var api = document.createElement("INPUT");
	api.setAttribute("type", "text");
	api.setAttribute("id", "apiKey");
	api.setAttribute("value", "apiKey");
	api.style = "padding: 10px 10px; font-size: 14px; border-radius: 4px; background-color: #ddddff; text-align: left;";
	document.getElementById("bg_label").appendChild(api);
	
	document.getElementById("bg_label").appendChild(document.createElement("BR"));
	document.getElementById("bg_label").appendChild(document.createElement("BR"));
	
	var servBut = document.createElement("BUTTON");
	servBut.setAttribute("type", "submit");
	servBut.setAttribute("id", "servBut");
	servBut.innerHTML = "OK";
	servBut.style = "padding: 10px 10px; color: white; background-color: #5050ff; font-size: 16px; padding: 10px;";
	servBut.addEventListener("mouseover", function(){document.getElementById('servBut').style.backgroundColor = '#0000ff';});
	servBut.addEventListener("mouseout", function(){document.getElementById('servBut').style.backgroundColor = '#5050ff';});
	document.getElementById("bg_label").appendChild(servBut);

	function init() {
		servBut.addEventListener("click", configureServerLocation);
	}

	init();

}

function sendAutodetectData() {
	
	var d = new Date();
	var date = "" + d.getFullYear() + (d.getMonth()+1) + d.getDate() + "_" + d.getHours() + "h" + d.getMinutes() + "m" + d.getSeconds() + "s"; // imagePath and file name from date and time

	var inf = {
		url: window.location.href, // url from the site where picture has captured
		date_created: d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate(),
		// TODO: will have to remove in the future, do NOT remove now to keep backward compatible with existing/previously collected JSON data
		data_created: d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()
	};

	var obj2 = {
		info: inf,
		imagePath: date + ".png", // where file is located
		imageData: picture, // base64 IMG data
		confirmation: "ok"
	};

	var obj = {
		apiKey: API_KEY,
		data: obj2
	};
	
	var iframe = document.getElementById("frame");
	iframe.contentWindow.postMessage(JSON.stringify(obj), '*');
	
	waitForResponse2();
	
	// Wait for iframe to respond, has data been sent successful to server or not
	function waitForResponse2() {
		if(server === 0){
			setTimeout(function() {waitForResponse2();}, 100);
			var ctx = document.getElementById("canva2").getContext("2d");
			ctx.globalAlpha = 1.0;
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(220, 250, 300, 40);
			ctx.font = "20px Georgia";
			ctx.fillStyle = "#000000";
			ctx.fillText("Auto-detect in process", 240, 280);
		}
		else{waitResponse2();}
	}
}

function waitResponse2() {
	if(server === 1) {
		removeNotification("D"); //, 3000);
	}
	else if(server === -1){
		alert("Cannot connect to server!");
		server = 0;
		document.getElementById("autoButton").disabled = false;
		var y = document.getElementById("autoButton");
		y.innerHTML = "Auto-detect";
		var ctx = document.getElementById("canva2").getContext("2d");
		ctx.clearRect(0, 0, IMG, IMG);
	}
}

function removeNotification(x) {
	var ctx = document.getElementById("canva2").getContext("2d");
	if (x == "D") {
		ctx.clearRect(0, 0, IMG, IMG);
	}
	else {
		ctx.clearRect(0, 0, IMG, IMG);
		document.getElementById("image_canvas").remove();
		document.getElementById("polygon_canvas").remove();
		document.getElementById("canva").remove();
		document.getElementById("canva2").remove();
		document.getElementById("canva4").remove();
		document.getElementById("white_canvas").remove();
		document.getElementById("box").remove();
		document.getElementById("label_for_table").remove();
	}
}

function selectDrawingareaButtons() {

	var color;
	var i;
	for(i = 0; i<3 ; i++) {
		var btn = document.createElement("BUTTON");
		if(i==1){color = '#0000ff';}
		else{color = '#aaaaff';}
		btn.setAttribute("id", "sel_button" + i);
		btn.style = "position: absolute; width: 30px; height: 30px; z-index: 10000003; left: " + (window.innerWidth/2-(i*35)) + "px; top: " + (window.innerHeight-50) + "px; background-color:" + color;
		document.body.appendChild(btn);
	}
}

window.addEventListener("keydown", event => {
	
	// Handle camera type selection 'directed'
	if(event.key == "F1") {
		event.preventDefault();
		var ctype = document.querySelector('#type-dropdown');
		ctype.value = "Directed";
		color2 = "#ff0000";
		var cbutton = document.querySelector('#buttonC');
		cbutton.click();
	}
	
	// Handle camera type selection 'round'
	else if(event.key == "F2") {
		event.preventDefault();
		var ctype = document.querySelector('#type-dropdown');
		ctype.value = "Round";
		color2 = "#0000ff";
		var cbutton = document.querySelector('#buttonC');
		cbutton.click();
	}
	
	// Handle send
	else if(event.key == "F4") {
		event.preventDefault();
		sendAnnotationData();
	}
	
	// Handle undo
	else if(event.ctrlKey && event.key === 'z') {
		if(points.length > 1) {
			remove = true;
			drawCameras();
		}
		// If user wants to undo first point, it will considered as do from the beginning
		else if (points.length == 1) {
			k = 0;
			camera_count = 0;
			shapes = [];
			points = [];
			coord = [];
			camera_add = 0;
			server = 0;
			document.getElementById("image_canvas").remove();
			document.getElementById("polygon_canvas").remove();
			document.getElementById("canva").remove();
			document.getElementById("canva2").remove();
			document.getElementById("canva4").remove();
			document.getElementById("white_canvas").remove();
			document.getElementById("label_for_table").remove();
			document.getElementById("box").remove();
			document.getElementById("sel_button0").disabled = false;
			document.getElementById("sel_button1").disabled = false;
			document.getElementById("sel_button2").disabled = false;
		}
		else return;
	}
	
	// Not relevant key event
	else return;
	});

// Listener for message (business list and server response)
window.addEventListener('message', function(event) {

	if (event.origin == SERVER_URL){
		
		//console.log(event.data);
		
		if(event.data == "Error") {
			server = -1;
		}
		else if(event.data == "OK") {
			server = 1;
		}
		else if (event.data != '{"null":null}') {
			
			var data = JSON.parse(event.data);
			
			//console.log(data);
			
			if(data.inference_time != null) {
				var json = event.data;
				drawAutodetect(json);
			}
			
			// details
			else if(data.url != null) {
				detailObj[0] = data;
				console.log(detailObj);
			}
		}
		// business/companies/camera owners
		else {
			business = data;
			
			//TEMPORARY 
			let dropdown = document.getElementById('business-dropdown');
			dropdown.length = 0;

			let defaultOption = document.createElement('option');
			defaultOption.text = 'Choose business';

			dropdown.add(defaultOption);
			dropdown.selectedIndex = 0;
			//TEMPORARY 
			//showBusiness(); OPEN THIS AND CHANGE IFRAME
		}
	}
});


function drawAutodetect(json) {
	
	// DEBUG: test input
	//var json = '{"inference_time": 0.31128454208374023,"output": {"0": {"area": 6910,"box_coords": [140.27346801757812,351.86163330078125,211.48353576660156,448.9004821777344],"class": "round","confidence": "100"},"1": {"area": 6082,"box_coords": [157.07046508789062,494.4059143066406,242.58958435058594,565.5277709960938],"class": "round","confidence": "100"},"2": {"area": 5694,"box_coords": [477.5686340332031,123.22610473632812,557.9022216796875,194.11569213867188],"class": "round", "confidence": "100"},"3": {"area": 3191,"box_coords": [111.57902526855469,492.5663146972656,166.890625,550.274658203125],"class": "round","confidence": "100" }}}';
	
	var type;
	var color;
	var	s_type;
	var tex2 = JSON.parse(json);
	//console.log("drawAutodetect", tex2);

    for (let [key, output] of Object.entries(tex2.output)) {

		if (output.class == 'round') {
			color = "#0000ff";
			type = 'round';
		}
		else {
			color = "#ff0000";
			type = 'directed';
		}
		
		var ctx = document.getElementById("polygon_canvas").getContext("2d");
		
		// Autodetect returned pixel-accurate shape mask polygon
		if (tex2.output[0].polygons != undefined) {
			
			s_type = "polygon";
			
			// TODO TUOMO FIX!!! points are not inserted. Only points[0 and 1] found rest points are undefined
			for(let [key, polygons] of Object.entries(output.polygons)) {
				
				var j = 0;
				for ( var i = 0 ; i < output.polygons.length ; i += 2 ) {
					ctx.beginPath();
					ctx.globalAlpha = 0.8;
					ctx.strokeStyle = color;
					
					ctx.moveTo(output.polygons[i]/SCALE, output.polygons[i+1]/SCALE);
					ctx.lineTo(output.polygons[i+2]/SCALE, output.polygons[i+3]/SCALE);
					ctx.stroke();
					
					points[j] = [output.polygons[i], output.polygons[i+1]];
					j++;
				}
				
			}
		}
		
		else {
			
			s_type = "rectangle";
			
			var ctx = document.getElementById("polygon_canvas").getContext("2d");
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.rect((output.box_coords[0])/SCALE, (output.box_coords[1])/SCALE, ((output.box_coords[2])-(output.box_coords[0]))/SCALE, ((output.box_coords[3])-(output.box_coords[1]))/SCALE);
			ctx.stroke();
			var j = 0;
			for ( var i = 0 ; i < 4 ; i += 2 ) {
				points[j] = [output.box_coords[i], output.box_coords[i+1]];
				j++;
			}
		}

		ctx.fillStyle = color;
		ctx.textAlign = "center";
		ctx.fillText(output.confidence, (output.box_coords[0])/SCALE, (output.box_coords[1])/SCALE);
		
		//console.log(points);
		addCamera_auto(color, type, s_type);
    }
}

function addCamera_auto(color, type, s_type) {

	getCameraLocation();
	var lat = parseFloat(camera_lat.toString().substring(0, camera_lat.toString().indexOf('.') + 8)); // latitude remove extra decimals
	var lon = parseFloat(camera_lon.toString().substring(0, camera_lon.toString().indexOf('.') + 8)); // longitude remove extra decimals

	var obj1 = {
		label: type, // suggested camera type
		points: points, // camera coordinates
		group_id: null,
		shape_type: s_type,
		flags: {}
	};
	shapes[camera_count] = obj1;

	var obj_camera = {
		camera_type: type,
		camera_model: 'N/A',
		shooting_direction: 0, //TODO open if needed document.getElementById("shoot_dir").value, // Direction that camera is filming
		source: "autodetect",
		points: points,
		lat: lat,
		lon: lon,
		selected_owner: detailObj
	};
	cameras[camera_count] = obj_camera;

	camera_to_table("autodetect", type);

	camera_count += 1;
	camera_add += 1;
	points = [];
}

function camera_to_table(source, cam) {
	
	var index = camera_count+1;
	var row = document.createElement("TR");
	row.setAttribute("id", "row" + index);
	row.style = "padding: 15px; border: 2px solid;";
	document.getElementById("camera_table").appendChild(row);
	
	for(let j = 0 ; j < 4; j++) {
		
		var cell = document.createElement("TD");
		cell.style = "padding: 15px;";
		
		if(j==0) {
			cell.setAttribute("id", "cell0inRow" + index);
			cell.innerHTML = index;
			row.appendChild(cell);
		}
		
		if(j==1) {
			cell.setAttribute("id", "cell1inRow" + index);
			row.appendChild(cell);
			
			var sel = document.createElement("SELECT");
			sel.setAttribute("id", "cameratype-dropdown" + index);
			sel.style = "border-radius: 4px;";
			sel.addEventListener("change", changeType);
			document.getElementById("cell1inRow" + index).appendChild(sel);
		
			let option1 = document.createElement('option');
			let option2 = document.createElement('option');
			if (cam == "directed") {
				option1.text = cam;
				option2.text = "round";
			}
			else {
				option1.text = cam;
				option2.text = "directed";	
			}
				
			document.getElementById("cameratype-dropdown" + index).add(option1);
			document.getElementById("cameratype-dropdown" + index).add(option2);
		}
		
		if(j==2) {
			cell.setAttribute("id", "cell2inRow" + index);
			cell.innerHTML = source;
			row.appendChild(cell);
		}
		
		if(j==3) {
			cell.setAttribute("id", "cell3inRow" + index);
			row.appendChild(cell);
			var del = document.createElement("BUTTON");
			del.setAttribute("type", "submit");
			del.setAttribute("id", "delete_button" + index);
			del.innerHTML = "Delete";
			del.style = "background-color: #ff8888; padding: 2px 2px; font-weight: bold; border-radius: 4px;";
			del.addEventListener("click", handleRowDelete);
			cell.appendChild(del);
		}
	}
}

function changeType(e) {
	
	var str = "" + e.target.id;
	var index = str.substring(str.length-1)-1;
	
	if(cameras[index].source == "autodetect") {
		cameras[index].source = "user";
		document.getElementById("cell2inRow" + (index+1)).innerHTML = "manual";
	}
	
	var value = document.getElementById(str).value;
	cameras[index].camera_type = value;
	shapes[index].label = value;
	
	redrawCameras();
}

function handleRowDelete(e) {

	if (check == 0) {
		
		var str = "" + e.target.id;
		var del_row = str.substring(str.length-1);
		document.getElementById("row" + del_row).remove();
		check++;
		cameras.splice(del_row-1, 1);
		shapes.splice(del_row-1, 1);
		camera_count -= 1;
		camera_add -= 1;
		redrawCameras();
		
		for( var i = del_row-1 ; i < cameras.length ; i++ ) {

			// Change row id
			var row_index = document.getElementById("row" + (i+2))
			row_index.setAttribute("id", "row" + (i+1));
			
			// Change all cell id's
			var cell_index = document.getElementById("cell0inRow" + (i+2));
			cell_index.innerHTML = i+1;
			cell_index.setAttribute("id", "cell0inRow" + (i+1));
			var cell_index = document.getElementById("cell1inRow" + (i+2));
			cell_index.setAttribute("id", "cell1inRow" + (i+1));
			var cell_index = document.getElementById("cell2inRow" + (i+2));
			cell_index.setAttribute("id", "cell2inRow" + (i+1));
			var cell_index = document.getElementById("cell3inRow" + (i+2));
			cell_index.setAttribute("id", "cell3inRow" + (i+1));
			
			// Change delete button id
			var del_but = document.getElementById("delete_button" + (i+2));
			del_but.setAttribute("id", "delete_button" + (i+1));
			
			// Change camera type id
			var sel_type = document.getElementById("cameratype-dropdown" + (i+2));
			sel_type.setAttribute("id", "cameratype-dropdown" + (i+1));
		}
		
	}
	else return;
}

function redrawCameras() {

	var ctx = document.getElementById("polygon_canvas").getContext("2d");
	ctx.clearRect(0, 0, IMG, IMG);
		
	for( var j = 0; j < cameras.length ; j++ ) {

		if(cameras[j].camera_type == 'directed') {
			color2 = '#ff0000';
		}
		else {
			color2 = '#0000ff';
		}

		// Draw color coding
		ctx.fillStyle = color2;
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.moveTo(cameras[j].points[0][0]/SCALE, cameras[j].points[0][1]/SCALE);
		for( var i = 0; i < cameras[j].points.length ; i++ ) {
			ctx.lineTo(cameras[j].points[i][0]/SCALE, cameras[j].points[i][1]/SCALE);
		}
		ctx.closePath();
		ctx.fill();
	}
	
	setTimeout( function() {check = 0;} , 1000); // Chrome remove duplicate fix
}

/** 
*	Listeners for select drawing area
*/
function listenersReg() {
	
	var canvas = document.getElementById("my_canvas2");
	var ctx = canvas.getContext("2d");
	
	//right
	document.getElementById("sel_button0").addEventListener("click", function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			document.getElementById("sel_button1").style.backgroundColor = "#aaaaff";
			document.getElementById("sel_button2").style.backgroundColor = "#aaaaff";
			document.getElementById("sel_button0").style.backgroundColor = "#0000ff";
			loc_w = canvas.width-IMG/SCALE-20;
			loc_h = canvas.height/2-IMG/2/SCALE;
			redraw();
	});
	//middle
	document.getElementById("sel_button1").addEventListener("click", function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			document.getElementById("sel_button0").style.backgroundColor = "#aaaaff";
			document.getElementById("sel_button2").style.backgroundColor = "#aaaaff";
			document.getElementById("sel_button1").style.backgroundColor = "#0000ff";
			loc_w = canvas.width/2-IMG/2/SCALE;
			loc_h = canvas.height/2-IMG/2/SCALE;
			redraw();
	});
	// left
	document.getElementById("sel_button2").addEventListener("click", function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			document.getElementById("sel_button0").style.backgroundColor = "#aaaaff";
			document.getElementById("sel_button1").style.backgroundColor = "#aaaaff";
			document.getElementById("sel_button2").style.backgroundColor = "#0000ff";
			loc_w = 20;
			loc_h = canvas.height/2-IMG/2/SCALE;
			redraw();
	});
}

/**
 *	Draw rectangle into screen to show area
 *	which will be pasted into screen when user enters "print screen" and ctrl+v
 */
function setRectangle() {
	
	var canvas = document.createElement('canvas');
	canvas.setAttribute("id", "my_canvas2");
	canvas.style = "position: absolute; left: 0; top: 0; z-index: 10000000; pointer-events: none;";
	document.body.appendChild(canvas);
	var ctx = document.getElementById("my_canvas2").getContext("2d");

	// Start listening to resize events and draw rectangle.
	initialize();

	function initialize() {
	   
		// Listener for window resize
		window.addEventListener('resize', resizeCanvas, false);

		// Draw rectangle first time
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		loc_h = canvas.height/2-IMG/2/SCALE;
		loc_w = canvas.width/2-IMG/2/SCALE;
		redraw();
	}

	// Resize when window size has changed
	function resizeCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		redraw();
	}
}

// Draw rectangle to fit in new window size
function redraw() {
	var ctx = document.getElementById("my_canvas2").getContext("2d");
	ctx.globalAlpha = 0.2;
	ctx.strokeStyle = "#0000ff";
	ctx.lineWidth = 3;
	ctx.strokeRect(loc_w, loc_h, IMG/SCALE, IMG/SCALE);
}

/**
 * 	PasteHandler
 */
function pasteHandler() {
	
	document.addEventListener('paste', (event) => {
		if (event.clipboardData) {
			var items = event.clipboardData.items;
			if (!items) return;
			
			//access data directly
			var is_image = false;
			for (var j = 0; j < items.length; j++) {
				if (items[j].type.indexOf("image") !== -1) {
					//image
					var blob = items[j].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					paste_createImage(source);
					is_image = true;
				}
			}
			if(is_image == true){
				event.preventDefault();
			}
		}
	});
	
	// draw pasted image to canvas
	function paste_createImage(source) {
		var pastedImage = new Image();
		pastedImage.onload = function () {
			drawImage(pastedImage); //draw image into canvas from the clipboard
		};
		pastedImage.src = source;
	};
}

/**
 *	Draw screen capture into 700x700 canvas to the middle of the screen
 *
 * @param {Image} pastedImage - screen capture
 */
function drawImage(pastedImage) {
	
	// Create white canvas for UI
	var white_canvas = document.createElement('canvas');
	white_canvas.width = window.innerWidth;
	white_canvas.height = window.innerHeight;
	white_canvas.setAttribute("id", "white_canvas");
	white_canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; z-index: 10000001;";
	document.body.appendChild(white_canvas);
	var c = document.getElementById("white_canvas");
	var ctx2 = c.getContext("2d");
	ctx2.beginPath();
	ctx2.fillStyle = "white";
	ctx2.fillRect(0, 0, window.innerWidth, window.innerHeight);

	var height = pastedImage.height;
	var width = pastedImage.width;
	
	var canvas = document.createElement('canvas'); // Canvas for clipboard image
	canvas.width = IMG;
	canvas.height = IMG;
	canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border: 3px solid blue; z-index: 10000002;";
	canvas.setAttribute("id", "image_canvas");
	document.body.appendChild(canvas);
	
	var h = window.innerHeight;
	var ah = screen.availHeight;
	var topBarHeight = ah-h;
	var heig = ((h-IMG/SCALE)/2+topBarHeight)*SCALE;
	
	var wid = loc_w*SCALE;

	var ctx = canvas.getContext("2d");
	ctx.scale(SCALE, SCALE);
	ctx.beginPath();
	
	ctx.drawImage(pastedImage, wid, heig, IMG, IMG, 0, 0, IMG/SCALE, IMG/SCALE);
	ctx.globalCompositeOperation = "source-over";
	
	document.getElementById("sel_button0").disabled = true;
	document.getElementById("sel_button1").disabled = true;
	document.getElementById("sel_button2").disabled = true;
	
	makeUI();
	drawPolygon(canvas);
	getBusiness(); // Send coordinates to server which creates file include businesses nearby the camera

	var dataURL = canvas.toDataURL('image/jpg');
	picture = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	
}


/**
 *	Function that let user to select polygon from the screenshot
 *
 * 	@param {} canvas - for listener
 */
function drawPolygon(canvas) {

	var mousePos;
	
	var canvas_polygon = document.createElement('canvas'); // Canvas for showing polygon
	canvas_polygon.width = IMG;
	canvas_polygon.height = IMG;
	canvas_polygon.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border: 3px solid blue; z-index: 11000001; pointer-events: none";
	canvas_polygon.setAttribute("id", "polygon_canvas");
	document.body.appendChild(canvas_polygon);
	
	var ctx2 = document.getElementById("polygon_canvas").getContext("2d");
	ctx2.scale(SCALE, SCALE);
	
	// New canvas for first point styling if users mouse is near first point
	var canva = document.createElement('canvas');
	canva.width = IMG;
	canva.height = IMG;
	canva.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border: 3px solid blue; z-index: 13000001; pointer-events: none";
	canva.setAttribute("id", "canva");
	document.body.appendChild(canva);

	// New canvas for camera color coding
	var canva2 = document.createElement('canvas');
	canva2.width = IMG;
	canva2.height = IMG;
	canva2.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border: 3px solid blue; z-index: 13000001; pointer-events: none";
	canva2.setAttribute("id", "canva2");
	document.body.appendChild(canva2);

	// New canvas for temporary lines
	var canva4 = document.createElement('canvas');
	canva4.width = IMG;
	canva4.height = IMG;
	canva4.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border: 3px solid blue; z-index: 13000001; pointer-events: none";
	canva4.setAttribute("id", "canva4");
	document.body.appendChild(canva4);

	var context4 = document.getElementById("canva4").getContext("2d");
	context4.scale(SCALE, SCALE);
	
	var context2 = document.getElementById("canva2").getContext("2d");
	context2.scale(SCALE, SCALE);

	var context = document.getElementById("canva").getContext("2d");
	context.scale(SCALE, SCALE);
	
	function listeners() {
		canvas.addEventListener('click', click, false);
		canvas.addEventListener('mousemove', function(evt) {mousePos = getMousePos(canvas, evt); checkMousePos(mousePos);}, false);
		canvas.addEventListener('mousedown', function(evt) {mousePos = getMousePos(canvas, evt);  mouseDown(mousePos);}, false);
		canvas.addEventListener('mouseup', function(evt) {changePoints(canvas, evt);}, false);
	}
	
	function getMousePos(canvas_p, evt) {
		var rect = canvas_p.getBoundingClientRect();
		return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
		};
	}
	
	function click(e) {
		
		var point = Math.round(e.pageX - this.offsetLeft);
		var point2 = Math.round(e.pageY - this.offsetTop);
	
		if(point > 700) {
			point = 700;
		}
		if(point < 0) {
			point = 0;
		}
		if(point2 > 700) {
			point2 = 700;
		}
		if(point2 < 0) {
			point2 = 0;
		}
		
		document.getElementById("type-dropdown").addEventListener("change", myFunction);
		
		function myFunction() {
			
			if(document.getElementById("type-dropdown").value.toLowerCase() == "directed") {
				color2 = "#ff0000";
				drawCameras();
			}
			else {
				color2 = "#0000ff";
				drawCameras();
			}
		}
		
		if(k==0) {
			points[k] = [point, point2];
			
			context4.beginPath();
			context4.globalAlpha = 0.8;
			context4.arc(point/SCALE, point2/SCALE, 3/SCALE, 0, 2 * Math.PI);
			context4.fillStyle = color2;
			context4.fill();
			k++;
		}
		
		// Check if mouse is in spesific area (user want to end polygon drawing)
		else if(stop != true && k!=0 && mousePos.x+8>points[0][0] && mousePos.x-8<points[0][0] && mousePos.y+8>points[0][1] && mousePos.y-8<points[0][1]) {
			
			drawConf();
			
			context4.beginPath();
			context4.moveTo(points[0][0]/SCALE, points[0][1]/SCALE);
			context4.lineTo(points[k-1][0]/SCALE, points[k-1][1]/SCALE);
			context4.strokeStyle = color2;
			context4.stroke();
			context4.closePath();
			
			if(document.getElementById("type-dropdown").value.toLowerCase() == "directed") {
				color2 = "#ff0000";
				drawCameras();
			}
			else if (document.getElementById("type-dropdown").value.toLowerCase() == "round") {
				color2 = "#0000ff";
				drawCameras();
			}

			stop = true;
			
		}
		
		// if k is not 0 and cursor is not in spesific area, then there are more than one point in the image and line need to be drawn from point to point
		else if(k!=0 && stop == false) {
			points[k] = [point, point2];

			context4.beginPath();
			context4.globalAlpha = 0.8;
			context4.arc(point/SCALE, point2/SCALE, 3/SCALE, 0, 2 * Math.PI);
			context4.fillStyle = color2;
			context4.fill();
			
			context4.beginPath();
			context4.moveTo(points[k-1][0]/SCALE, points[k-1][1]/SCALE);
			context4.lineTo(points[k][0]/SCALE, points[k][1]/SCALE);
			context4.strokeStyle = color2;
			context4.stroke();
			context4.closePath();


			k++;
			drawCameras();		
		}
	}
	
	function checkMousePos(mousePos) {
		if(k!=0 && mousePos.x+10>points[0][0] && mousePos.x-10<points[0][0] && mousePos.y+10>points[0][1] && mousePos.y-10<points[0][1]){

			document.getElementById("image_canvas").style.cursor = "pointer"; // Change pointer to info user that object is clickable
			
			// Draw circle over first point
			context.beginPath();
			context.globalAlpha = 1.0;
			context.arc(points[0][0]/SCALE, points[0][1]/SCALE, 10/SCALE, 0, 2 * Math.PI);
			context.fillStyle = "#00ff00";
			context.fill();
		}
		
		else{
			document.getElementById("image_canvas").style.cursor = "default"; // Change pointer back to normal
			context.clearRect(0, 0, IMG, IMG);
		}
	}
	
	var switch_point;
	
	// Point changing need to be done before user adds camera!
	function mouseDown() {
		if(stop == true){
			for(var i=0 ; i<points.length ; i++){
				if(mousePos.x+10>points[i][0] && mousePos.x-10<points[i][0] && mousePos.y+10>points[i][1] && mousePos.y-10<points[i][1]) {
					point_changer = 1;
					switch_point = i;
				}
			}
		}
	}

	function changePoints(canvas_p,e) {
		
		if(point_changer > 0) {
			
			var rect = canvas_p.getBoundingClientRect();
			var px = Math.round(e.clientX - rect.left);
			var py = Math.round(e.clientY - rect.top);
			if(px > 700) {
				px = 700;
			}
			if(px < 0) {
				px = 0;
			}
			if(py > 700) {
				py = 700;
			}
			if(py < 0) {
				py = 0;
			}
			points[switch_point] = [px, py];
			point_changer = 0;
			document.getElementById("canva2").getContext("2d").clearRect(0, 0, IMG, IMG);
			document.getElementById("canva4").getContext("2d").clearRect(0, 0, IMG, IMG);

			context2.fillStyle = color2;
			context2.globalAlpha = 0.2;
			context2.beginPath();
			context2.moveTo(points[0][0]/SCALE, points[0][1]/SCALE);
			for(var i = 0; i < k ; i++) {
				context4.beginPath();
				context4.globalAlpha = 0.8;
				context4.strokeStyle = color2;
				context4.fillStyle = color2;
				context2.lineTo(points[i][0]/SCALE,points[i][1]/SCALE);
				context4.arc(points[i][0]/SCALE, points[i][1]/SCALE, 3/SCALE, 0, 2 * Math.PI);
				if(i>0){
					context4.moveTo(points[i-1][0]/SCALE, points[i-1][1]/SCALE);
					context4.lineTo(points[i][0]/SCALE, points[i][1]/SCALE);
					context4.stroke();
				}
				if(i==k-1){
					context4.moveTo(points[i][0]/SCALE, points[i][1]/SCALE);
					context4.lineTo(points[0][0]/SCALE, points[0][1]/SCALE);
					context4.stroke();					
				}
				context4.closePath();
				context4.fill();
			}
			context2.closePath();
			context2.fill();
			
			
		}
		else return;
	}
	
	listeners();
}

function drawCameras() {
	
	// Handle undo event
	if(remove == true) {
		points.length = points.length-1;
		remove = false;
		k--;
	}

	var context4 = document.getElementById("canva4").getContext("2d");
	var context2 = document.getElementById("canva2").getContext("2d");

	context2.clearRect(0, 0, IMG, IMG);
	context4.clearRect(0, 0, IMG, IMG);

	context2.fillStyle = color2;
	context2.globalAlpha = 0.2;
	context2.beginPath();
	context2.moveTo(points[0][0]/SCALE, points[0][1]/SCALE);
	for(var i = 0; i < k ; i++) {
		context4.beginPath();
		context4.globalAlpha = 0.8;
		context4.strokeStyle = color2;
		context4.fillStyle = color2;
		context2.lineTo(points[i][0]/SCALE,points[i][1]/SCALE);
		context4.arc(points[i][0]/SCALE, points[i][1]/SCALE, 3/SCALE, 0, 2 * Math.PI);
		if(i>0){
			context4.moveTo(points[i-1][0]/SCALE, points[i-1][1]/SCALE);
			context4.lineTo(points[i][0]/SCALE, points[i][1]/SCALE);
			context4.stroke();
		}
		if(i == k-1 && stop == true){
			context4.moveTo(points[i][0]/SCALE, points[i][1]/SCALE);
			context4.lineTo(points[0][0]/SCALE, points[0][1]/SCALE);
			context4.stroke();				
		}
		context4.closePath();
		context4.fill();
	}
	context2.closePath();
	context2.fill();
}

// addCamera data which user have written into extension UI
function addCamera() {

	var y = document.getElementById("sendButton");
	y.disabled = false;
	y.innerHTML = "Submit";

	var url = window.location.href;
	
	if (url.indexOf("google.fi/maps") != -1 || url.indexOf("google.com/maps") != -1) {
		getAngle();
	}
	else {
		degree = 0; // degree = prompt("Please enter camera direction (degree)");
	}
	getCameraLocation();
	
	if (document.getElementById("business-dropdown").value ==  "") {
		alert("Server connection failed");
	}
	else {
		var x = document.getElementById("business-dropdown").value; // get value (owner of the camera)
		/*var web = null;
		var phone = null;
		var phone2 = null;
		var url = null;*/

		if(x == "Choose business") {
			// Do something
		}
		if(x != "Choose business") {
			for (let i = 0; i < Object.keys(business).length; i++) {
				if(business[i].name == x) {
					placeId = business[i].place_id;
					placeName = business[i].name;
					var obj = {
						id: business[i].place_id
					};
					
					var iframe = document.getElementById("frame");
					iframe.contentWindow.postMessage(JSON.stringify(obj), '*');
					break; // Match found, no need to go through hole business list
				}
			}
		}

		var lat = parseFloat(camera_lat.toString().substring(0, camera_lat.toString().indexOf('.') + 8)); // latitude remove extra decimals
		var lon = parseFloat(camera_lon.toString().substring(0, camera_lon.toString().indexOf('.') + 8)); // longitude remove extra decimals

		var camera_type = document.getElementById("type-dropdown").value.toLowerCase();

		var obj1 = {
			label: camera_type, // camera type for AI
			points: points, // camera coordinates
			group_id: null,
			shape_type: "polygon",
			flags: {}
		};
		
		shapes[camera_count] = obj1;
		
		var obj_camera = {
			camera_type: camera_type, // camera type for OSM
			camera_model: document.getElementById("model").value,
			shooting_direction: 0, //TODOdocument.getElementById("shoot_dir").value, // Direction that camera is filming
			source: "user",
			points: points,
			lat: lat,
			lon: lon,
			selected_owner: detailObj
		};
		cameras[camera_count] = obj_camera;

		var ctx2 = document.getElementById("polygon_canvas").getContext("2d");
		document.getElementById("canva2").getContext("2d").clearRect(0, 0, IMG, IMG);
		document.getElementById("canva4").getContext("2d").clearRect(0, 0, IMG, IMG);
		
		// Draw color coding
		ctx2.fillStyle = color2;
		ctx2.globalAlpha = 0.5;
		ctx2.beginPath();
		ctx2.moveTo(points[0][0]/SCALE, points[0][1]/SCALE);
		for(var i = 0; i < k ; i++) {
			ctx2.lineTo(points[i][0]/SCALE,points[i][1]/SCALE);
		}
		ctx2.closePath();
		ctx2.fill();
		
		camera_to_table("manual", camera_type);
		
		/* reset/init that user can add more cameras into picture */
		stop = false;
		document.getElementById("image_canvas").style.pointerEvents = 'auto'; // Back to auto (User can click canvas)
		document.getElementById("buttonC").remove(); // Remove confButton
		k = 0;
		camera_count += 1; // increase variable with 1 for adding more cameras
		points = [];
		document.getElementById("business-dropdown").selectedIndex = 0;
		document.getElementById("type-dropdown").selectedIndex = 0;
		document.getElementById("model").selectedIndex = 0;
	
		var ctx = document.getElementById("canva2").getContext("2d");
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(220, 250, 200, 40);
		ctx.font = "20px Georgia";
		ctx.fillStyle = "#000000";
		ctx.fillText(camera_count + ". Camera added", 240, 280);
		setTimeout(function(){removeNotification("D");}, 1000);
	
		camera_add += 1;
	}
}


function getCameraLocation() {
	var dist = 0; //TODO document.getElementById("distance").value;
	var lat;
	var lon;
	
	/* 
	*	calculate lat and lot movements from user distance estimation.
	*	Triangle were c = user given distance, b=lon, a=lat and angles are 90deg and from maps url second angle.
	*	First handle special cases (Moving towards cardinal points).
	*
	*	IF DIRECTION IS FULLY SOUTH, NORTH, WEST OR EAST GOOGLE MAPS DOESN'T HAVE DIRECTION IN URL!!!
	*/
	if(dist == 0){camera_lat=coord[0]; camera_lon=coord[1];}
	
	if(degree == 0) {
		camera_lat = parseFloat(coord[0]) + LAT_MOVE*dist;
		camera_lon = coord[1];
	}
	
	if (degree == 180) {
		camera_lat = parseFloat(coord[0]) - LAT_MOVE*dist;
		camera_lon = coord[1];
	}

	if (degree == 90) {
		camera_lon = parseFloat(coord[1]) + lon_move*dist;
		camera_lat = coord[0];
	}

	if (degree == 270) {
		camera_lon = parseFloat(coord[1]) - lon_move*dist;
		camera_lat = coord[0];
	}
	
	var d = degree; 

	if(degree > 0 && degree < 90) {
		lon = dist*Math.sin(d * Math.PI / 180);
		lat = dist*Math.sin((180-90-d) * Math.PI / 180);
		camera_lat = parseFloat(coord[0]) + LAT_MOVE*lat;
		camera_lon = parseFloat(coord[1]) + lon_move*lon;
	}

	if(degree > 90 && degree < 180) {
		d -= 90;
		lat = dist*Math.sin(d * Math.PI / 180);
		lon = dist*Math.sin((180-90-d) * Math.PI / 180);
		
		camera_lat = parseFloat(coord[0]) - LAT_MOVE*lat;
		camera_lon = parseFloat(coord[1]) + lon_move*lon;
	}

	if(degree > 180 && degree < 270) {
		d -= 180;
		lon = dist*Math.sin(d * Math.PI / 180);
		lat = dist*Math.sin((180-90-d) * Math.PI / 180);
		camera_lat = parseFloat(coord[0]) - LAT_MOVE*lat;
		camera_lon = parseFloat(coord[1]) - lon_move*lon;
	}

	if(degree > 270 && degree < 360) {
		d -= 270;
		lat = dist*Math.sin(d*Math.PI/180);
		lon = dist*Math.sin((180-90-d)*Math.PI/180);
			
		camera_lat = parseFloat(coord[0]) + LAT_MOVE*lat;
		camera_lon = parseFloat(coord[1]) - lon_move*lon;
	}
}

/** 
*	Create iframe for data transfer
*/
function createIframe() {
	
	var iframe = document.createElement("IFRAME");
	iframe.setAttribute("id", "frame");
	iframe.setAttribute("src", SERVER_URL + "/iframe.html");
	iframe.style = "visibility: hidden;";
	document.body.appendChild(iframe);
}


/** 
*	Function that handles data sending trough iframe (iframe.html)
*	iframe passes data to php server (server.php)
*/
function sendAnnotationData(){ 
	if(camera_add == 0) {
		alert("Add camera before sending!");
	}
	else {
		document.getElementById("sendButton").disabled = true;
		var y = document.getElementById("sendButton");
		y.innerHTML = "Sending...";
		
		var d = new Date();
		var date = "" + d.getFullYear() + (d.getMonth()+1) + d.getDate() + "_" + d.getHours() + "h" + d.getMinutes() + "m" + d.getSeconds() + "s"; // imagePath and file name from date and time
		
		var inf = {
			url: window.location.href, // url from the site where picture has captured
			// TODO: will have to remove in the future, do NOT remove now to keep backward compatible with existing/previously collected JSON data
			data_created: d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()
		};
		
		var camera_information = {
			angle: degree, // camera angle
			cameras: cameras,
			surveillance: "outdoor",
			surveillance_zone: document.getElementById("zone").value
			/*area_business: business*/
		};

		var obj2 = {
			shapes: shapes, // captured picture coordinates and camera types
			info: inf,
			information: camera_information, // information about cameras
			imagePath: date + ".png", // where file is located
			imageData: picture, // base64 IMG data
			imageHeight: IMG,
			imageWidth: IMG
		};

		var obj = {
			apiKey: API_KEY, // user apiKey
			data: obj2
		};

		//console.log(obj); //TEST

		var iframe = document.getElementById("frame");
		iframe.contentWindow.postMessage(JSON.stringify(obj), '*');
		
		waitForResponse();
		
		// Wait for iframe to respond, has data been sent successful to server or not
		function waitForResponse() {
			if(server === 0) {
				setTimeout(function() {waitForResponse();}, 100);
			}
			else {
				waitResponse();
			}
		}
		
	}
}

function waitResponse() {
	if(server === 1) {

		k = 0;
		camera_count = 0;
		shapes = [];
		points = [];
		coord = [];
		camera_add = 0;
		server = 0;

		var ctx = document.getElementById("canva2").getContext("2d");
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(220, 250, 200, 40);
		ctx.font = "20px Georgia";
		ctx.fillStyle = "#000000";
		ctx.fillText("Data has been sent", 240, 280);
		setTimeout(function() {removeNotification("1");}, 1000);
		
		// reset
		document.getElementById("sel_button0").disabled = false;
		document.getElementById("sel_button1").disabled = false;
		document.getElementById("sel_button2").disabled = false;

	}
	else if(server === -1){
		alert("Cannot connect to server!");
		server = 0;
		document.getElementById("sendButton").disabled = false;
		var y = document.getElementById("sendButton");
		y.innerHTML = "Submit";
	}
}


/**
* 	get coordinates and degree from string, if using Google Maps/StreetView
* 	@param {string} url - url
*/
function cutUrl(url) {
	
	// Site is Google Maps
	if(url.indexOf("google.fi/maps") != -1 || url.indexOf("google.com/maps") != -1) {
		let n = url.indexOf("@"); // find char @ from url. In Google StreetView that char is just before coordinates
		str2 = url.substring(n+1, url.length);
		let n2 = str2.indexOf(",");
		let lat = str2.substring(0, n2); // latitude
		let str3 = str2.substring(n2+1, str2.length);
		let n3 = str3.indexOf(",");
		let lon = str3.substring(0, n3); // longitude

		coord[0] = lat;
		coord[1] = lon;
	}
	
	// Site is Mappillary
	else if(url.indexOf("mapillary") != -1) {
		let n = url.indexOf("lat="); // find word 'lat=' from url
		str2 = url.substring(n+4, url.length);
		let n2 = str2.indexOf("&");
		let lat = str2.substring(0, n2); // latitude
		let str3 = str2.substring(n2+5, str2.length);
		let n3 = str3.indexOf("&");
		let lon = str3.substring(0, n3); // longitude
		
		coord[0] = lat;
		coord[1] = lon;
	}
	
	else { //TODO remove hard coded lat and lon variables
		coord[0] = '62.3856564';
		coord[1] = '25.7983872';
	}
}

function getAngle() {
	var d = str2.indexOf("y");
	var str4 = str2.substring((d+2), str2.length);
	var d2 = str4.indexOf("h");
	var deg = str4.substring(0, d2); // camera angle (degree)
	
	degree = parseInt(deg); // string to int
}


function getBusiness() {
	
	cutUrl(window.location.href);
	
	latD = Math.round(parseInt(coord[0])); // For calculating exact camera position with users given photo shootplace to camera distance (it will calculated in function getCameraLocation)
	
	lon_move = 1/((Math.PI*ER*Math.cos(latD))/(180*Math.sqrt(1-ES*(Math.sin(latD))**2)));
	
	var info = {
		lat: coord[0], // latitude
		lon: coord[1] // longitude
	};

	var iframe = document.getElementById("frame");
    iframe.contentWindow.postMessage(JSON.stringify(info), '*');
}

function makeUI() {
	
	// Hide possible scrollbars
	document.body.style.overflow = 'hidden';

	//Label for camera_table
	var label1 = document.createElement("LABEL");
	label1.setAttribute("id", "label_for_table");
	label1.style = "position: absolute; left: 20px; top: 20px; width: " + ((window.innerWidth-700)/3) + "px; font-family: arial; z-index: 1100000300; background-color: #ffffff; margin: 5px 5px 5px 5px; padding: 5px 5px 5px 5px; font-size: 11px;";
	document.body.appendChild(label1); 

	var table = document.createElement("TABLE");
	table.setAttribute("id", "camera_table");
	table.style = "margin-bottom: 10px; font-size: 12px; font-family: arial; border: hidden";
	document.getElementById("label_for_table").appendChild(table);

	var row = document.createElement("TR");
	row.style = "font-weight: bold; font-size: 14px;";
	document.getElementById("camera_table").appendChild(row);

	for(var j=0;j<4;j++) {
		
		var cell = row.insertCell(j);
		cell.style = "padding: 15px;";
		
		if(j==0) {
			cell.innerHTML = "ID";
		}
		else if(j==1) {
			cell.innerHTML = "Type";
		}
		else if(j==2) {
			cell.innerHTML = "Source";
		}
		else {
			cell.innerHTML = "Delete";
		}
	}

	//Label for UI elements
	var label = document.createElement("LABEL");
	label.setAttribute("id", "box");
	label.style = "position: absolute; left: " + (window.innerWidth-((window.innerWidth-700)/2)) + "px; top: 20px; width: " + ((window.innerWidth-700)/2) + "px; font-family: arial; z-index: 1100000300; background-color: #ffffff; margin: 5px 5px 5px 5px; padding: 5px 5px 5px 5px; font-size: 11px;";
	document.body.appendChild(label);

	//Auto-detect button
	var auto = document.createElement("INPUT");
	auto.setAttribute("type", "text");
	auto.setAttribute("value", " ");
	auto.readOnly = true;
	auto.style = "margin-bottom: 10px; font-size: 11px; font-family: arial; border: hidden;";
	document.getElementById("box").appendChild(auto);
	
	var but = document.createElement("BUTTON");
	but.setAttribute("type", "submit");
	but.setAttribute("id", "autoButton");
	but.innerHTML = "Auto-detect";
	but.style = "margin-bottom: 10px; position: absolute; z-index: 10000003; color: white; background-color: #5050ff; font-size: 12px; padding: 10px 10px; border-radius: 4px;";
	but.addEventListener("mouseover", function(){document.getElementById('autoButton').style.backgroundColor = '#0000ff';}); 
	but.addEventListener("mouseout", function(){document.getElementById('autoButton').style.backgroundColor = '#5050ff';});
	but.addEventListener("click", sendAutodetectData);
	document.getElementById("box").appendChild(but);
	
	// Create send button
	var send_button = document.createElement("BUTTON");
	send_button.setAttribute("type", "submit");
	send_button.setAttribute("id", "sendButton");
	send_button.innerHTML = "Send annotation data";
	send_button.style = "margin-bottom: 10px; margin-left: 100px; position: absolute; z-index: 10000003; color: white; background-color: #5050ff; font-size: 12px; padding: 10px 10px; border-radius: 4px;";
	send_button.addEventListener("mouseover", function(){document.getElementById('sendButton').style.backgroundColor = '#0000ff';}); 
	send_button.addEventListener("mouseout", function(){document.getElementById('sendButton').style.backgroundColor = '#5050ff';}); 
	send_button.addEventListener("click", sendAnnotationData);
	document.getElementById("box").appendChild(send_button);	
	
	document.getElementById("box").appendChild(document.createElement("BR"));
	
	//Camera type
	var type = document.createElement("INPUT");
	type.setAttribute("type", "text");
	type.setAttribute("value", "Camera type");
	type.style = "border: hidden; margin-bottom: 10px; margin-top: 28px; font-family: arial; font-size: 11px";
	type.readOnly = true;
	document.getElementById("box").appendChild(type);

	var sel_c = document.createElement("SELECT");
	sel_c.setAttribute("id", "type-dropdown");
	sel_c.setAttribute("name", "type");
	sel_c.style = "margin-bottom: 10px; font-size: 11px; border: hidden; padding: 10px 10px; border-radius: 4px; background-color: #ddddff; width: 60%; font-family: arial;";
	document.getElementById("box").appendChild(sel_c);

	let dropdown1 = document.getElementById('type-dropdown');
	dropdown1.length = 0;
	let defaultOption2 = document.createElement('option');
	defaultOption2.text = 'Choose camera type';
	dropdown1.add(defaultOption2);
	dropdown1.selectedIndex = 0;
	var cameraTypes = ["Directed","Round"];
	
	let option1;	
	for (let i = 0; i < cameraTypes.length; i++) {
		option1 = document.createElement('option');
		option1.text = cameraTypes[i];
		dropdown1.add(option1);	
	}
	
	document.getElementById("box").appendChild(document.createElement("BR"));

	/*
	*	Shooting spot to camera location and cameras shooting direction
	*/
	/*var distance = document.createElement("TEXTAREA");
	distance.value = "Distance to camera (m) / Camera direction (0-359)"; 
	distance.setAttribute("rows", 2);
	distance.setAttribute("cols", 20);
	distance.style = "overflow: hidden; resize: none; border: hidden; margin-bottom: 10px; font-size: 11px; font-family: arial;";
	distance.readOnly = true;
	document.getElementById("box").appendChild(distance);

	var input = document.createElement("INPUT");
	input.setAttribute("type", "text");
	input.setAttribute("id", "distance");
	input.setAttribute("value", "0");
	input.setAttribute("pattern","[0-9]{2}");
	input.setAttribute("size", "3");
	input.style = "margin-bottom: 10px; padding: 10px 10px; font-size: 11px; font-family: arial; border-radius: 4px; background-color: grey; text-align: center;";
	document.getElementById("box").appendChild(input);
	
	var line = document.createElement("INPUT");
	line.setAttribute("type", "text");
	line.setAttribute("value", "  /  ");
	line.setAttribute("size", "1");
	line.style = "font-size: 20px; text-align: center; border: hidden;";
	line.readOnly = true;
	document.getElementById("box").appendChild(line);
	
	var shoot_dir = document.createElement("INPUT");
	shoot_dir.setAttribute("type", "text");
	shoot_dir.setAttribute("id", "shoot_dir");
	shoot_dir.setAttribute("size", "3");
	shoot_dir.setAttribute("pattern","[0-9]{3}");
	shoot_dir.setAttribute("value", "360");
	shoot_dir.style = "margin-bottom: 10px; padding: 10px 10px; font-size: 11px; font-family: arial; border-radius: 4px; background-color: grey; text-align: center;";
	document.getElementById("box").appendChild(shoot_dir);		
	
	document.getElementById("box").appendChild(document.createElement("BR"));*/

	// Camera owner select box
	var owner = document.createElement("INPUT");
	owner.setAttribute("type", "text");
	owner.setAttribute("value", "Camera owner");
	owner.readOnly = true;
	owner.style = "margin-bottom: 10px; font-size: 11px; font-family: arial; border: hidden;";
	document.getElementById("box").appendChild(owner);

	var sel = document.createElement("SELECT");
	sel.setAttribute("id", "business-dropdown");
	sel.setAttribute("name", "business");
	sel.style = "margin-bottom: 10px; font-size: 11px; border: hidden; padding: 10px 10px; border-radius: 4px; background-color: grey; width: 60%; font-family: arial;";
	document.getElementById("box").appendChild(sel);
	
	document.getElementById("box").appendChild(document.createElement("BR"));

	// Camera model
	var model = document.createElement("INPUT");
	model.setAttribute("type", "text");
	model.setAttribute("value", "Camera model");
	model.readOnly = true;
	model.style = "margin-bottom: 10px; font-size: 11px; font-family: arial; border: hidden;";
	document.getElementById("box").appendChild(model);
	
	// This part creates one extra <div> into html and make UI looks unsopfisticated
	var select_model = document.createElement("SELECT");
	select_model.setAttribute("id", "model");
	select_model.setAttribute("name", "model");
	select_model.style = "margin-bottom: 10px; font-size: 11px; border: hidden; padding: 10px 10px; border-radius: 4px; background-color: grey; width: 60%; font-family: arial;";
	document.getElementById("box").appendChild(select_model);	
	let dropdown2 = document.getElementById('model');
	dropdown2.length = 0;
	let defaultOption1 = document.createElement('option');
	defaultOption1.text = 'Choose model';
	dropdown2.add(defaultOption1);
	dropdown2.selectedIndex = 0;
	
	var mydata = JSON.parse(cameras_file);
	var models = Object.values(mydata);
	
	let option2;	
	for (let i = 0; i < models.length; i++) {
		option2 = document.createElement('option');
		option2.text = models[i]['model'];
		dropdown2.add(option2);	
	}
	
	document.getElementById("box").appendChild(document.createElement("BR"));

	// Camera zone for OSM-data
	var zone = document.createElement("INPUT");
	zone.setAttribute("type", "text");
	zone.setAttribute("value", "Camera zone");
	zone.readOnly = true;
	zone.style = "margin-bottom: 10px; font-size: 11px; font-family: arial; border: hidden;";
	document.getElementById("box").appendChild(zone);
	
	var select_zone = document.createElement("SELECT");
	select_zone.setAttribute("id", "zone");
	select_zone.setAttribute("name", "zone");
	select_zone.style = "margin-bottom: 10px; font-size: 11px; border: hidden; padding: 10px 10px; border-radius: 4px; background-color: grey; width: 60%; font-family: arial;";
	document.getElementById("box").appendChild(select_zone);	
	let dropdown = document.getElementById('zone');
	dropdown.length = 0;
	let defaultOption = document.createElement('option');
	defaultOption.text = 'Choose zone';
	dropdown.add(defaultOption);
	dropdown.selectedIndex = 0;
	var zones = ["town","parking","traffic","shop","bank","building"];
	
	let option;	
	for (let i = 0; i < zones.length; i++) {
		option = document.createElement('option');
		option.text = zones[i];
		dropdown.add(option);	
	}
	
	document.getElementById("box").appendChild(document.createElement("BR"));
	makeSelectSearchable();

}

function drawConf() {
	
	var confbutton = document.createElement("BUTTON");
	confbutton.setAttribute("type", "submit");
	confbutton.setAttribute("id", "buttonC");
	confbutton.innerHTML = "Confirm annotation";
	confbutton.style = "background-color: #ddddff; padding: 6px 6px";
	document.getElementById("box").appendChild(confbutton);
	
	// Listeners for events
	function init() {
		confbutton.addEventListener("click", function(){
			if(document.getElementById("type-dropdown").value != "Choose camera type"){
				addCamera();
			}
			else{alert("Select camera type!");}
		
		});
		
		confbutton.addEventListener("mouseover", function(){var confbutton1 = document.getElementById("buttonC"); confbutton1.style.backgroundColor = "#0000ff";}); 
		confbutton.addEventListener("mouseout", function(){var confbutton1 = document.getElementById("buttonC"); confbutton1.style.backgroundColor = "#ddddff";}); 
	}
	
	init();
}

function showBusiness() {
	
	let dropdown = document.getElementById('business-dropdown');
	dropdown.length = 0;

	let defaultOption = document.createElement('option');
	defaultOption.text = 'Choose business';

	dropdown.add(defaultOption);
	dropdown.selectedIndex = 0;
	
	let option;
	
	for (let i = 0; i < Object.keys(business).length; i++) {
		
		option = document.createElement('option');
		
		if(business[i].name == null) {
			option.text = "No matches";
			dropdown.add(option);
		}
		
		else {
			option.text = business[i].name;
			dropdown.add(option);
		}
	}
}
