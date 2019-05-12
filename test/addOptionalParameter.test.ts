import 'mocha';
import { expect } from 'chai';
import { addOptionalParameter, createTypedRoute } from '../src';

const base = createTypedRoute();

describe('addOptionalParameter', () => {
    it('adds a parameter', () => {
        const value = 'my-test-path';

        const route = addOptionalParameter<{ [value]: number }>(value)(base);

        expect(route.template).to.equal('/:' + value + '?');
        expect(route.parameters).to.equal(undefined);
        expect(route.fillAll(42)).to.equal('/42');
        expect(route.filled(42)).to.equal('/42');
    });
    it('adds multiple parameters', () => {
        const route = addOptionalParameter<{ tab: string }>('tab')(addOptionalParameter<{ id: number }>('id')(base));

        const values: typeof route.parameters = {
            id: 5,
            tab: 'password',
        };

        expect(route.template).to.equal('/:id?/:tab?');
        expect(route.parameters).to.equal(undefined);
        expect(route.fillAll(values.tab, values.id)).to.equal('/5/password');
        expect(route.filled(values.id)(values.tab)).to.equal('/5/password');
    });
    it('excludes parameters when they are undefined', () => {
        const route = addOptionalParameter<{ tab: string }>('tab')(addOptionalParameter<{ id: number }>('id')(base));

        const values: typeof route.parameters = {
            id: 5,
            tab: 'password',
        };

        expect(route.template).to.equal('/:id?/:tab?');
        expect(route.parameters).to.equal(undefined);
        expect(route.fillAll(undefined, values.id)).to.equal('/5');
        expect(route.filled(values.id)(undefined)).to.equal('/5');
        expect(route.fillAll(values.tab, undefined)).to.equal('/password');
        expect(route.filled(undefined)(values.tab)).to.equal('/password');
    });
});
