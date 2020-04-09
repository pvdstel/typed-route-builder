import 'mocha';
import { expect } from 'chai';
import { addSegment, createTypedRoute } from '../src';

const base = createTypedRoute();

describe('addSegment', () => {
    it('adds a segment', () => {
        const value = 'my-test-path';

        const route = addSegment(value)(base);

        expect(route.path).to.equal('/' + value);
        expect(route.params).to.equal(undefined);
        expect(route.fill).to.equal('/' + value);
    });
    it('adds multiple segments', () => {
        const values = ['manage', 'policies', 'built-in'];

        const route = addSegment(values[2])(addSegment(values[1])(addSegment(values[0])(base)));

        expect(route.path).to.equal('/' + values.join('/'));
        expect(route.params).to.equal(undefined);
        expect(route.fill).to.equal('/' + values.join('/'));
    });
});
