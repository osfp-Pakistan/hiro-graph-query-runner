import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Redirect } from "react-router-dom";
import cx from "classnames";
import { createTask, whenTask } from "hiro-graph-redux";

import parseUserQuery from "../../utils/parse-user-query";
import { SchemaDropdown, schemaData, schemaTypes } from "../SchemaExplorer";
import { ResultTable, ResultDescription } from "../Result";
import Message from "../Message";
import { parse } from "querystring";

import "./ORM.css";

const queryKeywords = ["$and", "$or", "$search", "$not", "$range", "$missing"];

class QueryRunnerResults extends Component {
    state = {
        view: "table"
    };

    setView = view => {
        this.setState({
            view
        });
    };

    render() {
        const { task } = this.props;
        const { view } = this.state;
        return whenTask(task, {
            pre: () => null,
            loading: () => null,
            error: err => <pre>{err.stack}</pre>,
            ok: items =>
                <div className="QueryRunnerResults">
                    <div className="container">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a
                                    className={cx(
                                        "nav-link",
                                        view === "table" && "active"
                                    )}
                                    onClick={() => this.setView("table")}
                                >
                                    Table
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={cx(
                                        "nav-link",
                                        view === "json" && "active"
                                    )}
                                    onClick={() => this.setView("json")}
                                >
                                    JSON
                                </a>
                            </li>
                        </ul>
                    </div>
                    {view === "json" &&
                        <div className="container">
                            <ResultDescription {...task} />
                            <pre>
                                <code>{JSON.stringify(items, null, 4)}</code>
                            </pre>
                        </div>}
                    {view === "table" && <ResultTable queryTask={task} />}

                </div>
        });
    }
}

class BaseQueryRunner extends Component {
    handleClickExec = () => {
        const { query, method, type, options, triggerQuery } = this.props;
        triggerQuery({
            type,
            method,
            query,
            options
        });
    };

    render() {
        const { task, query } = this.props;
        let status = "Ready";
        let loading = whenTask(task, { loading: () => true });
        if (!query) {
            status = "Awaiting query";
        }
        if (loading) {
            status = "Fetching...";
        }
        return (
            <div className="QueryRunner">
                <div className="container">
                    <div className="toolbar QueryRunner-toolbar">
                        <pre className="QueryRunner-status">
                            <small>{status}</small>
                        </pre>
                        <button
                            className="exec-query btn btn-success"
                            disabled={!query}
                            onClick={query && this.handleClickExec}
                        >
                            run!
                        </button>
                    </div>
                </div>
                <QueryRunnerResults task={task} />
            </div>
        );
    }
}

const {
    action: customQueryAction,
    selector: customQueryTaskSelector
} = createTask(({ orm }, { method, type, query, options = {} }) => {
    return method === "search"
        ? orm[type].search(query, {}, { ...options, plain: true })
        : orm[type][method](query, { ...options, plain: true });
}, () => "CUSTOM");

const mstp = (state, props) => {
    return {
        task: customQueryTaskSelector(state)
    };
};

const mdtp = dispatch => {
    return {
        triggerQuery: payload => dispatch(customQueryAction(payload))
    };
};

const QueryRunner = connect(mstp, mdtp)(BaseQueryRunner);

const strBeginsWith = (str, prefix) => {
    const p = prefix.toLowerCase();
    return str.toLowerCase().substr(0, p.length) === p;
};

const strContains = (str, prefix) => {
    const p = prefix.toLowerCase();
    return str.toLowerCase().indexOf(p) > -1;
};

class CodeEditor extends Component {
    state = {
        ready: false,
        ace: undefined
    };

    handleChange = () => {
        const value = this.editor
            .getValue()
            .replace(this.props.prefix + "(", "")
            .replace(/\)$/, "")
            .trim();

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    };

    getDefaultValue = (
        prefix = this.props.prefix,
        method = this.props.method
    ) => {
        let bl, br;
        switch (method) {
            case "search":
            case "findById":
                bl = "(";
                br = ")";
                break;
            case "find":
            case "findOne":
            default:
                bl = "({";
                br = "})";
        }
        return [prefix + bl, "    ", br];
    };

    setDefaultValue = prefix => {
        this.setValue(this.getDefaultValue(prefix).join("\n"));
    };

    setValue = (value, defaultCursor = true) => {
        const { row, column } = this.editor.selection.getCursor();
        this.editor.setValue(value);
        // Initial setup
        if (defaultCursor) {
            this.editor.moveCursorTo(1, 0);
            this.editor.navigateLineEnd();
        } else {
            // Restore cursor hack.
            this.editor.session.selection.setSelectionAnchor(row, column);
            this.editor.moveCursorTo(row, column);
        }
    };

    componentWillUnmount() {
        if (this.editor) {
            this.editor.destroy();
        }
    }
    componentWillReceiveProps({ prefix, method }) {
        if (prefix !== this.props.prefix || method !== this.props.method) {
            const currDefaultValue = this.getDefaultValue(
                this.props.prefix,
                this.props.method
            );
            const currFirstLine = currDefaultValue[0];
            const currLastLine = currDefaultValue[currDefaultValue.length - 1];
            const nextDefaultValue = this.getDefaultValue(prefix, method);
            const nextFirstLine = nextDefaultValue[0];
            const nextLastLine = nextDefaultValue[nextDefaultValue.length - 1];
            let nextVal = this.editor
                .getValue()
                .replace(currFirstLine, nextFirstLine);
            if (nextLastLine !== nextFirstLine) {
                nextVal =
                    nextVal.substring(0, nextVal.length - currLastLine.length) +
                    nextLastLine;
            }
            setImmediate(() => {
                this.setValue(nextVal, false);
                this.editor.focus();
            });
        }
    }

    componentDidMount() {
        import("brace").then(ace => {
            this.setState(
                {
                    ace
                },
                () => {
                    Promise.all([
                        import("brace/mode/javascript"),
                        import("brace/theme/chrome"),
                        import("brace/ext/language_tools")
                    ]).then(() => {
                        const langTools = ace.acequire(
                            "ace/ext/language_tools"
                        );
                        const schemaCompleter = {
                            getCompletions: (
                                editor,
                                session,
                                pos,
                                prefix,
                                callback
                            ) => {
                                let keywords = [];
                                let words = [];
                                let matches = [];
                                queryKeywords.forEach(keyword => {
                                    if (strContains(keyword, prefix)) {
                                        keywords.push({
                                            name: keyword + ":",
                                            value: keyword,
                                            meta: "keyword"
                                        });
                                    }
                                });
                                const schema = this.props.schema;
                                const schemaDataFiltered = [
                                    schema,
                                    ...schemaData.filter(
                                        item => item !== schema
                                    )
                                ];
                                schemaDataFiltered.forEach(schema => {
                                    schema.props.forEach(prop => {
                                        if (strBeginsWith(prop.dst, prefix)) {
                                            words.push({
                                                name: prop.dst + ":",
                                                value: prop.dst,
                                                meta: `${prop.src} (${schema.def
                                                    .name}) [${prop.codec}]`
                                            });
                                        } else if (
                                            strContains(prop.dst, prefix)
                                        ) {
                                            matches.push({
                                                name: prop.dst + ":",
                                                value: prop.dst,
                                                meta: `${prop.src} (${schema.def
                                                    .name}) [${prop.codec}]`
                                            });
                                        }
                                    });
                                });
                                callback(null, [
                                    ...keywords,
                                    ...words,
                                    ...matches
                                ]);
                            }
                        };
                        langTools.setCompleters([schemaCompleter]);
                        const editor = ace.edit(this._ref);
                        this.editor = editor;
                        editor.getSession().setMode("ace/mode/javascript");
                        editor.setTheme("ace/theme/chrome");
                        editor.setOptions({
                            maxLines: Infinity,
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true
                        });
                        editor.on("change", this.handleChange);
                        this.setDefaultValue(this.props.prefix);
                        editor.focus();
                        editor.commands.on("exec", e => {
                            const isBackspace = e.command.name === "backspace";
                            const isInsertString =
                                e.command.name === "insertstring";
                            const {
                                row,
                                column
                            } = editor.selection.getCursor();
                            const readOnlySections = this.getDefaultValue();
                            const firstRow = readOnlySections[0];
                            const totalRows = editor.session.getLength();
                            const isFirstRow = row === 0;
                            const isLastRow = row + 1 === totalRows;
                            if (
                                (isBackspace &&
                                    isFirstRow &&
                                    column <= firstRow.length) ||
                                (isInsertString &&
                                    isFirstRow &&
                                    column < firstRow.length)
                            ) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                            if (isLastRow && (isBackspace || isInsertString)) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });
                        this.setState({ ready: true });
                    });
                }
            );
        });
    }

    render() {
        return (
            <div className="CodeEditor-container">
                <div className="CodeEditor" ref={ref => (this._ref = ref)} />
            </div>
        );
    }
}

const Options = ({ options, onChange }) =>
    <div className="Options container">
        <small>Options</small>
        {Object.keys(options).map(option =>
            <div key={option} className="form-control">
                <label>
                    <code>{option}{" "}</code>
                    <input
                        type="checkbox"
                        checked={options[option]}
                        onChange={() =>
                            onChange({
                                ...options,
                                [option]: !options[option]
                            })}
                    />
                </label>
            </div>
        )}
    </div>;

const createOrmPrefix = (selected, method) =>
    `orm.${selected.def.name}.${method}`;

const methods = ["find", "findOne", "findById", "search"];

export class MethodsDropdown extends Component {
    state = {
        open: false
    };

    open = () => {
        this.setState({ open: true });
    };

    close = () => {
        this.setState({ open: false });
    };

    handleBlur = () => {
        this.tid = setTimeout(this.close, 300);
    };

    componentWillUnmount() {
        clearTimeout(this.tid);
    }

    render() {
        const { open } = this.state;
        const { label, onClickItem, selected, className } = this.props;

        return (
            <div className={cx("dropdown", open && "show", className)}>
                <a
                    tabIndex="-1"
                    className="btn btn-secondary dropdown-toggle"
                    onFocus={this.open}
                    onBlur={this.handleBlur}
                >
                    {selected ? <code>{selected}()</code> : label}
                </a>
                <div className="dropdown-menu">
                    {methods.map(method => {
                        return (
                            <button
                                key={method}
                                className="dropdown-item"
                                onClick={() => onClickItem(method)}
                            >
                                <code>{method}()</code>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
}

const ORM = () => {
    return (
        <div className="container-fluid">
            <div className="container">
                <div className="toolbar">
                    <h2>ORM Explorer:</h2>
                </div>
            </div>
            <Switch>
                <Route
                    path={`/orm/:entity(${schemaTypes})`}
                    component={Explorer}
                />
                <Route
                    exact
                    path="/orm"
                    render={() => <Redirect to="/orm/person?method=find" />}
                />
                }
            </Switch>
        </div>
    );
};

export default ORM;

const getMethodFromQuerystring = str => parse(str.replace(/^\?/, "")).method;

class Explorer extends Component {
    state = {
        query: undefined,
        options: {
            raw: false
        },
        method: "find"
    };

    handleQueryChange = value => {
        parseUserQuery(value).then(
            v => {
                this.setState({ query: v });
            },
            err => {
                console.error(err);
                this.setState({ query: undefined });
            }
        );
    };

    handleOptionsChange = options => {
        this.setState({
            options
        });
    };

    render() {
        const { match, location, history } = this.props;
        const { query, options } = this.state;
        const method = getMethodFromQuerystring(location.search);
        const entity = schemaData.filter(
            v => v.type === match.params.entity
        )[0];
        return (
            <div>
                <div className="container">
                    <div className="OrmPrimaryOptions">
                        <div className="OrmPrimaryOption">
                            <label>Type:</label>
                            <SchemaDropdown
                                className="dropdown-menu-right"
                                selected={match.params.entity}
                                onClickItem={item =>
                                    history.push({
                                        pathname: "/orm/" + item.type,
                                        search: location.search
                                    })}
                            />
                        </div>
                        <div className="OrmPrimaryOption">
                            <label>Method:</label>
                            <MethodsDropdown
                                className="dropdown-menu-right"
                                selected={method}
                                onClickItem={m =>
                                    history.push({
                                        pathname: location.pathname,
                                        search: "?method=" + m
                                    })}
                            />
                        </div>
                    </div>
                    {entity &&
                        <CodeEditor
                            schema={entity}
                            prefix={createOrmPrefix(entity, method)}
                            method={method}
                            onChange={this.handleQueryChange}
                        />}
                </div>
                <Options
                    onChange={this.handleOptionsChange}
                    options={options}
                />
                {entity &&
                    <QueryRunner
                        type={entity.def.name}
                        schema={entity}
                        query={query}
                        method={method}
                        options={options}
                    />}
            </div>
        );
    }
}
