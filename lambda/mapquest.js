'use strict';

const fetch = require('node-fetch');
const querystring = require('querystring');

const BASE_URL = 'http://open.mapquestapi.com/geocoding/v1/';

var exports = module.exports = {};

exports.address = async(location) => {
    const qs = {
        key: process.env.MAPQUEST_KEY || 'demo',
        location: location,
    };
    const response = await fetch(BASE_URL + 'address?' + querystring.stringify(qs));
    return response.json();
};
