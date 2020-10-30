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
            expect(result.features[0].attributes.BEZ).to.equal('Kreisfreie Stadt');
            expect(result.features[0].attributes.BL).to.equal('Bayern');
            expect(result.features[0].attributes.county).to.equal('SK Würzburg');
            expect(result.features[0].attributes.cases).to.be.at.least(0);
            expect(result.features[0].attributes.deaths).to.be.at.least(0);
            expect(result.features[0].attributes.cases_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.cases_per_population).to.be.at.least(0);
            expect(result.features[0].attributes.cases7_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.cases7_bl_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.last_update).to.be.a('String');
        });

        it('should work für Kitzingen', async() => {
            const result = await arcgis.query(49.740, 10.165);
            expect(result.features).to.exist;
            expect(result.features).to.have.lengthOf(1);
            expect(result.features[0].attributes.GEN).to.equal('Kitzingen');
            expect(result.features[0].attributes.BEZ).to.equal('Landkreis');
            expect(result.features[0].attributes.BL).to.equal('Bayern');
            expect(result.features[0].attributes.county).to.equal('LK Kitzingen');
            expect(result.features[0].attributes.cases).to.be.at.least(0);
            expect(result.features[0].attributes.deaths).to.be.at.least(0);
            expect(result.features[0].attributes.cases_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.cases_per_population).to.be.at.least(0);
            expect(result.features[0].attributes.cases7_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.cases7_bl_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.last_update).to.be.a('String');
        });

        it('should work für Eisingen', async () => {
            const result = await arcgis.query(49.762, 9.826);
            expect(result.features).to.exist;
            expect(result.features).to.have.lengthOf(1);
            expect(result.features[0].attributes.GEN).to.equal('Würzburg');
            expect(result.features[0].attributes.BEZ).to.equal('Landkreis');
            expect(result.features[0].attributes.BL).to.equal('Bayern');
            expect(result.features[0].attributes.county).to.equal('LK Würzburg');
            expect(result.features[0].attributes.cases).to.be.at.least(0);
            expect(result.features[0].attributes.deaths).to.be.at.least(0);
            expect(result.features[0].attributes.cases_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.cases_per_population).to.be.at.least(0);
            expect(result.features[0].attributes.cases7_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.cases7_bl_per_100k).to.be.at.least(0);
            expect(result.features[0].attributes.last_update).to.be.a('String');
        });
    });
});
