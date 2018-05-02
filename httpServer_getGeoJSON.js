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

app.get('/getGeoJSON/:tablename/:geomcolumn',function(req,res){
	pool.connect(function(err,client,done){
		if (err){
			console.log("not be able to get connection "+ err);
			res.status(400).send(err);
		}
		var colnames = "";
		// first get a list of the columns that are in the table
		// use string_agg to generate a comma separated list that can then be pasted into the next query
		var querystring = "select string_agg(colname,',') from ( select column_name as colname ";
		querystring = querystring + " FROM information_schema.columns as colname ";
		querystring = querystring + " where table_name = '"+req.params.tablename +"'";
		querystring = querystring + "and column_name<>'"+req.params.geomcolumn+"') as cols ";
		console.log(querystring);
		
		client.query(querystring,function(err,result){
			//call done() to release the client back to the pool
			console.log("trying");
			done();
			if (err){
				console.log(err);
				res.status(400).send(err);
			}
			for (var i = 0; i < result.rows.length; i++){
				console.log(result.rows[i].string_agg);
			}
			
			thecolnames = result.rows[0].string_agg;
			colnames = thecolnames;
			console.log("the colnames " + thecolnames);
			
			// now use the inbuilt geoJSON functionality
			// and create the required geoJSON format using a query adapted from here:
			var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
			querystring = querystring + "(SELECT 'Feature' As type ,ST_AsGeoJSON(lg." + req.params.geomcolumn+")::json As geometry, "; 
			querystring = querystring + "row_to_json((SELECT l FROM (SELECT "+colnames + ") As l )) As properties";
			querystring = querystring + " FROM "+req.params.tablename+" As lg limit 10000 ) As f ";
			console.log(querystring);
			
			// run the second query
			client.query(querystring,function(err,result){
				// call done() to release the client back to the pool
				done();
				if (err){
					console.log(err);
					res.status(400).send(err);
				}
				res.status(200).send(result.rows);
			});
		});
	});
});
