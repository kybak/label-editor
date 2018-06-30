import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {Mutation} from 'react-apollo'
import {gql} from 'apollo-boost'
import {TEMPLATES_WHERE_QUERY} from './Template'
import Button from '@material-ui/core/Button';


class DeleteElement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: ""
        };
    }

    addElement(res) {
        /*        let options = {horAlign: 0, verAlign: 0};
                this.state.elements.push({name: val, id: (Math.floor(Math.random()*90000) + 10000).toString(), ...options});
                this.setState({elements: this.state.elements});*/
    }


    render() {
        const {tplId, element, removeSelected} = this.props;

        return (
            <Mutation mutation={DELETE_ELEMENT_MUTATION}>
                {(deleteElement, {data, loading, error}) => {
                    return (
                        <Button variant="outlined"
                                onClick={async e => {
                                e.preventDefault();
                                await deleteElement({
                                    variables: {
                                        tplId,
                                        element: [{id:element}]
                                    },
                                    /*optimisticResponse: {
                                        __typename: "Mutation",
                                        createElement: {
                                            __typename: "Template",
                                            id: tplId,
                                            elements: [{
                                                __typename: "Element",
                                                id: id,
                                                ...element
                                            }]
                                        }
                                    },*/
                                    update: (cache, {data}) => {
                                        const {template} = cache.readQuery({
                                            query: TEMPLATES_WHERE_QUERY,
                                            variables: {
                                                id: tplId
                                            }
                                        });
                                        cache.writeQuery({
                                            query: TEMPLATES_WHERE_QUERY,
                                            data: {template: template},
                                        })
                                    }
                                });

                                removeSelected();
                            }}
                        >
                            {this.props.children}
                        </Button>

                    )
                }}
            </Mutation>
        )
    }
}

const DELETE_ELEMENT_MUTATION = gql`
    mutation DeleteElementMutation($tplId: ID!, $element: [ElementWhereUniqueInput!]) {
        deleteElement(
            tplId: $tplId
            element: $element
        ) {
            id
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
`

export default withRouter(DeleteElement)
