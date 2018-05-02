// add function to test that everything is working and upload it to the js sub directory
// create a function to get the first bit of text data from the from
function startDataUpload(){
	alert("start data upload");
	
	var name = document.getElementById("name").value;
	var surname = document.getElementById("surname").value;
	var module = document.getElementById("module").value;
	var postString = "name="+name +"&surname=" +surname +"&module=" +module;
	alert(name+" "+surname+" "+module);
	
	var checkString = "";
	for (var i = 1;i<5;i++){
		if (document.getElementById("check"+i).checked === true){
			checkString = checkString + document.getElementById("check"+i).value + "||"
		}
	}
	// now get the select box values
	var language = document.getElementById("languageselectbox").value;
	postString = postString+"&language="+language;
	
	postString = postString + "&modulelist="+checkString;
	
	// now get the radio button values
	if (document.getElementById("morning").checked){
		postString = postString+"&lecturetime=morning";
	}
	if (document.getElementById("afternoon").checked){
		postString = postString+"&lecturetime=afernoon";
	}
	var latitude = document.getElementById("latitude").value;
	var longitude = document.getElementById("longitude").value;
	postString = postString + "&latitude=" + latitude + "&longitude=" + longitude;
	
	processData(postString)
}

// add AJAX call and response method to code
var client;

function processData(postString){
	client = new XMLHttpRequest();
	client.open('POST', 'http://developer.cege.ucl.ac.uk:30282/uploadData' ,true);
	client.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	client.onreadystatechange = dataUploaded;
	client.send(postString);
}

// create the code to wait for the response from the data server, and process the response once it is received 
function dataUploaded(){
	// this function listens out for the server to say tha the data is ready 
	if (client.readyState == 4){
		// change the DIV to show the response
		alert ("upload is ready")
		document.getElementById("dataUploadResult").innerHTML = client.responseText;
	}
}