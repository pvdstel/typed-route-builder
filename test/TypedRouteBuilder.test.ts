import 'mocha';
import { expect } from 'chai';
import { TypedRouteBuilder } from '../src';

describe('TypedRouteBuilder', () => {
    it('constructs typed routes correctly', () => {
        const userEditorRoute = new TypedRouteBuilder()
            .segment('manage')
            .segment('users')
            .parameter('id')
            .segment('edit')
            .parameter('field')
            .optionalParameter('redirect')
            .optionalParameter('hash')
            .build();

        const values: typeof userEditorRoute.parameters = {
            id: '5',
            field: 'password',
            redirect: undefined,
            hash: 'element-hash',
        };

        expect(userEditorRoute.template).to.equal('/manage/users/:id/edit/:field/:redirect?/:hash?');
        expect(userEditorRoute.parameters).to.equal(undefined);
        expect(userEditorRoute.fill(values.id)(values.field)(values.redirect)(values.hash))
            .to.equal(`/manage/users/${values.id}/edit/${values.field}/${values.hash}`);
    });
});
