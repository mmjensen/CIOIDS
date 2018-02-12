const express = require('express')
const bodyParser = require('body-parser')
const errorhandler = require('errorhandler')
const mongodb= require('mongodb')
const logger = require('morgan')
const path    = require("path");
const sha1 = require('./sha1')

const url = 'mongodb://localhost:27017'

const app = express();

const salt = "CIO&vinegar" //placeholder

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'cio.cs.au.dk');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    console.log(req.headers)

    next();
}

console.log("Server running")

app.use(bodyParser.json())
app.use(logger('dev'))
app.use(allowCrossDomain)

mongodb.MongoClient.connect(url, (error, client) => {
	if (error){
		console.log("CONNECTION ERROR")
		return process.exit(1)	
	} 

	var collection = client.db('cioid').collection("cioids")

	app.use(["/post","/:cioid"], (req, res, next) => {
		//check if ID exists

		if(req.body.namestring && req.body.datestring){
			//console.log("body here: " + req.body)
			req.cioid = generateCIOID(req.body.namestring, req.body.datestring)
		} else if(req.params.cioid) {
			//console.log("params here: " + req.params.cioid)
			req.cioid =  req.params.cioid
		}

		console.log(req.cioid)

		if(req.cioid){
			console.log(req.cioid)
			let query = {"cioid":req.cioid, "new":"true"}
			collection.find(query).limit(1).toArray(function(err, result) {
		    	if (err) throw err;
		    	//console.log(result);
		    	req.idExists = result 
		    	next()
	  		});
		} else {
			next()
		}
		
	})

	app.get('/:cioid', (req, res) => {
		//console.log(collection.find({"cioid":cioid,"new":"true"}).limit(1))
		res.send(req.idExists)
	})

	app.post('/post', (req,res) => {
		let newIDrequest = req.body
		if(newIDrequest.namestring && newIDrequest.datestring){
			let timestamp = Date.now()
			//console.log("incoming: " + newIDrequest.namestring)
			console.log("returning: " + req.cioid)
			//console.log(req.idExists)

			if(typeof req.idExists !== 'undefined' && req.idExists.length > 0){
				idObject = {"cioid":req.cioid,"timestamp":timestamp,"new":"false"}
			} else {
				idObject = {"cioid":req.cioid,"timestamp":timestamp,"new":"true"}
			}

			if(newIDrequest.studyID){
				idObject["studyID"] = newIDrequest.studyID.replace(/\s/g, "").toLowerCase()	
			}

			collection.insert(idObject, (error, results) => {
				if (error) res.sendStatus(405)
				res.json(idObject)
			})

		} else {
			res.sendStatus(400)
		}
	})

	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname,'index.html'));
	})

  	app.listen(3001)
})



function generateCIOID(name, date){
	return sha1(sha1(name.replace(/\s/g, "").toLowerCase() + date.replace(/\s/g, "").toLowerCase()) + (salt + date.replace(/\s/g, "").toLowerCase()))
}

