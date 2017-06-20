import React from "react";
import { Route, Link, Switch } from "react-router-dom";

import Message from "../Message";
import LuceneQuery from "../LuceneQuery";
import GremlinQuery from "../GremlinQuery";
import QueryHistory from "../QueryHistory";
import ConnectionInfo from "../ConnectionInfo";
import SchemaExplorer from "../SchemaExplorer";
import ORM from "../ORM";

const Splash = () =>
    <Message title="Welcome to the Query Runner">
        <p className="lead">
            This is a simple example app that lets you run queries against the
            HIRO Graph API
        </p>
        <div className="list-group d-inline-flex">
            <Link
                className="list-group-item list-group-item-action"
                to="/lucene"
            >
                Run a Lucene Query
            </Link>
            <Link
                className="list-group-item list-group-item-action"
                to="/gremlin"
            >
                Run a Gremlin Query
            </Link>
            <Link
                className="list-group-item list-group-item-action"
                to="/history"
            >
                See your query history
            </Link>
            <Link className="list-group-item list-group-item-action" to="/info">
                See your HIRO Graph Connection Information
            </Link>
        </div>
    </Message>;

const PageNotFound = ({ location }) =>
    <Message
        title={
            <span>
                Sorry, there's no page at: <code>{location.pathname}</code>
            </span>
        }
    />;
const Main = () =>
    <Switch>
        <Route path="/" exact component={Splash} />
        <Route path="/history" component={QueryHistory} />
        <Route path="/lucene" component={LuceneQuery} />
        <Route path="/gremlin" component={GremlinQuery} />
        <Route path="/schema" component={SchemaExplorer} />
        <Route path="/info" component={ConnectionInfo} />
        <Route path="/orm" component={ORM} />
        <Route component={PageNotFound} />
    </Switch>;

export default Main;
