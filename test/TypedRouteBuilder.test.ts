import 'mocha';
import { expect } from 'chai';
import { TypedRouteBuilder } from '../src';

describe('TypedRouteBuilder', () => {
    it('constructs typed routes correctly', () => {
        const userEditorRoute = new TypedRouteBuilder()
            .segment('manage')
            .segment('users')
            .param('id')
            .segment('edit')
            .param('field')
            .optionalParam('redirect')
            .optionalParam('hash')
            .build();

        const values: typeof userEditorRoute.params = {
            id: '5',
            field: 'password',
            redirect: undefined,
            hash: 'element-hash',
        };

        expect(userEditorRoute.path).to.equal('/manage/users/:id/edit/:field/:redirect?/:hash?');
        expect(userEditorRoute.params).to.equal(undefined);
        expect(userEditorRoute.fill(values.id)(values.field)(values.redirect)(values.hash))
            .to.equal(`/manage/users/${values.id}/edit/${values.field}/${values.hash}`);
    });
});
