import 'mocha';
import { expect } from 'chai';
import { addParam, createTypedRoute } from '../src';

const base = createTypedRoute();

describe('addParameter', () => {
    it('adds a parameter', () => {
        const value = 'my-test-path';

        const route = addParam(value)(base);

        expect(route.path).to.equal('/:' + value);
        expect(route.params).to.equal(undefined);
        expect(route.fill('42')).to.equal('/42');
    });
    it('adds multiple parameters', () => {
        const route = addParam('tab')(addParam('id')(base));

        const values: typeof route.params = {
            id: '5',
            tab: 'password',
        };

        expect(route.path).to.equal('/:id/:tab');
        expect(route.params).to.equal(undefined);
        expect(route.fill(values.id)(values.tab)).to.equal(`/${values.id}/${values.tab}`);
    });
});
