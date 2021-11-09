'use strict';

const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

let connection_file = config.connection_file;

// let userName = config.userName;
let gatewayDiscovery = config.gatewayDiscovery;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const util = require('util');

exports.connectToNetwork = async function (userName) {    
  try {
    
    const walletPath = path.join(process.cwd(), 'Org1Wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);    
    
    const gateway = new Gateway();    
    await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });    

    // Connect to our local fabric
    const network = await gateway.getNetwork('mychannel');    

    // Get the contract we have installed on the peer
    const contract = await network.getContract('coffeeContracts');    

    let networkObj = {
      contract: contract,
      network: network,
      gateway: gateway
    };

    return networkObj;

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
    let response = {};
    response.error = error;
    return response;
  } finally {
    console.log('Done connecting to network.');
    // gateway.disconnect();
  }
};

exports.registerNewReception = async function (networkObj, func, id, args) {
  try {                
    args = JSON.stringify(args);
    console.log(id);
    console.log(args);
    let response = await networkObj.contract.submitTransaction(func, id, args);            
    console.log(`Transaction ${func} with args has been evaluated`);
    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return error;
  }
};

exports.getAllReceptions = async function (networkObj, func) {
  try {
    let response = await networkObj.contract.evaluateTransaction(func);    
    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return error;
  }
};

exports.getObjectById = async function (networkObj, func, uuid) {
  try {
    let response = await networkObj.contract.evaluateTransaction(func, uuid);    
    await networkObj.gateway.disconnect();
    return response;
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return error;
  }
};

exports.updateObjectById = async function (networkObj, func, args) {
  try {                    
    let uuid = args.object.uuid;  
    args = JSON.stringify(args.object.object);            
    console.log(JSON.parse(args));
    let response = await networkObj.contract.submitTransaction(func, uuid, args);            
    console.log(`Transaction ${func} with args has been evaluated`);
    await networkObj.gateway.disconnect();    
    return response;
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return error;
  }
};