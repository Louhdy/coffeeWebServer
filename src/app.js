'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let network = require('./fabric/network.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

app.post('/getObjectById', async (req, res) => {  
  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.getObjectById(networkObj, 'getObjectById', req.body.uuid);
  let parsedResponse = await JSON.parse(response);  
  res.send(parsedResponse);
});

app.post('/updateObjectById', async (req, res) => {
  let networkObj = await network.connectToNetwork(appAdmin);  
  let invokeResponse = await network.updateObjectById(networkObj, 'updateObjectById', req.body);
  if (invokeResponse.error) {
    res.send(invokeResponse.error);
  } else {   
    res.send(invokeResponse);
  }
})

app.get('/getAllReceptions', async (req, res) => {
  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.getAllReceptions(networkObj, 'getAllReceptions');
  let parsedResponse = await JSON.parse(response);  
  res.send(parsedResponse);
});

app.post('/registerReception', async(req, res) =>{            
    let uuid = uuidv4().toString();    
    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.getAllReceptions(networkObj, 'getAllReceptions');
    let parsedResponse = await JSON.parse(response);
    if ( parsedResponse.length === 0 ) {
      req.body.id = 1;
    }
    else {
      req.body.id = parsedResponse.at(-1).Record.newReception.id + 1;                  
    }    
    if (networkObj.error) {
      res.send(networkObj.error);
    }                 
    networkObj = await network.connectToNetwork(appAdmin);
    req.body.physicalId = uuidv4().toString();
    req.body.sensorialId = uuidv4().toString();
    req.body.toastId = uuidv4().toString();
    req.body.packingId = uuidv4().toString();
    req.body.distributionId = uuidv4().toString();
    let invokeResponse = await network.registerNewReception(networkObj, 'createNewReception', uuid, req.body);    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {   
      res.send(invokeResponse);
    }
});


app.listen(process.env.PORT || 8081);