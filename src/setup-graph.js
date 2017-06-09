/**
 *  Load our environment variables and configure the HIRO Graph pieces
 */
import mappings from "hiro-graph-orm-mappings";
import {
    createToken,
    graphReducer,
    createStoreEnhancer,
    implicitOauth
} from "hiro-graph-redux";

// Our app configuration
const clientId = process.env.REACT_APP_HIRO_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRET_URI;
const hiroGraphApi = process.env.REACT_APP_HIRO_GRAPH_API;
const hiroGraphAuthURL = process.env.REACT_APP_HIRO_GRAPH_AUTH_URL;
const hiroGraphLogoutURL = process.env.REACT_APP_HIRO_GRAPH_LOGOUT_URL;

/**
 * The orm needs to be hooked into the redux store via a storeEnhancer
 */
export const reduxEnhancer = createStoreEnhancer(
    {
        endpoint: hiroGraphApi,
        token: createToken()
    },
    mappings
);

/**
 *  This is just passed through, but it saves having to import it in the index.
 */
export { graphReducer };

/**
 *  This accepts the redux store, and wraps the oauth flow
 *  We use the default OAuth strategy (popup)
 */
export function setupOauth(store) {
    implicitOauth(
        {
            url: hiroGraphAuthURL,
            logoutUri: hiroGraphLogoutURL,
            clientId: clientId,
            redirectUri: redirectUri,
            store: store,
            dispatch: store.dispatch
        },
        "popup"
    );
}
