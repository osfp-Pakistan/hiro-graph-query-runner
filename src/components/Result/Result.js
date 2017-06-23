import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { whenTask } from "hiro-graph-redux";

import { queryTaskSelector } from "../../tasks/query.js";
import Loader from "../Loader";
import Table from "../Table";

export class ResultTable extends PureComponent {
    render() {
        const { id, queryTask } = this.props;
        return whenTask(queryTask, {
            loading: () => <Loader title="running query..." />,
            error: err => <pre><code>{err.message}</code></pre>,
            ok: results => {
                if (!Array.isArray(results)) {
                    results = [results];
                }
                let keys, rows;
                if (results.length) {
                    [keys, rows] = preprocess(results);
                }
                return (
                    <div>
                        <ResultDescription {...queryTask} />
                        {results.length && <Table keys={keys} rows={rows} />}
                    </div>
                );
            }
        });
    }
}

export const ResultDescription = ({ result, start, finish }) => {
    if (!(result && start && finish)) {
        return null;
    }
    return (
        <pre>
            {`got ${result.length} result${result.length === 1
                ? ""
                : "s"} in ${finish - start}ms`}
        </pre>
    );
};

const mstp = (state, { id }) => {
    return {
        queryTask: queryTaskSelector(state, id)
    };
};

export default connect(mstp)(ResultTable);

/**
 *  Extract the keys from each row into the keys array then sort each
 *  row data into an array of the values.
 *
 *  except if it isn't a vertex, then we simply put it in as "meta"
 */
function preprocess(data) {
    //extract the keys
    const keySet = new Set();
    data.forEach(v => {
        if ("ogit/_id" in v || "_id" in v) {
            //it is a vertex extract the keys
            Object.keys(v).forEach(k => keySet.add(k));
        }
    });
    // now sort the keys
    const keys = Array.from(keySet).sort(ogitKeySort);
    //now map each row of data into either an array in key order (with blanks)
    // or a meta row
    const rows = data.map(v => {
        if ("ogit/_id" in v || "_id" in v) {
            return keys.map(formatField(v));
        } else {
            return { meta: v };
        }
    });
    if (keys.length === 0) {
        keys.push(<code>no fields, meta-data only</code>);
    }
    return [keys, rows];
}

// puts ogit/_id first, then all other internal keys, then ogit/* keys, then free
function ogitKeySort(a, b) {
    if (a === b) {
        return 0;
    }
    const aType = getKeyType(a);
    const bType = getKeyType(b);
    if (aType === bType) {
        return a > b; //simple lexical
    }
    // return whichever type is first.
    return aType - bType;
}

const KEY_ID = 0;
const KEY_INTERNAL = 1;
const KEY_OGIT = 2;
const KEY_FREE = 3;

function getKeyType(key) {
    if (key === "ogit/_id" || key === "_id") {
        return KEY_ID;
    }
    if (!/^ogit\//.test(key)) {
        return KEY_FREE;
    }
    // if it is ogit/_* then it is internal
    return key[5] === "_" ? KEY_INTERNAL : KEY_OGIT;
}

// some of these are strings, some integers
const hammerTimeFields = new Set([
    "ogit/_created-on",
    "ogit/_modified-on",
    "ogit/_deleted-on",
    "ogit/creationTime",
    "ogit/modificationTime",
    "ogit/timestamp",
    "_fetched",
    "_created-on",
    "_modified-on",
    "/CTIME",
    "/MTIME",
    "/ETIME",
    "/Timestamp"
]);

const booleanFields = new Set(["ogit/_is-deleted"]);

// work out how to display a field
function formatField(vtx) {
    return key => {
        switch (true) {
            case key in vtx === false:
                return "";
            case hammerTimeFields.has(key):
                const date = new Date(parseInt(vtx[key], 10));
                return (
                    <time dateTime={date.toISOString()}>
                        {date.toLocaleString()}
                    </time>
                );
            case booleanFields.has(key):
                return <code>{vtx.key ? "true" : "false"}</code>;
            default:
                // other wise it is just a string.
                // but we will coerce anyway.
                return (
                    "" +
                    JSON.stringify(vtx[key]).replace(/^"/, "").replace(/"$/, "")
                );
        }
    };
}
