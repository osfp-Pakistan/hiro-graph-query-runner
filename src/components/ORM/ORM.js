import React, { Component } from "react";
import { createTask, whenTask } from "hiro-graph-redux";
import { SchemaDropdown, schemaData } from "../SchemaExplorer";
import { ResultTable } from "../Result";
import { connect } from "react-redux";
import mappings from "hiro-graph-orm-mappings";
import "./ORM.css";
import parseUserQuery from "../../utils/parse-user-query";
import cx from "classnames";

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
        const { query, type, triggerQuery } = this.props;
        triggerQuery({
            type,
            query
        });
    };

    render() {
        const { task, query, schema } = this.props;
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
} = createTask(({ orm }, { type, query, options = {} }) => {
    return orm[type].find(query, { ...options, plain: true });
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
            .replace(/\)$/, "");

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    };

    getDefaultValue = (prefix = this.props.prefix) => {
        return [prefix + "({", "    ", "})"];
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.prefix !== this.props.prefix) {
            const currFirstLine = this.getDefaultValue(this.props.prefix)[0];
            const nextFirstLine = this.getDefaultValue(nextProps.prefix)[0];
            const nextVal = this.editor
                .getValue()
                .replace(currFirstLine, nextFirstLine);
            setImmediate(() => {
                this.setValue(nextVal, false);
                this.editor.focus();
            });
        }
    }

    componentDidMount() {
        console.log(schemaData);
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
                                                    .name})`
                                            });
                                        } else if (
                                            strContains(prop.dst, prefix)
                                        ) {
                                            matches.push({
                                                name: prop.dst + ":",
                                                value: prop.dst,
                                                meta: `${prop.src} (${schema.def
                                                    .name})`
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
                            const lastRow =
                                readOnlySections[readOnlySections.length - 1];
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

const createOrmPrefix = selected => `orm.${selected.def.name}.find`;

export default class ORM extends Component {
    state = {
        query: undefined,
        selected: undefined
    };

    handleQueryChange = value => {
        console.log(value);
        parseUserQuery(value).then(
            v => {
                console.log(v);
                this.setState({ query: v });
            },
            err => {
                console.error(err);
                this.setState({ query: undefined });
            }
        );
    };

    handleSelectSchema = item => {
        this.setState({
            selected: item
        });
    };

    render() {
        const { query, selected } = this.state;
        return (
            <div className="container-fluid">
                <div className="container">
                    <div className="toolbar">
                        <h2>ORM Explorer:</h2>
                        <SchemaDropdown
                            className="dropdown-menu-right"
                            label="Select A Schema!"
                            selected={selected}
                            onClickItem={this.handleSelectSchema}
                        />
                    </div>
                    {selected &&
                        <CodeEditor
                            schema={selected}
                            prefix={createOrmPrefix(selected)}
                            onChange={this.handleQueryChange}
                        />}
                </div>
                {selected &&
                    <QueryRunner
                        type={selected.def.name}
                        schema={selected}
                        query={query}
                    />}
            </div>
        );
    }
}
