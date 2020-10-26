'use strict';

const expect = require('chai').expect;
const arcgis = require('../../lambda/arcgis');

describe('arcgis', () => {
    describe('#query()', () => {
        it('should work für Würzburg', async() => {
            const result = await arcgis.query(49.797, 9.945);
            expect(result.features).to.exist;
            expect(result.features).to.have.lengthOf(1);
            expect(result.features[0].attributes.GEN).to.equal('Würzburg');
            expect(result.features[0].attributes.cases7_per_100k).to.be.at.least(0);
        });

        it('should work für Kitzingen', async() => {
            const result = await arcgis.query(49.740, 10.165);
            expect(result.features).to.exist;
            expect(result.features).to.have.lengthOf(1);
            expect(result.features[0].attributes.GEN).to.equal('Kitzingen');
            expect(result.features[0].attributes.cases7_per_100k).to.be.at.least(0);
        });
    });
});
