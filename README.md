# A Private Blockchain Notary Service

This project is a Star Registry service that allows users to claim ownership of their favorite star in the night sky. The project has been built based on RESTFUL web service.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [(Node.js® web site)](https://nodejs.org/en/).

### Configuring The Project

- Use NPM to initialize the project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install hapi with --save flag
```
npm install hapi --save
```
- Install bitcoinjs-message --save flag
```
npm i bitcoinjs-message --save
```
## Complete Blockchain ID validation

There are the 3 steps needed for the Blockchain ID Validation Routine to function properly.

### Step 1: Post Request By User's Address

Using command below to start web service.

	cd project path

  	npm start

The Web API will allow users to submit their request using their wallet address.

**URL**

This functionality should be made available at the following URL.

	http://localhost:8000/requestValidation

**Example: requestValidation endpoint**

Here is an example post request using curl.

	curl -X "POST" "http://localhost:8000/requestValidation" \
	     -H "Content-Type: application/json; charset=utf-8" \
	     -d $'{
	  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
	}'

### Step 2: Deliver User Response

After submitting a request, the user will receive a response in JSON format with a message to sign.

- Message details
- Request timestamp
- Time remaining for validation Window

With this response, a request will be made to the user to provide a signature using their wallet.

**Example: JSON response**

The web API will provide a JSON response to users. Here is an example of this response.

	{
	  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	  "requestTimeStamp": "1532296090",
	  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
	  "validationWindow": 300
	}

### Step 3: Allow User Message Signature

After receiving the response, users will prove their blockchain identity by signing a message with their wallet. Once they sign this message, the application will validate their request and grant access to register a star.

**URL**

This functionality should be provided at the following URL.

	http://localhost:8000/message-signature/validate

**Payload**

The payload delivered by the user requires the following fields.

- Wallet address
- Message signature

**Example**

- message-signature/validate endpoint

**Post validation with curl**

	curl -X "POST" "http://localhost:8000/message-signature/validate" \
	     -H 'Content-Type: application/json; charset=utf-8' \
	     -d $'{
	  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
	}'

**JSON Response Example**

	{
	  "registerStar": true,
	  "status": {
	    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	    "requestTimeStamp": "1532296090",
	    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
	    "validationWindow": 193,
	    "messageSignature": "valid"
	  }
	}

## Star Registration Endpoint

Upon validation of the identity, the user should be granted access to register a single star.

**URL**

This functionality should be provided at the following URL.

	http://localhost:8000/block

**Payload**

Wallet address (blockchain identity), star object with the following properties.

- Requires address [Wallet address]
- Requires star object with properties
- right_ascension
- declination
- magnitude [optional]
- constellation [optional]
- star_story [Hex encoded Ascii string limited to 250 words/500 bytes]

**Example: Block with star object endpoint**

Post block with curl

	curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  		"address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  		"star": {
		    "dec": "-26° 29'\'' 24.9",
		    "ra": "16h 29m 1.0s",
		    "story": "Found star using https://www.google.com/sky/"
  			}
		}'

**JSON Response Example**

	{
	  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
	  "height": 1,
	  "body": {
	    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	    "star": {
	      "ra": "16h 29m 1.0s",
	      "dec": "-26° 29' 24.9",
	      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
	    }
	  },
	  "time": "1532296234",
	  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
	}

## Star Lookup

This functionality will provide the option to search by blockchain wallet address, by star block hash, and by star block height. We’ve broken this down into 3 situations and provide the details below.

- 1: Blockchain Wallet Address
- 2: Star Block Hash
- 3: Star Block Height

### Blockchain Wallet Address

**Details**

- Get endpoint with URL parameter for wallet address
- JSON Response
- Star block objects

**URL**

	http://localhost:8000/stars/address:[ADDRESS]

**Example**

**Get request with curl**

	curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"

**JSON response**

	[
	  {
	    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
	    "height": 1,
	    "body": {
	      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	      "star": {
	        "ra": "16h 29m 1.0s",
	        "dec": "-26° 29' 24.9",
	        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
	        "storyDecoded": "Found star using https://www.google.com/sky/"
	      }
	    },
	    "time": "1532296234",
	    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
	  },
	  {
	    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
	    "height": 2,
	    "body": {
	      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	      "star": {
	        "ra": "17h 22m 13.1s",
	        "dec": "-27° 14' 8.2",
	        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
	        "storyDecoded": "Found star using https://www.google.com/sky/"
	      }
	    },
	    "time": "1532330848",
	    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
	  }
	]

### Star Block Hash

Get endpoint with URL parameter for star block hash JSON Response

- Star block object

**URL**

	http://localhost:8000/stars/hash:[HASH]

**Example**

**Get request with curl**

	curl "http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"

**JSON response**

	{
	  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
	  "height": 1,
	  "body": {
	    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	    "star": {
	      "ra": "16h 29m 1.0s",
	      "dec": "-26° 29' 24.9",
	      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
	      "storyDecoded": "Found star using https://www.google.com/sky/"
	    }
	  },
	  "time": "1532296234",
	  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
	}

### Star Block Height

**Details**

- Get endpoint with URL parameter for star block height
- JSON Response
- Star block object

**URL**

	http://localhost:8000/block/[HEIGHT]

**Example**

**Get request with curl**

	curl "http://localhost:8000/block/1"

**JSON response**

	{
	  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
	  "height": 1,
	  "body": {
	    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
	    "star": {
	      "ra": "16h 29m 1.0s",
	      "dec": "-26° 29' 24.9",
	      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
	      "storyDecoded": "Found star using https://www.google.com/sky/"
	    }
	  },
	  "time": "1532296234",
	  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
	}

## Dependency

- [Hapi](https://hapijs.com) - A restful framework for building applications and services

- [level](https://github.com/Level/level) - Persist data with LevelDB

- [crypto-js](https://github.com/brix/crypto-js) - SHA256 with Crypto-js

- [bitcoinjs-message](https://github.com/bitcoinjs/bitcoinjs-message) - A node.js library to sign and verify Bitcoin message.

## Reference

https://cn.udacity.com/
