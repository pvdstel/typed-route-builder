import 'mocha';
import { expect } from 'chai';
import { createTypedRoute } from '../src';

describe('createTypedRoute', () => {
    it('creates an empty typed route', () => {
        const value = '';

        const route = createTypedRoute();

        expect(route.path).to.equal(value);
        expect(route.params).to.equal(undefined);
        expect(route.fill).to.equal(value);
        expect(route.build()).to.equal(value);
    });
    it('creates a typed route with the given parameter', () => {
        const value = 'my-test-path';

        const route = createTypedRoute(value);

        expect(route.path).to.equal(value);
        expect(route.params).to.equal(undefined);
        expect(route.build()).to.equal(value);
    });
});
