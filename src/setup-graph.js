/**
 *  Load our environment variables and configure the HIRO Graph pieces
 */
import { Connection } from "hiro-graph-client";
import { Context, Schema } from "hiro-graph-orm";
import mappings from "hiro-graph-orm-mappings";
import {
    createToken,
    graphReducer,
    storeEnhancer,
    implicitOauth
} from "hiro-graph-redux";
import popupStrategy from "hiro-graph-implicit-oauth/lib/popup";

// Our app configuration
const clientId = process.env.REACT_APP_HIRO_CLIENT_ID;
const rediectUri = process.env.REACT_APP_REDIRET_URI;
const hiroGraphApi = process.env.REACT_APP_HIRO_GRAPH_API;
const hiroGraphAuthURL = process.env.REACT_APP_HIRO_GRAPH_AUTH_URL;
const hiroGraphLogoutURL = process.env.REACT_APP_HIRO_GRAPH_LOGOUT_URL;

// setup the graph connection/oauth
const schema = new Schema(mappings);
const conn = new Connection({
    endpoint: hiroGraphApi,
    token: createToken()
});
//conn.debugRequests(true);
const ctx = new Context(conn, schema);

/**
 * This needs to be hooked into the redux store
 */
export const reduxEnhancer = storeEnhancer(ctx);

/**
 *  This is just passed through, but it saves having to import it in the index.
 */
export { graphReducer };

/**
 *  This accepts the redux store, and wraps the oauth flow
 */
export function setupOauth(store) {
    implicitOauth(
        {
            url: hiroGraphAuthURL,
            logoutUri: hiroGraphLogoutURL,
            clientId: clientId,
            redirectUri: rediectUri,
            store: store,
            dispatch: store.dispatch
        },
        popupStrategy
    );
}
