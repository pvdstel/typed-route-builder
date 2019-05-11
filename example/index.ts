import { TypedRouteBuilder, addOptionalParameter, addParameter, addSegment, createRoute } from "../src";

/**
 * This example describes a route to the user editor,
 * selecting a user by the ID attribute,
 * editing
 * the given field,
 * and then redirecting elsewhere.
 */

const userEditorRoute1 = new TypedRouteBuilder()
    .segment('users')
    .parameter<{ id: number }>('id')
    .segment('edit')
    .parameter<{ field: string }>('field')
    .optionalParameter<{ redirect: string }>('redirect')
    .typedRoute();

const userEditorRoute2 = addOptionalParameter<{ redirect?: string }>('redirect')(
    addParameter<{ field: string }>('field')(
        addSegment('edit')(
            addParameter<{ id: number }>('id')(
                addSegment('users')(
                    createRoute()
                )
            )
        )
    )
);

const userEditorRoute3_0 = createRoute();
const userEditorRoute3_1 = addSegment('users')(userEditorRoute3_0);
const userEditorRoute3_2 = addParameter<{ id: number }>('id')(userEditorRoute3_1);
const userEditorRoute3_3 = addSegment('edit')(userEditorRoute3_2);
const userEditorRoute3_4 = addParameter<{ field: string }>('field')(userEditorRoute3_3);
const userEditorRoute3_5 = addOptionalParameter<{ redirect?: string }>('redirect')(userEditorRoute3_4);

console.log(userEditorRoute1.template);
console.log(userEditorRoute1.parameters);
console.log(userEditorRoute1.fill);

const params: typeof userEditorRoute1.parameters = {
    id: 25,
    field: 'name',
    redirect: 'https://example.com',
};

userEditorRoute2.fill(params.redirect, params.field, params.id);

console.log(userEditorRoute1.fill(params.redirect, params.field, params.id));
console.log(userEditorRoute2.fill(params.redirect, params.field, params.id));
console.log(userEditorRoute3_5.fill(params.redirect, params.field, params.id));
