import React, {Component, Fragment} from 'react'
// import Post from '../components/Post'
import {Query} from 'react-apollo'
import {gql} from 'apollo-boost'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

let loaded = false;

export default class TemplatesView extends Component {
    constructAndRender(val, tpl) {
        const template = tpl.find(t => t.id === val);
        if (template) this.props.renderTemplate(template)
    }


    render() {
        const {renderTemplate, tplId} = this.props;

        return (
            <Query query={TEMPLATES_QUERY}>
                {({data, loading, error, refetch}) => {
                    if (loading) {
                        return (
                            <div>
                                <div>Loading ...</div>
                            </div>
                        )
                    }

                    if (error) {
                        return (
                            <div>
                                <div>An unexpected error occured.</div>
                            </div>
                        )
                    }

                    return (
                        <Fragment>
                            <Select
                                style={{height: "35px", margin: "5px"}}
                                value={tplId}
                                onChange={e => this.constructAndRender(e.target.value, data.templates)}
                            >
                                {data.templates &&
                                data.templates.map(tpl => (
                                    <MenuItem
                                        key={tpl.id}
                                        value={tpl.id}
                                    >{tpl.name}</MenuItem>
                                ))}
                            </Select>

                            {this.props.children}
                        </Fragment>
                    )
                }}
            </Query>
        )
    }
}

export const TEMPLATES_QUERY = gql`
    query TemplatesQuery {
        templates {
            id
            name
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
                thickness
                rotate
            }
        }
    }
`
