'use strict';

const Alexa = require('ask-sdk-core');
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
    exitOnError: false,
});

const arcgis = require('./arcgis');
const mapquest = require('./mapquest');

const SKILL_ID = 'amzn1.ask.skill.83374883-510f-46c4-9e04-65197fcc1adf';

async function getIncidenceValueResponse(location, locationNotFoundMsg, handlerInput) {
    let response;
    await mapquest.address(location)
        .then(async(address) => {
            if (address.info.statuscode !== 0) {
                logger.error('error reverse geocoding "' + location + '": ', address.info);
                response = handlerInput.responseBuilder
                    .speak(locationNotFoundMsg)
                    .getResponse();
            } else {
                // TODO no results
                logger.debug('found locations', address.results[0].locations);
                if (address.results[0].locations[0].adminArea1 !== 'DE') {
                    logger.error('unsupported country ' + address.results[0].locations[0].adminArea1 + ' for ' + location);
                    response = handlerInput.responseBuilder
                        .speak('Ich kann den Wert nur für Deutschland bestimmen.')
                        .getResponse();
                } else {
                    const latLng = address.results[0].locations[0].latLng;

                    const query = await arcgis.query(latLng.lat, latLng.lng);
                    // TODO catch err
                    logger.debug('query result', query.features[0].attributes);

                    const speechOutput = 'Der 7-Tage-Inzidenzwert in ' + query.features[0].attributes.BEZ + ' ' + query.features[0].attributes.GEN
                        + ' beträgt '
                        + new Intl.NumberFormat('de-DE').format(query.features[0].attributes.cases7_per_100k)
                        + '.';
                    response = handlerInput.responseBuilder
                        .speak(speechOutput)
                        // .reprompt('add a reprompt if you want to keep the session open for the user to respond')
                        .getResponse();
                }
            }
        })
        .catch((err) => {
            logger.error(err.stack || err.toString());
            response = handlerInput.responseBuilder
                .speak('Es gibt leider gerade ein Problem mit dem Lokalisieren von Adressen, bitte versuche es später erneut.')
                .getResponse();
        });
    return response;
}

const QueryValueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
            || (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QueryValueIntent');
    },
    async handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const deviceAddressServiceClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
        const deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope);
        let address;
        try {
            address = await deviceAddressServiceClient.getFullAddress(deviceId);
            logger.debug('address', address);
        } catch (err) {
            if (err.statusCode === 403) {
                logger.debug('context', handlerInput.requestEnvelope.context);
                return handlerInput.responseBuilder
                    .speak('Bitte die Berechtigung für die Abfrage der Geräte-Adresse in den Skill-Einstellungen der Amazon Alexa App aktivieren.')
                    .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
                    .getResponse();
            }
            logger.error('getFullAddress error', err);
            logger.error(err.stack || err.toString());
        }
        if (!address) {
            return handlerInput.responseBuilder
                .speak('Bitte die Berechtigung für die Abfrage der Geräte-Adresse in den Skill-Einstellungen der Amazon Alexa App aktivieren.')
                .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
                .getResponse();
        }

        if (address.countryCode !== 'DE') {
            logger.error('unsupported country ' + address.countryCode);
            return handlerInput.responseBuilder
                .speak('Ich kann den Wert nur für Adressen in Deutschland bestimmen.')
                .getResponse();
        }

        let location = address.addressLine1 || '';
        if (address.addressLine2) {
            location += ' ' + address.addressLine2;
        }
        if (address.addressLine3) {
            location += ' ' + address.addressLine3;
        }
        if (location) {
            location += ',';
        }
        location += address.postalCode + ' ' + address.city;
        logger.debug('reverse geocoding location ' + location);
        return getIncidenceValueResponse(location, 'Ich kann die Adresse leider nicht finden.', handlerInput);
    },
};

const QueryCityIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QueryCityIntent';
    },
    async handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const city = Alexa.getSlotValue(handlerInput.requestEnvelope, 'city');

        logger.debug('reverse geocoding city ' + city);
        return getIncidenceValueResponse(city, 'Ich kann diese Stadt leider nicht finden.', handlerInput);
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        return handlerInput.responseBuilder
            .speak('Du kannst sagen „Öffne Inzidenzwert“ und ich nenne dir die aktuelle 7-Tage-Inzidenz für deine Adresse.')
            // .reprompt('Du kannst sagen „Öffne Inzidenzwert“ und ich nenne dir die aktuelle 7-Tage-Inzidenz für deine Adresse. Bitte gib dafür die gewünschte Adresse in deinem Alexa-Gerät an und aktiviere die Berechtigung für die Abfrage der Geräte-Adresse in den Skill-Einstellungen der Amazon Alexa App.')
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const speechOutput = '<say-as interpret-as="interjection">bis dann</say-as>.';
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    },
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const speechOutput = 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?';
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        try {
            if (request.reason === 'ERROR') {
                logger.error(request.error.type + ': ' + request.error.message);
            }
        } catch (err) {
            logger.error(err.stack || err.toString(), request);
        }

        logger.debug('session ended', request);
        return handlerInput.responseBuilder.getResponse();
    },
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        logger.error(error.stack || error.toString(), handlerInput.requestEnvelope.request);
        const speechOutput = 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?';
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

/*
const LocalizationInterceptor = {
    process(handlerInput) {
        i18next.use(sprintf).init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = (...args) => {
            return i18next.t(...args);
        };
    },
};
*/

let userAgent;
try {
    const pckg = require('./package');
    userAgent = pckg.name + '/' + pckg.version;
} catch (err) {
    userAgent = err;
}
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        QueryValueIntentHandler,
        QueryCityIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler)
    // .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .withCustomUserAgent(userAgent)
    .withSkillId(SKILL_ID)
    .lambda();
