import 'mocha';
import { expect } from 'chai';
import { addParameter, createTypedRoute } from '../src';

const base = createTypedRoute();

describe('addParameter', () => {
    it('adds a parameter', () => {
        const value = 'my-test-path';

        const route = addParameter(value)(base);

        expect(route.template).to.equal('/:' + value);
        expect(route.parameters).to.equal(undefined);
        expect(route.fill('42')).to.equal('/42');
    });
    it('adds multiple parameters', () => {
        const route = addParameter('tab')(addParameter('id')(base));

        const values: typeof route.parameters = {
            id: '5',
            tab: 'password',
        };

        expect(route.template).to.equal('/:id/:tab');
        expect(route.parameters).to.equal(undefined);
        expect(route.fill(values.id)(values.tab)).to.equal(`/${values.id}/${values.tab}`);
    });
});
