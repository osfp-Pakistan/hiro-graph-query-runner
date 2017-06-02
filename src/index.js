import React from "react";
import ReactDOM from "react-dom";
import { combineReducers, createStore, compose } from "redux";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css"; // for some reason an @import in the index.css didn't work...
import "./index.css";

import "./polyfills";

import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";
import { graphReducer, reduxEnhancer, setupOauth } from "./setup-graph";

/**
 *  Our reducers
 */
import { queryReducer } from "./reduction/query";

/**
 *  Here is where we add our custom reducers, the graphReducer is vital
 *  for correct functioning of the `hiro-graph-redux` middleware
 */
const reducers = combineReducers({ ...queryReducer, ...graphReducer });

/**
 *  We build our redux store now.
 */
const store = createStore(
    reducers,
    compose(
        reduxEnhancer,
        window.devToolsExtension ? window.devToolsExtension() : f => f
    )
);

/**
 *  Now we have created the store, we can setup the implicit oauth flow
 */
setupOauth(store);

if (window.parent === window) {
    // This check means we don't try to render the app in the popup window used for Auth.
    ReactDOM.render(
        <BrowserRouter>
            <Provider store={store}>
                <App />
            </Provider>
        </BrowserRouter>,
        document.getElementById("root")
    );
    registerServiceWorker();
}
