import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Loader from "../Loader";
import Header from "../Header";
import Message from "../Message";
import Main from "../Main";
import "./App.css";

import {
    loginTaskSelector,
    doLogin,
    doLogout,
    whenTask,
    getMyId
} from "hiro-graph-redux";

const App = ({ login, me, boundLogin, boundLogout }) => (
    <div className="App">
        <Header me={me} logout={boundLogout} />
        <div className="App-main container-fluid">
            {whenTask(login, {
                ok: () => <Main />,
                loading: () => <Loader title="logging in...." />,
                pre: () => (
                    <Message type="warning" title="You are not logged in">
                        <button
                            type="button"
                            className="btn btn-xl btn-warning"
                            onClick={boundLogin}
                        >
                            Login
                        </button>
                    </Message>
                ),
                error: ({ message }) => (
                    <Message type="danger" title="Oops, something went wrong">
                        <p>There was a problem with your login.</p>
                        <p>
                            Please refresh and try again:
                        </p>
                        <p>
                            <button
                                type="button"
                                className="btn btn-info btn-xl"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </button>
                        </p>
                        <p>The error was:</p>
                        <p><code>{message}</code></p>
                    </Message>
                )
            })}
        </div>
    </div>
);

const mstp = state => {
    return {
        login: loginTaskSelector(state),
        me: getMyId(state)
    };
};

const mdtp = dispatch => {
    return {
        boundLogin: () => dispatch(doLogin()),
        boundLogout: () => dispatch(doLogout())
    };
};

export default withRouter(connect(mstp, mdtp)(App));
