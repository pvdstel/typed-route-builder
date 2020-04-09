import { addOptionalParameter, addParameter, addSegment, createTypedRoute, TypedRouteBuilder } from '../src';

/**
 * This example describes a route to the user editor,
 * selecting a user by the ID attribute,
 * editing
 * the given field,
 * and then redirecting elsewhere.
 */

const userEditorRoute1 = new TypedRouteBuilder()
    .segment('1-manage')
    .segment('users')
    .parameter<{ id: number }>('id')
    .segment('edit')
    .parameter<{ field: string }>('field')
    .optionalParameter<{ redirect: string }>('redirect')
    .optionalParameter<{ hash: string }>('hash')
    .build();

console.log('Template:');
console.log('\t' + userEditorRoute1.template);
console.log('Results:');

const userEditorRoute2 = addOptionalParameter<{ hash: string }>('hash')(
    addOptionalParameter<{ redirect?: string }>('redirect')(
        addParameter<{ field: string }>('field')(
            addSegment('edit')(
                addParameter<{ id: number }>('id')(
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
const userEditorRoute3_3 = addParameter<{ id: number }>('id')(userEditorRoute3_2);
const userEditorRoute3_4 = addSegment('edit')(userEditorRoute3_3);
const userEditorRoute3_5 = addParameter<{ field: string }>('field')(userEditorRoute3_4);
const userEditorRoute3_6 = addOptionalParameter<{ redirect: string }>('redirect')(userEditorRoute3_5);
const userEditorRoute3_7 = addOptionalParameter<{ hash: string }>('hash')(userEditorRoute3_6);

const params: typeof userEditorRoute1.parameters = {
    id: 25,
    field: 'the_field_i_edit',
    redirect: undefined,// 'uri_home{3}',
    hash: '#pound'
};

const argId = userEditorRoute1.fill(params.id);
const argField = argId(params.field);
const argRedirect = argField(params.redirect);
const argHash = argRedirect(params.hash);
console.log(argHash);

console.log(userEditorRoute2.fill(params.id)(params.field)(params.redirect)(params.hash));
console.log(userEditorRoute3_7.fill(1)('2nd')('3rd')('4th'));

const rootRoute = createTypedRoute('/');
console.log(rootRoute.template);
console.log(rootRoute.fill);

const simpleRoute = new TypedRouteBuilder().segment('hi').segment('there').build();
console.log(simpleRoute.template);
console.log(simpleRoute.fill);

const complicatedRoute = new TypedRouteBuilder(simpleRoute).parameter<{id: number}>('id').build();
console.log(complicatedRoute.fill(42));
