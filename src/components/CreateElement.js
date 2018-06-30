import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {Mutation} from 'react-apollo'
import {gql} from 'apollo-boost'
import {TEMPLATES_WHERE_QUERY} from './Template'
import Button from '@material-ui/core/Button';


class CreateElement extends Component {
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
        const {tplId, name} = this.props;

        return (
            <Mutation mutation={CREATE_ELEMENT_MUTATION}>
                {(createElement, {data, loading, error}) => {
                    return (
                        <Button variant="outlined"
                                onClick={async e => {
                                    e.preventDefault();
                                    const element = {
                                            name: name,
                                            text: "ABC",
                                            horAlign: "0",
                                            verAlign: "0",
                                            fontSize: "20px",
                                            color: "black",
                                            weight: "normal",
                                            barcodeWidth: "2",
                                            barcodeHeight: "100",
                                            thickness: "2px",
                                            data: ""
                                        },
                                        id = Math.floor(Math.random() * 90000) + 10000;


                                    await createElement({
                                        variables: {
                                            tplId,
                                            element: [element]
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
                                    })
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

const CREATE_ELEMENT_MUTATION = gql`
    mutation CreateElementMutation($tplId: ID!, $element: [ElementCreateInput]) {
        createElement(
            tplId: $tplId
            element: $element
        ) {
            id
            height
            width
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
                thickness
                rotate
            }
        }
    }
`

export default withRouter(CreateElement)
