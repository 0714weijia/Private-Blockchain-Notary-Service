'use strict';

const Blockchain=require('./simpleChain');
const Hapi=require('hapi');
const Joi = require('joi');

const bitcoinMessage = require('bitcoinjs-message');

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Set cache
const cacheAddress = server.cache({
    expiresIn: 5 * 60 * 1000,
    getDecoratedValue: true,
    segment: 'customSegment',
    generateFunc: (address) => {
        const requestTimeStamp = Date.now();
        let value = {
            "registerStar": false,
            "status": {
                "address": `${address}`,
                "requestTimeStamp": requestTimeStamp,
                "message": `${address}:${requestTimeStamp}:starRegistry`,
                "validationWindow": 300000}
            }
        return value;
    },
    generateTimeout: 2000
});

// Add the route
server.route([
    {
        method: 'POST',
        path: '/requestValidation',
        config: {
            handler: async function (request, h) {
                let address = request.payload.address;
                const { value, cached } = await cacheAddress.get(address);
                if (cached) {
                    value.status.validationWindow = cached.ttl;
                }
                return JSON.stringify(value.status).toString();
            },
            validate: {
                payload: {
                    address: Joi.string().min(1).required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/message-signature/validate',
        config: {
            handler: async function (request, h) {
                let address = request.payload.address;
                let signature = request.payload.signature;
                const { value, cached } = await cacheAddress.get(address);
                if (!cached) {
                    await cacheAddress.set(address, null);
                    return "Please submit validation request using your wallet address, "
                    + "The request is only valid in just five minutes.";
                }

                let isValid = bitcoinMessage.verify(value.status.message, address, signature);
                if (isValid) {
                    value.registerStar = true;
                    value.status.messageSignature = "valid";
                } else {
                    value.registerStar = false;
                    value.status.messageSignature = "invalid";
                }
                value.status.validationWindow = cached.ttl;
                // Update address cache
                await cacheAddress.set(address, value);
                return JSON.stringify(value).toString();
            },
            validate: {
                payload: {
                    address: Joi.string().min(1).required(),
                    signature: Joi.string().min(1).required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/block',
        config: {
            handler: async function (request, h) {
                let body = request.payload;
                if (!body || !body.address || body.address.lenght === 0) {
                    return "Don't allow to register star without address.";
                }

                if (!body.star || !body.star.dec || !body.star.ra) {
                    return "Star information about dec and ra are required.";
                }

                const { value, cached } = await cacheAddress.get(body.address);
                if (!cached) {
                    // Clear cache
                    await cacheAddress.set(body.address, null);
                    return "Please submit validation request using your wallet address, "
                    + "The request is only valid in just five minutes.";
                }

                if (!value.registerStar) {
                    return "Please complete blockchain ID validation before register your star.";
                }

                if (body.star.story.length > 500) {
                    return "Star story string should be limited to 250 words/500 bytes."
                }
                body.star.storyDecoded = body.star.story;
                body.star.story = new Buffer(body.star.story).toString('hex');
                addBlock(body);

                await cacheAddress.set(body.address, null);
                return JSON.stringify(request.payload).toString();
            }
        }
    },
    {
        method:'GET',
        path:'/block/{blockHeight}',
        handler:function(request,h) {
            let blockHeight = encodeURIComponent(request.params.blockHeight);
            return getBlock(blockHeight);
        },
        options: {
            validate: {
                params: {
                    blockHeight: Joi.number().integer().min(0)
                }
            }
        }
    },
    {
        method:'GET',
        path:'/stars/hash:{hash}',
        handler:function(request,h) {
            let hash = encodeURIComponent(request.params.hash);
            return getBlockByHash(hash);
        },
        options: {
            validate: {
                params: {
                    hash: Joi.string().min(1).required()
                }
            }
        }
    },
    {
        method:'GET',
        path:'/stars/address:{address}',
        handler:function(request,h) {
            let address = encodeURIComponent(request.params.address);
            return getBlockByAddress(address);
        },
        options: {
            validate: {
                params: {
                    address: Joi.string().min(1).required()
                }
            }
        }
    }
]);

async function addBlock(body, callback) {
    let blockchain = new Blockchain();
    blockchain.addBlockWithBody(body, function(err, newBlock) {
        if (callback) callback(err, newBlock);
    });
}

async function getBlock(blockHeight) {
    let blockchain = new Blockchain();
    try {
        let block = await blockchain.getBlock(blockHeight);
        return decodeURIComponent(block);
    }
    catch (err) {
        let height = await blockchain.getBlockHeight();
        return "Fail to get block with height " + blockHeight 
        + ". Blockchain height is now " + height;
    }
}

async function getBlockByHash(hash) {
    let blockchain = new Blockchain();
    try {
        let blocks = await blockchain.getBlockByHash(hash);
        return decodeURIComponent(blocks);
    }
    catch (err) {
        let height = await blockchain.getBlockHeight();
        return "Fail to get block with hash " + hash 
        + ". Blockchain height is now " + height;
    }
}

async function getBlockByAddress(address) {
    let blockchain = new Blockchain();
    try {
        let blocks = await blockchain.getBlockByAddress(address);
        return decodeURIComponent(blocks);
    }
    catch (err) {
        let height = await blockchain.getBlockHeight();
        return "Fail to get block with address " + address 
        + ". Blockchain height is now " + height;
    }
}

// Start the server
const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
