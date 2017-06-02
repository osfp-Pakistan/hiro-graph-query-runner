import React, { Component } from "react";
import cuid from "cuid";
import { connect } from "react-redux";
import { getMyId } from "hiro-graph-redux";

import { actionAddQuery } from "../../reduction/query";
import { queryTaskAction } from "../../tasks/query";

import Result from "../Result";

/*
    Gremlin Query Runner

    Input should be split: Raw vs. Builder JS?
     - Raw is text field, with placholder key/value boxes

    Output:
        - tabulated data
*/

class GremlinQuery extends Component {
    state = {};

    runQuery = evt => {
        evt.preventDefault();
        const { boundAddQuery, boundRunQuery } = this.props;
        const id = cuid();
        boundAddQuery(id, this.rootInput.value, this.queryInput.value);
        boundRunQuery(id);
        this.setState({ id });
    };

    render() {
        const { id } = this.state;
        return (
            <div className="container-fluid">
                <p><strong>Improve this!</strong></p>
                <ul>
                    <li>Auto-Complete previous values</li>
                    <li>
                        Allow use of the
                        {" "}
                        <code>hiro-graph-gremlin</code>
                        {" "}
                        query builder to construct queries
                    </li>
                    <li>
                        Allow use of
                        {" "}
                        <code>hiro-graph-orm-mappings</code>
                        {" "}
                        to allow point-and-click query construction for defined relationships
                    </li>
                </ul>
                <div className="row">
                    <form
                        className="d-flex mb-2 w-100"
                        onSubmit={this.runQuery}
                    >
                        <input
                            type="text"
                            className="form-control form-control-lg mr-2 col-2"
                            placeholder="root vertex id"
                            ref={el => (this.rootInput = el)}
                            defaultValue={this.props.me}
                        />
                        <input
                            type="text"
                            className="form-control form-control-lg mr-2"
                            style={{ flexGrow: 1 }}
                            placeholder="enter gremlin query here"
                            ref={el => (this.queryInput = el)}
                            defaultValue={`outE("ogit/belongs");`}
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

const mstp = state => {
    return {
        me: getMyId(state)
    };
};

const mdtp = dispatch => {
    return {
        boundAddQuery: (id, rootId, query) =>
            dispatch(
                actionAddQuery({ type: "gremlin", id, args: [rootId, query] })
            ),
        boundRunQuery: id => dispatch(queryTaskAction(id))
    };
};

export default connect(mstp, mdtp)(GremlinQuery);
