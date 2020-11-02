'use strict';

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');

// initialize the testing framework
alexaTest.initialize(
    require('../../lambda/index'),
    'amzn1.ask.skill.83374883-510f-46c4-9e04-65197fcc1adf',
    'amzn1.ask.account.VOID');
alexaTest.setLocale('de-DE');

describe('Inzidenzwert Skill', () => {

    describe('ErrorHandler', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest(''),
                says: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                reprompts: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('FallbackIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.FallbackIntent'),
                says: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                reprompts: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('HelpIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
                says: 'Du kannst sagen „Öffne Inzidenzwert“ und ich nenne dir die aktuelle 7-Tage-Inzidenz für deine Adresse.',
                // reprompts: 'Du kannst sagen „Öffne Inzidenzwert“ und ich nenne dir die aktuelle 7-Tage-Inzidenz für deine Adresse. Bitte gib dafür die gewünschte Adresse in deinem Alexa-Gerät an und aktiviere die Berechtigung für die Abfrage der Geräte-Adresse in den Skill-Einstellungen der Amazon Alexa App.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('SessionEndedRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getSessionEndedRequest(),
                saysNothing: true, repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('CancelIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.CancelIntent'),
                says: '<say-as interpret-as="interjection">bis dann</say-as>.',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('StopIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
                says: '<say-as interpret-as="interjection">bis dann</say-as>.',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('LaunchRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getLaunchRequest(),
                says: 'Bitte die Berechtigung für die Abfrage der Geräte-Adresse in den Skill-Einstellungen der Amazon Alexa App aktivieren.',
                //hasCardTitle: 'Radio Gong Playlist',
                //hasCardTextLike: 'Du hörst gerade ',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('QueryValueIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('QueryValueIntent'),
                says: 'Bitte die Berechtigung für die Abfrage der Geräte-Adresse in den Skill-Einstellungen der Amazon Alexa App aktivieren.',
                //hasCardTitle: 'Radio Gong Playlist',
                //hasCardTextLike: 'Du hörst gerade ',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('QueryCityIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('QueryCityIntent'),
                says: 'Ich kann diese Stadt leider nicht finden.',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('QueryCityIntent', { city: 'würzburg' }),
                saysLike: 'Der 7-Tage-Inzidenzwert in Kreisfreie Stadt Würzburg beträgt ',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('QueryCityIntent', { city: 'waldbüttelbrunn' }),
                saysLike: 'Der 7-Tage-Inzidenzwert in Landkreis Würzburg beträgt ',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('QueryCityIntent', { city: 'london' }),
                says: 'Ich kann den Wert nur für Deutschland bestimmen.',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('QueryCityIntent', { city: 'x y z' }),
                says: 'Ich kann den Wert nur für Deutschland bestimmen.',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });
});
