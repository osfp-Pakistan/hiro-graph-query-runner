import React, { Component } from "react";
import { connect } from "react-redux";
import { getTokenState, whenTask, getMyId } from "hiro-graph-redux";

import { infoAction, infoTaskSelector } from "../../tasks/info";

import Table from "../Table";
import Message from "../Message";
import Loader from "../Loader";

const staticData = [
    ["HIRO Graph Endpoint", process.env.REACT_APP_HIRO_GRAPH_API],
    ["HIRO Graph Authorization URL", process.env.REACT_APP_HIRO_GRAPH_AUTH_URL],
    ["OAuth Client Id", process.env.REACT_APP_HIRO_CLIENT_ID]
];

const keys = ["Property", "Value"];

// reference data at https://graph.graphit.co/info
/*
{
  "logoutUrl": "",
  "organization": "graphit.co",
  "server-short": "akc",
  "geScope": "",
  "server-dashed": "arago-knowledge-core",
  "sessionUtilUrl": "",
  "externalAuthEnabled": true,
  "server": "arago Knowledge Core",
  "externalAuthUrl": "https://sso.graphit.co/oauth2/authorize",
  "ontology": {
    "root": "ogit/Node",
    "digest": "46d3abff975eb960231ec001497c3bf49569b511902f9dc47f08d0be38f3f3d6",
    "type": "ogitontology",
    "version": "2.19.0.90"
  },
  "geClientId": "LfYiwZlHbqGzWT7Y_yqucNe1J20a",
  "version": "v1.55.0-484-g0143078"
}

*/
const appendUsefulInfo = (rows, info) => {
    if ("server" in info) {
        rows.push(["HIRO Graph Server Name", info.server]);
    }
    if ("version" in info) {
        rows.push(["HIRO Graph Version", info.version]);
    }
    if ("ontology" in info && info.ontology && "version" in info.ontology) {
        rows.push(["Ontology Version", info.ontology.version]);
    }
    if ("organization" in info) {
        rows.push(["Organization", info.organization]);
    }
    return rows;
};

const calcExpiry = hammertime => {
    const d = new Date(hammertime);
    return (
        <span>
            <span>{d.toLocaleString() + " (in "}</span>
            <TimeLeft until={hammertime} />
            <span>)</span>
        </span>
    );
};

class TimeLeft extends Component {
    // just needs to tick...
    state = { now: Date.now() };

    componentDidMount() {
        this._mounted = true;
        this.tick();
    }
    componentWillUnmount() {
        this._mounted = false;
        this.stop();
    }
    tick() {
        this._tick = setInterval(
            () => this._mounted && this.setState({ now: Date.now() }),
            1000
        );
    }
    stop() {
        clearInterval(this._tick);
    }
    render() {
        const { until } = this.props;
        const secondsLeft = Math.floor((until - this.state.now) / 1e3);
        if (secondsLeft < 60) {
            return <span>{secondsLeft + "s"}</span>;
        }
        const mins = Math.floor(secondsLeft / 60);
        return <span>{`${mins}m ${secondsLeft % 60}s`}</span>;
    }
}

class ConnectionInfo extends Component {
    componentDidMount() {
        whenTask(this.props.infoTask, {
            pre: () => {
                // it hasn't loaded yet, do it automatically.
                this.props.boundFetchInfo();
            }
        });
    }

    render() {
        const { tokenInfo, infoTask, me } = this.props;
        const data = staticData.slice();
        let isLoading = false;
        let currentError = false;
        whenTask(infoTask, {
            loading: () => (isLoading = true),
            error: err => (currentError = err),
            ok: results => appendUsefulInfo(data, results)
        });
        if (tokenInfo) {
            data.push(["Access Token", tokenInfo.accessToken]);
            if ("expiry" in tokenInfo.meta) {
                data.push([
                    "Access Token Expiry",
                    calcExpiry(tokenInfo.meta.expiry)
                ]);
            }
            if (me) {
                data.push(["Access Token Owner", me]);
            }
        }

        return (
            <div>
                <p className="display-4">Connection Info</p>
                <Table
                    keys={keys}
                    rows={data.map(([k, v]) => [k, <code>{v}</code>])}
                />
                {isLoading && <Loader title="Loading more info..." />}
                {currentError &&
                    <Message type="danger" title="Failed to load info">
                        <p>
                            <button
                                type="button"
                                className="btn btn-info btn-xl"
                                onClick={this.props.boundFetchInfo}
                            >
                                Reload Info
                            </button>
                        </p>
                        <p>The error was:</p>
                        <p><code>{currentError.message}</code></p>
                    </Message>}
            </div>
        );
    }
}

const mstp = state => {
    return {
        me: getMyId(state),
        infoTask: infoTaskSelector(state),
        tokenInfo: getTokenState(state)
    };
};

const mdtp = dispatch => {
    return {
        boundFetchInfo: () => dispatch(infoAction())
    };
};

export default connect(mstp, mdtp)(ConnectionInfo);
