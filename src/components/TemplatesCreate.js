import React, {Component, Fragment} from 'react'
import {withRouter} from 'react-router-dom'
import {Mutation} from 'react-apollo'
import {gql} from 'apollo-boost'
import {TEMPLATES_QUERY} from './TemplatesView'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {TEMPLATE_FRAGMENT} from "../constants/fragments";



class TemplatesCreate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.name
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({name: nextProps.name});
    }

    render() {
        const {tplId, renderTemplate} = this.props;
        const {name} = this.state;

        return (
            <div className="flex-row justify-center align-end">
                <TextField
                    label="Template Name"
                    value={name}
                    onChange={e=>this.setState({name: e.target.value})}
                    style={{margin: "5px"}}
                />

                <Mutation
                    mutation={CREATE_TEMPLATE_MUTATION}
                    update={(cache, {data}) => {
                        const {templates} = cache.readQuery({query: TEMPLATES_QUERY});
                        cache.writeQuery({
                            query: TEMPLATES_QUERY,
                            data: {templates: templates.concat([data.createTemplate])},
                        })
                    }}
                >
                    {(createTemplate, {data, loading, error}) => {
                        return (
                            <div className="flex-row">
                                <Button variant="outlined"
                                    onClick={async e => {
                                        e.preventDefault();
                                        await createTemplate({
                                            variables: {name: "Unnamed Template", height:"3.75", width: "5"},
                                        }).then(res=> renderTemplate(res.data.createTemplate));
                                    }}
                                >NEW</Button>
                            </div>

                        )
                    }}
                </Mutation>

                <Mutation
                    mutation={UPDATE_TEMPLATE_MUTATION}
                    update={(cache, {data}) => {
                        const {templates} = cache.readQuery({query: TEMPLATES_QUERY});
                        cache.writeQuery({
                            query: TEMPLATES_QUERY,
                            data: {templates: templates.concat([data.createTemplate])},
                        })
                    }}
                >
                    {(updateTemplate, {data, loading, error}) => {
                        return (
                            <div className="flex-row">
                                <Button variant="outlined"
                                    onClick={async e => {
                                        e.preventDefault();
                                        const {name} = this.state;

                                        await updateTemplate({
                                            variables: {tplId: tplId, name: name}
                                        });
                                    }}
                                >SAVE</Button>
                            </div>

                        )
                    }}
                </Mutation>
            </div>

        )
    }
}

const CREATE_TEMPLATE_MUTATION = gql`
    mutation CreateTemplateMutation($name: String!, $elements: [ElementCreateInput]) {
        createTemplate(
            name: $name
            elements: $elements
        ) {
            ...AllTemplate
        }
    }
    ${TEMPLATE_FRAGMENT}
`;

const UPDATE_TEMPLATE_MUTATION = gql`
    mutation UpdateTemplateMutation($name: String!, $tplId: ID!) {
        updateTemplate(
            name: $name
            tplId: $tplId
        ) {
            ...AllTemplate
        }
    }
    ${TEMPLATE_FRAGMENT}
`;

export default withRouter(TemplatesCreate)
