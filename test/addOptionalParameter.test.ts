import 'mocha';
import { expect } from 'chai';
import { addOptionalParam, createTypedRoute } from '../src';

const base = createTypedRoute();

describe('addOptionalParameter', () => {
    it('adds a parameter', () => {
        const value = 'my-test-path';

        const route = addOptionalParam(value)(base);

        expect(route.path).to.equal('/:' + value + '?');
        expect(route.params).to.equal(undefined);
        expect(route.fill('42')).to.equal('/42');
    });
    it('adds multiple parameters', () => {
        const route = addOptionalParam('tab')(addOptionalParam('id')(base));

        const values: typeof route.params = {
            id: '5',
            tab: 'password',
        };

        expect(route.path).to.equal('/:id?/:tab?');
        expect(route.params).to.equal(undefined);
        expect(route.fill(values.id)(values.tab)).to.equal('/5/password');
    });
    it('excludes parameters when they are undefined', () => {
        const route = addOptionalParam('tab')(addOptionalParam('id')(base));

        const values: typeof route.params = {
            id: '5',
            tab: 'password',
        };

        expect(route.path).to.equal('/:id?/:tab?');
        expect(route.params).to.equal(undefined);
        expect(route.fill(values.id)(undefined)).to.equal('/5');
        expect(route.fill(undefined)(values.tab)).to.equal('/password');
    });
});
