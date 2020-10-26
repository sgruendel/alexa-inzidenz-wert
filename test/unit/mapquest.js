'use strict';

const expect = require('chai').expect;
const mapquest = require('../../lambda/mapquest');

describe('mapquest', () => {
    describe('#address()', () => {
        it('should work für Würzburg', async() => {
            const result = await mapquest.address('Beethovenstr. 1A, 97080 Würzburg');
            expect(result.info.statuscode).to.equal(0);
            expect(result.results).to.have.lengthOf(1);
            expect(result.results[0].locations).to.have.lengthOf(1);
            expect(result.results[0].locations[0].latLng.lat).to.equal(49.797763);
            expect(result.results[0].locations[0].latLng.lng).to.equal(9.944532);
        });

        it('should work für Kitzingen', async() => {
            const result = await mapquest.address('Feldrain, 97318 Kitzingen');
            expect(result.info.statuscode).to.equal(0);
            expect(result.results).to.have.lengthOf(1);
            expect(result.results[0].locations).to.have.lengthOf(1);
            expect(result.results[0].locations[0].latLng.lat).to.equal(49.738005);
            expect(result.results[0].locations[0].latLng.lng).to.equal(10.138158);
        });
    });
});
