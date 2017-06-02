import React from "react";
import { connect } from "react-redux";

import { selectQueryHistory } from "../../reduction/query";
import Table from "../Table";

const historyKeys = ["id", "type", "query"];

const QueryHistory = ({ history = [] }) => {
    return (
        <div>
            <p className="display-4">Query History</p>
            <p><strong> Improve this!</strong></p>
            <ul>
                <li>
                    Make rows clickable to link to correct page to show query/results
                </li>
                <li>
                    Create links to direct HIRO Graph API call URLs / show websocket payloads
                </li>
                <li>
                    Persist the query history in
                    {" "}
                    <code>localStorage</code>
                    {" "}
                    to allow it to persist across page loads
                </li>
            </ul>
            {history.length
                ? <Table rows={history.map(toRow)} keys={historyKeys} />
                : <p className="display-4 text-center">no queries run yet</p>}
        </div>
    );
};

function toRow(h) {
    if (h.type === "gremlin") {
        return [
            h.id,
            h.type,
            <span>
                root=<code>h.args[0]</code>, query=<code>{h.args[1]}</code>
            </span>
        ];
    }
    return [h.id, h.type, <code>{h.args[0]}</code>];
}

const mstp = state => {
    return {
        history: selectQueryHistory(state)
    };
};

export default connect(mstp)(QueryHistory);
