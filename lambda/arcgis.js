'use strict';

const fetch = require('node-fetch');
const querystring = require('querystring');

const BASE_URL = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/';

var exports = module.exports = {};

exports.query = async(lat, lon) => {
    const qs = {
        where: '1=1',
        outFields: 'GEN,cases7_per_100k',
        geometry: lon + ',' + lat,
        geometryType: 'esriGeometryPoint',
        inSR: 4326,
        spatialRel: 'esriSpatialRelWithin',
        returnGeometry: false,
        outSR: 4326,
        f: 'json',
    };
    // const qs = 'where=1%3D1&outFields=GEN,cases7_per_100k&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json';
    const response = await fetch(BASE_URL + 'query?' + querystring.stringify(qs));
    return response.json();
};
