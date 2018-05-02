// express is the server that forms part of the nodejs program
var express = require('express');
var path = require("path");
var app = express();
var fs = require('fs');

// convert the configuration file into the correct format -i.e. name/value pair array
var configtext = "" + fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
var configarray = configtext.split(",");
var config = {};

// for (statement1, statement2, statement3)
// statement1: executed before the loop starts
// statement2: defined the condition for running the loop
// statement3: executed each time after the loop has been executed
for (var i = 0; i < configarray.length; i++){
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}

// adding functionality to allow cross-domain queries when PhoneGap is running a server
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});

	
// adding functionality to log the requests
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});
	

// add an http server to serve files to the Edge browser 
// due to certificate issues it rejects the https files if they are not
// directly called in a typed URL
var http = require('http');
var httpServer = http.createServer(app); 
httpServer.listen(4480);

app.get('/',function (req,res) {
	res.send("hello world from the HTTP server");
});

// import the required connectivity code and set up a database connection
var pg = require('pg');
var pool = new pg.Pool(config);


// to be able to process the uploaded data
// body-parser extracts the entire body portion of an incoming request stream and exposes it on req.body
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended:true
	}));
app.use(bodyParser.json());


app.post('/uploadData',function(req,res){
  // note that we are using POST here as we are uploading data 
  // so the parameters form part of the BODY of the request rather than the RESTful API
  console.dir(req.body);
  
  pool.connect(function(err,client,done){
	  if(err){
		  cosole.log("not able to get connection "+ err);
		  res.status(400).send(err);
	  }
	  var geometrystring = "st_geomfromtext('POINT(" + req.body.longitude + " " + req.body.latitude + ")',4326";
	  
	  var querystring = "INSERT into formdata (name,surname,module,language, modulelist, lecturetime, geom) values ('";
	querystring = querystring + req.body.name + "','" + req.body.surname + "','" + req.body.module + "','";
	querystring = querystring + req.body.language + "','" + req.body.modulelist + "','" + req.body.lecturetime+"',"+geometrystring + "))";
	console.log(querystring);
	
	client.query( querystring,function(err,result){
		done();
		if(err){ 
			console.log(err);
			res.satus(400).send(err);
		}
		res.status(200).send("upload is done");
	});
  }); 
});
  
  


