import {TEMPLATE_QUERY} from "./Template";
import {gql} from "apollo-boost/lib/index";
import {Mutation} from 'react-apollo';
import React, {Fragment} from 'react';


export const UpdateElementMutation = (props) => (
    <Mutation
        mutation={UPDATE_ELEMENT_MUTATION}
        update={(cache, {data}) => {
            const {template} = cache.readQuery({
                query: TEMPLATE_QUERY,
                variables: {
                    id: props.tplId
                }
            });
            cache.writeQuery({
                query: TEMPLATE_QUERY,
                data: {template: template},
            })
        }}
    >
        {(updateElement, {data, loading, error}) => {
            // const Template = this._renderMutationTemplate(template, this.state, this.props);

            return (
                props.children
            )
        }}
    </Mutation>
)


export const UPDATE_ELEMENT_MUTATION = gql`
    query UpdateElement($tplId: ID!, $element: [ElementUpdateWithWhereUniqueNestedInput!]) {
        updateElement(tplId: $tplId, element: $element) {
            id
            name
            elements {
                id
                name
                text
                horAlign
                verAlign
                fontSize
                color
                weight
                barcodeWidth
                barcodeHeight
                data
                rotate
            }
        }
    }
`;