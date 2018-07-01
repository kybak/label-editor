import React, {Fragment} from 'react'
import ReactDOM from 'react-dom'
import {
    NavLink,
    Link,
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom'
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloProvider} from 'react-apollo'
import ApolloClient from 'apollo-boost'
import Container from './components/Container'
// import FeedPage from './components/FeedPage'
import TemplatesView from './components/TemplatesView'
// import CreatePage from './components/CreatePage'
// import DetailPage from './components/DetailPage'
import 'tachyons'
import './index.css'

const cache = new InMemoryCache({
    dataIdFromObject: object => object.id
});

const client = new ApolloClient({
    uri: 'http://localhost:4000',
    cache
});
// http://178.128.182.29
ReactDOM.render(
    <ApolloProvider client={client}>
        <Router>
            <Fragment>
                <Switch>
                    <Route exact
                           path="/"
                           component={Container}/>
                </Switch>
            </Fragment>
        </Router>
    </ApolloProvider>,
    document.getElementById('root'),
);




// :template/:id/:product/:ingredients/:pesticides/:soldBy/:additionalGrower/:labId/:harvestDate/:manufactureDate/:bestByDate/:thc/:cbd/:thca/:cbda/:cbg/:cbn/:cbc