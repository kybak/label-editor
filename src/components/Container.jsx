import React, {Fragment} from 'react';
import styled from "styled-components";
import Template from './Template.jsx'
import Templates from './Templates'
import CreateElement from './CreateElement';
import DeleteElement from './DeleteElement';
import {Mutation} from 'react-apollo'
import {gql} from "apollo-boost/lib/index";
import {TEMPLATES_WHERE_QUERY} from "./Template";
import domtoimage from 'dom-to-image';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {TEMPLATE_FRAGMENT} from "../constants/fragments";
import InputLabel from '@material-ui/core/InputLabel';
import {withRouter} from 'react-router-dom'




const LabelContainer = styled.div`
   background: #efefef;
   width: 100vw;
   height: 100vh;
     
`;

const Properties = styled.span`
    border-bottom: 2px solid rgba(0, 0, 0, 0.42);
    margin: 20px 0;
    text-align: center
`;

let labelData = {};

class Container extends React.Component {
    constructor(props) {
        super(props);

        labelData = props.match.params;
        this.template = React.createRef();
        this.container = React.createRef();
        this.getImage = this.getImage.bind(this);

        this.state = {
            height: "",
            width: "",
            elements: [],
            tplName: labelData.template,
            tplId: "",
            print: false
        };
    }

    componentWillReceiveProps(props) {
    }

    async changeSize(e, prop, updateTemplate) {
        const val = e.target.value;
        this.setState({
            [prop]: val,
        });

        await updateTemplate({
            variables: {
                tplId: this.state.tplId,
                name: this.state.tplName,
                height: prop === 'height' ? val : this.state.height,
                width: prop === 'width' ? val : this.state.width
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
                        id: this.state.tplId
                    }
                });
                cache.writeQuery({
                    query: TEMPLATES_WHERE_QUERY,
                    data: {template: template},
                })
            }
        })
    };

    addElement(val) {
        let options = {horAlign: 0, verAlign: 0};
        this.state.elements.push({name: val, id: (Math.floor(Math.random() * 90000) + 10000).toString(), ...options});
        this.setState({elements: this.state.elements});
    }

    getImage() {
        this.setState({print: true});
        const node = ReactDOM.findDOMNode(this.template.current);

        domtoimage.toPng(node)
            .then((dataUrl) => {
                // ReactDOM.render(<img src={dataUrl}></img>, ReactDOM.findDOMNode(this.container.current));
                let link = document.createElement('a');
                link.download = `${labelData.product + "-" + labelData.soldBy.trim()}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });
    }

    async changeAttribute(attr, val, updateElement) {
        const {selected} = this.state;
        let el = Array.isArray(selected) ? selected[0] : selected;
        el[attr] = val;
        this.setState({selected: {...el}});
        const id = el.id;
        let elInstance = {...el};
        delete elInstance.id;
        delete elInstance.__typename;

        await updateElement({
            variables: {
                tplId: this.state.tplId,
                element: [{
                    where: {id: id},
                    data: {...elInstance}
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
            update: (cache, {data}) => {
                const {template} = cache.readQuery({
                    query: TEMPLATES_WHERE_QUERY,
                    variables: {
                        id: this.state.tplId
                    }
                });
                cache.writeQuery({
                    query: TEMPLATES_WHERE_QUERY,
                    data: {template: template},
                })
            }
        })
    }

    renderTemplate(tpl) {
        console.log('TPLCONTAINER', tpl);
        this.setState({tplName: tpl.name, tplId: tpl.id, height: tpl.height, width: tpl.width, elements: JSON.parse(JSON.stringify(tpl.elements))})
    }

    render() {
        const {height, width, elements, defaultName, tplName, tplId, selected, print} = this.state;

        return (
            <LabelContainer ref={this.container} style={{position: "fixed", overflow: "auto"}} className="flex-column justify-center align-center">


                <div style={{position: "relative", width: "100%", height: "100%"}}>

                    <Templates tplId={tplId} tplName={tplName} renderTemplate={tpl => this.renderTemplate(tpl)}/>

                    <div style={{position: "absolute", right: "50px", top: "50px", width: "150px"}}
                         className="flex-column">
                        <div className="flex-row">
                            <Mutation mutation={UPDATE_TEMPLATE_MUTATION}>
                                {(updateTemplate, {data, loading, error}) => {
                                    return (
                                        <Fragment>
                                            <TextField
                                                label="Height"
                                                value={height}
                                                onChange={e => this.changeSize(e, 'height', updateTemplate)}
                                                style={{margin: "0 3px 10px 0"}}
                                            />
                                            <TextField
                                                label="Width"
                                                value={width}
                                                onChange={e => this.changeSize(e, 'width', updateTemplate)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                        </Fragment>
                                    )
                                }}
                            </Mutation>
                        </div>

                        <Button variant="outlined" onClick={this.getImage}>Print</Button>
                        <CreateElement tplId={tplId} name="label">Label</CreateElement>
                        <CreateElement tplId={tplId} name="text">Text</CreateElement>
                        <CreateElement tplId={tplId} name="divider">Divider</CreateElement>
                        <CreateElement tplId={tplId} name="barcode">Barcode</CreateElement>
                        {selected &&
                        <DeleteElement tplId={tplId} element={selected.id}
                                       removeSelected={() => this.setState({selected: null})}>Delete</DeleteElement>
                        }

                        {selected && <Properties>PROPERTIES</Properties>}

                        <Mutation mutation={UPDATE_ELEMENT_MUTATION}>
                            {(updateElement, {data, loading, error}) => {
                                return (
                                    <Fragment>
                                        {selected && (selected.name === "text" || selected.name === "label") &&
                                        <Fragment>
                                            <TextField
                                                label="Text"
                                                value={selected.text}
                                                onChange={e => this.changeAttribute("text", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                            <TextField
                                                label="Font Size"
                                                value={selected.fontSize}
                                                onChange={e => this.changeAttribute("fontSize", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                            <TextField
                                                label="Rotation (degrees)"
                                                value={selected.rotate}
                                                onChange={e => this.changeAttribute("rotate", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                            <Button variant="outlined"
                                                onClick={e => this.changeAttribute("weight", "bold", updateElement)}>
                                                Bold
                                            </Button>
                                            <InputLabel htmlFor="data" style={{marginTop: "10px"}}>Data</InputLabel>
                                            <Select
                                                id="data"
                                                value={selected.data}
                                                onChange={e => this.changeAttribute("data", e.target.value, updateElement)}>
                                                {Object.keys(labelData).map((item) => (
                                                    <MenuItem key={item} value={item}>{item}</MenuItem>)
                                                )}
                                            </Select>
                                        </Fragment>
                                        }

                                        {selected && selected.name === "divider" &&
                                        <Fragment>
                                            <TextField
                                                label="Thickness"
                                                value={selected.thickness}
                                                onChange={e => this.changeAttribute("thickness", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                            <TextField
                                                label="Width"
                                                value={selected.dividerWidth}
                                                onChange={e => this.changeAttribute("dividerWidth", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                        </Fragment>
                                        }

                                        {selected && selected.name === "barcode" &&
                                        <Fragment>
                                            <TextField
                                                label="Barcode Height"
                                                value={selected.barcodeHeight}
                                                onChange={e => this.changeAttribute("barcodeHeight", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                            <TextField
                                                label="Barcode Width"
                                                value={selected.barcodeWidth}
                                                onChange={e => this.changeAttribute("barcodeWidth", e.target.value, updateElement)}
                                                style={{margin: "0 0 10px 3px"}}
                                            />
                                        </Fragment>
                                        }

                                        {/*{selected && selected[1] &&
                                        <Fragment>
                                            <button
                                                onClick={e => this.changeAttribute("horAlign", selected[1].horAlign)}>Align
                                                vertical
                                            </button>
                                            <button
                                                onClick={e => this.changeAttribute("verAlign", selected[1].verAlign)}>Align
                                                horizontal
                                            </button>
                                        </Fragment>
                                        }*/}
                                    </Fragment>
                                )
                            }}
                        </Mutation>


                    </div>

                    <Template ref={this.template} height={height} width={width} tplName={tplName} tplId={tplId}
                              setSelected={selected => this.setState({selected: selected})} selected={selected}
                              labelData={labelData}
                              print={print}
                    />

                </div>

            </LabelContainer>
        );
    }
}

const UPDATE_ELEMENT_MUTATION = gql`
    mutation UpdateElementMutation($tplId: ID!, $element: [ElementUpdateWithWhereUniqueNestedInput!]) {
        updateElement(
            tplId: $tplId
            element: $element
        ) {
            ...AllTemplate
        }
    }
    ${TEMPLATE_FRAGMENT}
`;

const UPDATE_TEMPLATE_MUTATION = gql`
    mutation UpdateTemplateMutation($name: String, $height: String, $width: String, $tplId: ID!) {
        updateTemplate(
            tplId: $tplId
            height: $height
            width: $width
            name: $name
        ) {
            ...AllTemplate
        }
    }
    ${TEMPLATE_FRAGMENT}
`;

export default withRouter(Container)