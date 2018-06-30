import gql from 'graphql-tag';


export const TEMPLATE_FRAGMENT = gql`
    fragment AllTemplate on Template {
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
            data
            thickness
            rotate
        }
        
    }
`;