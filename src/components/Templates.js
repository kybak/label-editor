import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {Mutation} from 'react-apollo'
import {gql} from 'apollo-boost'
// import { DRAFTS_QUERY } from './TemplatesView'
import TemplatesCreate from './TemplatesCreate'
import TemplatesView from './TemplatesView'

class Templates extends React.Component {

    render() {
        const {elements, renderTemplate, defaultName, tplName, tplId} = this.props;
        return (
            <div style={{position: "absolute", right: "0px", top: "-92px"}} className="flex-row align-end">
                <TemplatesView tplId={tplId} renderTemplate={tpl => renderTemplate(tpl)}/>
                <TemplatesCreate name={tplName} tplId={tplId} renderTemplate={tpl => renderTemplate(tpl)}/>
            </div>
        )
    }

};

export default Templates;