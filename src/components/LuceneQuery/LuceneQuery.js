import React, { Component } from "react";
import cuid from "cuid";
import { connect } from "react-redux";

import { actionAddQuery } from "../../reduction/query";
import { queryTaskAction } from "../../tasks/query";

import Result from "../Result";

//import selectQuery
/*
    Lucene Query Runner

    Input should be split: Raw vs. JSON (our syntax)
     - Raw is text field, with placholder key/value boxes
     - JSON is guided and has raw output

    Seperately:
        limit, offset boxes
        order field

    Output:
        - tabulated data
*/

class LuceneQuery extends Component {
    state = {};

    runQuery = evt => {
        evt.preventDefault();
        const { boundAddQuery, boundRunQuery } = this.props;
        const query = slashIt(this.input.value);
        const id = cuid();
        boundAddQuery(id, query);
        boundRunQuery(id);
        this.setState({ id });
    };

    render() {
        const { id } = this.state;
        return (
            <div className="container-fluid">
                <p className="display-4">Lucene Query</p>
                <p><strong>Improve this!</strong></p>
                <ul>
                    <li>Auto-Complete previous values</li>
                    <li>
                        Remember if we have run the same query before and prompt to re-run if wanted, or show old result.
                    </li>
                    <li>
                        Allow use of
                        {" "}
                        <code>hiro-graph-lucene</code>
                        {" "}
                        package to allow construction of queries in the
                        {" "}
                        <em>object notation</em>
                    </li>
                </ul>
                <div>
                    <form className="d-flex mb-2" onSubmit={this.runQuery}>
                        <input
                            type="text"
                            className="form-control form-control-lg mr-2"
                            placeholder="enter lucene query here"
                            ref={el => (this.input = el)}
                            defaultValue={`+ogit/_type:"ogit/Person"`}
                        />
                        <button
                            type="submit"
                            className="btn btn-success btn-lg"
                        >
                            run!
                        </button>
                    </form>
                </div>
                <div>
                    {id && <Result id={id} />}
                </div>
            </div>
        );
    }
}

const mdtp = dispatch => {
    return {
        boundAddQuery: (id, query) =>
            dispatch(actionAddQuery({ type: "lucene", id, args: [query] })),
        boundRunQuery: id => dispatch(queryTaskAction(id))
    };
};

export default connect(undefined, mdtp)(LuceneQuery);

function slashIt(query) {
    // unfortunately, the API require forwardslashes are escaped.
    // but we should have to write our queries that way.
    // but people will, so we make it "just work"
    // lets replace not backslash + forwardslash with the escaped version.
    return query.replace(/(^|[^\\])\//g, (_, p) => p + "\\/");
}
