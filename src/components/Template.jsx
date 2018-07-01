import React, {Fragment} from 'react';
import styled from "styled-components";
import Draggable from 'react-draggable';
import Barcode from 'react-barcode'
import {gql} from "apollo-boost/lib/index";
import {Query, Mutation} from 'react-apollo'
import {withRouter} from "react-router-dom";
import Container from "./Container";
import {TEMPLATE_FRAGMENT} from "../constants/fragments";


const LabelComponent = styled.div.attrs({
    height: props => props.height + "in" || '3.75in',
    width: props => props.width + "in" || '5in'
})`
  background: white;
  box-shadow: 1px 1px 5px #00000054;
  height: ${props => props.height};
  width: ${props => props.width};
`;

const Dragger = styled.div.attrs({
    border: props => {
        if (props.print) {
            return 'none'
        } else if (props.sel) {
            return '2px dotted lightseagreen'
        } else {
            return '2px dotted lightgray'
        }
    },
    padding: props => props.print ? "2px" : "0",
    transform: props => props.style.transform + ' rotate(' + props.rotate + 'deg)'
})`
    padding: ${props => props.padding};
    cursor: move;
    width: max-content;      
    border: ${props => props.border};
    transform: ${props => props.transform}!important
    white-space: nowrap;
    position: fixed;
`;

const Text = styled.div.attrs({
    color: props => props.color || 'black',
    fontSize: props => props.fontSize + "px" || '20px',
    fontWeight: props => props.weight || 'normal',
})`
  padding: 5px;
  font-weight: ${props => props.weight};
  color: ${props => props.color};
  font-size: ${props => props.fontSize};
`;

const Divider = styled.div.attrs({
    color: props => props.color || 'black',
    thickness: props => props.thickness + "px" || '2px'
})`
  width: 100%;
  height: 5px;
  margin-bottom: 5px;
  border-bottom: 2px solid black;
  color: ${props => props.color};
  border-width: ${props => props.thickness};
`;


class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height: props.height,
            width: props.width,
            selected: null,
            data: {},
            print: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    async handleStop(e, updateElement) {
        const ind = e.path.findIndex(p => p.className && typeof p.className === "string" && p.className.includes("react-draggable"));
        const styles = window.getComputedStyle(e.path[ind], null),
            regExp = /\(([^)]+)\)/,
            values = regExp.exec(styles.transform);
        const array = values[1].split(",");

        let {selected} = this.state;
        selected.horAlign = parseInt(array[4]);
        selected.verAlign = parseInt(array[5]);
        this.setState({selected: {...selected}});
        const id = selected.id;
        let selectedInstance = {...selected};
        delete selectedInstance.id;
        delete selectedInstance.__typename;

        await updateElement({
            variables: {
                tplId: this.props.tplId,
                element: [{
                    where: {id: id},
                    data: {...selectedInstance}
                }]
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

        })
    }

    select(e, el) {
        if (e.shiftKey) {
            this.props.setSelected([this.state.selected, el]);
        } else {
            this.props.setSelected(el);
        }
    }

    getText(el) {
        if (el.data) {
            const data = this.props.labelData[el.data];
            if (el.name === 'text') {
                return data && data !== 'undefined' ? data : ""
            }

            return el.name === 'label' && !data ? "" : el.text
        } else if (el.text) {
            return el.text
        } else {
            return "ABC"
        }
    }

    isSelected(id) {
        const selected = this.state.selected;

        if (selected && Array.isArray(selected)) {
            return selected.findIndex(s => s.id === id) > -1
        } else {
            return selected && selected.id === id
        }
    }

    render() {
        console.log(this.props.tplName);
        return (
            <Query query={TEMPLATES_WHERE_QUERY} variables={{id: this.props.tplId, name: this.props.tplName}}>
                {({data, loading, error}) => {
                    if (loading) {
                        return (
                            <div className="">
                                <div>Loading ...</div>
                            </div>
                        )
                    }

                    if (error) {
                        return (
                            <div className="">
                                <div>An unexpected error occured.</div>
                            </div>
                        )
                    }

                    if (Object.keys(data.templates[0]).length > 0) {
                        const {templates} = JSON.parse(JSON.stringify(data)),
                            Template = this._renderMutationTemplate(templates[0], this.state, this.props);

                        return (
                            <Fragment>
                                {Template}
                            </Fragment>
                        )
                    }

                }}
            </Query>

        );
    }

    _renderMutationTemplate = (template, {height, width, elements, selected, print}, {tplId, labelData}) => {
        return (
            <Mutation
                mutation={UPDATE_ELEMENT_MUTATION}
                update={(cache, {data}) => {
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
                }}
            >
                {(updateElement, {data, loading, error}) => {
                    return (
                        <LabelComponent height={template.height} width={template.width}>
                            {template.elements.map(el => {
                                if (el && el.name === "text") return (
                                    <Draggable style={{width: "100px!important"}} key={el.id}
                                               defaultPosition={{
                                                   x: parseInt(el.horAlign),
                                                   y: parseInt(el.verAlign)
                                               }}
                                               onStart={(e) => this.select(e, el)}
                                               onStop={(e) => this.handleStop(e, updateElement)}>
                                        <Dragger sel={this.isSelected(el.id)} print={print} rotate={el.rotate}>
                                            <Text
                                                fontSize={el.fontSize}
                                                color={el.color}
                                                weight={el.weight}>
                                                {this.getText(el)}
                                            </Text>
                                        </Dragger>
                                    </Draggable>
                                );

                                if (el && el.name === "label") return (
                                    <Draggable style={{width: "100px!important"}} key={el.id}
                                               defaultPosition={{
                                                   x: parseInt(el.horAlign),
                                                   y: parseInt(el.verAlign)
                                               }}
                                               onStart={(e) => this.select(e, el)}
                                               onStop={(e) => this.handleStop(e, updateElement)}>
                                        <Dragger sel={this.isSelected(el.id)} print={print} rotate={el.rotate}>
                                            <Text
                                                fontSize={el.fontSize}
                                                color={el.color}
                                                weight={el.weight}>
                                                {this.getText(el)}
                                            </Text>
                                        </Dragger>
                                    </Draggable>
                                );

                                if (el && el.name === "divider") return (
                                    <Draggable key={el.id} defaultPosition={{
                                        x: parseInt(el.horAlign),
                                        y: parseInt(el.verAlign)
                                    }}
                                               onStart={(e) => this.select(e, el)}
                                               onStop={(e) => this.handleStop(e, updateElement)}>
                                        <Dragger width={el.dividerWidth} sel={this.isSelected(el.id)} print={print}>
                                            <Divider color={el.color}
                                                     thickness={el.thickness}>
                                            </Divider>
                                        </Dragger>
                                    </Draggable>
                                );

                                if (el && el.name === "barcode") return (
                                    <Draggable key={el.id} defaultPosition={{
                                        x: parseInt(el.horAlign),
                                        y: parseInt(el.verAlign)
                                    }}
                                               onStart={(e) => this.select(e, el)}
                                               onStop={(e) => this.handleStop(e, updateElement)}>
                                        <Dragger style={{textAlign: "center"}}
                                                 sel={this.isSelected(el.id)} print={print}>
                                            <Barcode value={labelData.id} displayValue={false}
                                                     width={parseInt(el.barcodeWidth)}
                                                     height={parseInt(el.barcodeHeight)}/>
                                        </Dragger>
                                    </Draggable>
                                );
                            })
                            }

                        </LabelComponent>
                    )

                }}
            </Mutation>
        )

    };
}


export const TEMPLATES_WHERE_QUERY = gql`
    query TemplatesWhereQuery($id: ID, $name: String) {
        templates(id: $id, name: $name) {
            ...AllTemplate
        }
    }
    ${TEMPLATE_FRAGMENT}
`;

const UPDATE_ELEMENT_MUTATION = gql`
    mutation UpdateElement($tplId: ID!, $element: [ElementUpdateWithWhereUniqueNestedInput!]) {
        updateElement(tplId: $tplId, element: $element) {
            ...AllTemplate
        }
    }
    ${TEMPLATE_FRAGMENT}
`;

export default Template


/*
Template.propTypes = {
    height: PropTypes.string,
    width: PropTypes.string
};*/
