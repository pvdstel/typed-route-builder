import * as util from 'util';
import { addOptionalParam, addParam, addSegment, createTypedRoute, TypedRouteBuilder } from '../src';

/**
 * This example describes a route to the user editor,
 * selecting a user by the ID attribute,
 * editing
 * the given field,
 * and then redirecting elsewhere.
 */

const articleEditor = new TypedRouteBuilder()
    .segment('article')
    .param('articleId')
    .optionalParam('asUserId')
    .build();

console.log(util.inspect(articleEditor));
console.log(articleEditor.fill('34')(undefined));

const userEditorRoute2 = addOptionalParam('hash')(
    addOptionalParam('redirect')(
        addParam('field')(
            addSegment('edit')(
                addParam('id')(
                    addSegment('users')(
                        addSegment('2-manage')(
                            createTypedRoute()
                        )
                    )
                )
            )
        )
    )
);

const userEditorRoute3_0 = createTypedRoute();
const userEditorRoute3_1 = addSegment('3-manage')(userEditorRoute3_0);
const userEditorRoute3_2 = addSegment('users')(userEditorRoute3_1);
const userEditorRoute3_3 = addParam('id')(userEditorRoute3_2);
const userEditorRoute3_4 = addSegment('edit')(userEditorRoute3_3);
const userEditorRoute3_5 = addParam('field')(userEditorRoute3_4);
const userEditorRoute3_6 = addOptionalParam('redirect')(userEditorRoute3_5);
const userEditorRoute3_7 = addOptionalParam('hash')(userEditorRoute3_6);

const params: typeof userEditorRoute2.params = {
    id: '25',
    field: 'the_field_i_edit',
    redirect: undefined,// 'uri_home{3}',
    hash: '#pound'
};

const argId = userEditorRoute2.fill(params.id);
const argField = argId(params.field);
const argRedirect = argField(params.redirect);
const argHash = argRedirect(params.hash);
console.log(argHash);

console.log(userEditorRoute2.fill(params.id)(params.field)(params.redirect)(params.hash));
console.log(userEditorRoute3_7.fill('1')('2nd')('3rd')('4th'));

const rootRoute = createTypedRoute('/');
console.log(rootRoute.path);
console.log(rootRoute.fill);

const simpleRoute = new TypedRouteBuilder().segment('hi').segment('there').build();
console.log(simpleRoute.path);
console.log(simpleRoute.fill);

const complicatedRoute = new TypedRouteBuilder(simpleRoute).param('id').build();
console.log(complicatedRoute.fill('42'));
