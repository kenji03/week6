// express is the server that forms part of the nodejs program
// call the express by require 
var express = require('express');
var app = express();

// allows users to permit the CORS
app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	next();
});

// set the preliminary for https
var http = require('http');
var fs = require('fs');
// build the server 
var httpServer = http.createServer(app);

console.log("Calling httpsServer");

// start the server 
httpServer.listen(4480, "192.168.128.82",function(){
	console.log("Calling httpServer's callback function");
	var host = httpServer.address().address;
	var port = httpServer.address().port;
	console.log('running at https://'+host+':'+port);
});

console.log("httpsServer executed.");
console.log("your current direct path:"+__dirname);

// convert the configuration file into the correct format -i.e. name/value pair
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
	
	
var pg = require('pg');
var pool = new pg.Pool(config);

app.get('/getPOI',function(req,res){
	console.log("connecting server and query required data");
	pool.connect(function(err,client,done){
		if (err){
			console.log("not be able to get connection "+ err);
			res.status(400).send(err);
		}
		// use the inbuilt geoJSON functionality
		// add create the required geoJSON format using a query adapted from here: http://www.posgresonline.com/journal.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html,
		// accessed 4th January 2018
		// note that query needs to be a single string with no line breaks so built it up bit by bit
		var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
		querystring = querystring + "(SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry,";
		querystring = querystring + " row_to_json((SELECT l FROM (SELECT id, name, category) As l )) As properties";
		querystring = querystring + " FROM united_kingdom_poi As lg limit 100) As f";
		console.log(querystring);
		client.query(querystring,function(err,result){
			//call done() to release the client back to the pool
			done();
			if (err){
				console.log(err);
				res.status(400).send(err);
			}
			console.log(result)
			res.status(200).send(result.rows);
		});
	});
});
