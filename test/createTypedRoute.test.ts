import 'mocha';
import { expect } from 'chai';
import { createTypedRoute } from '../src';

describe('createTypedRoute', () => {
    it('creates an empty typed route', () => {
        const value = '';

        const route = createTypedRoute();

        expect(route.template).to.equal(value);
        expect(route.parameters).to.equal(undefined);
        expect(route.fillAll()).to.equal(value);
        expect(route.filled).to.equal(value);
    });
    it('creates a typed route with the given parameter', () => {
        const value = 'my-test-path';

        const route = createTypedRoute(value);

        expect(route.template).to.equal(value);
        expect(route.parameters).to.equal(undefined);
        expect(route.fillAll()).to.equal(value);
        expect(route.filled).to.equal(value);
    });
});
