import React, { Component } from "react";
import "./SchemaExplorer.css";
import { Switch, Route } from "react-router-dom";
import { withRouter } from "react-router";
import cx from "classnames";
import mappings from "hiro-graph-orm-mappings";
import { Schema } from "hiro-graph-orm";

// NB these Symbols are useful here, but usually in your app you will *know everything* up front
// so they are not needed. mutating the data returned using them will lead to undefined behaviour.
import {
    $dangerouslyGetRelations,
    $dangerouslyGetDefinition
} from "hiro-graph-orm/lib/schema/entity";
// As above this is usually abstracted away from the user, but for the purposes of display, I show it here.
import { getRelationQuery } from "hiro-graph-orm/lib/context/relations";

import Message from "../Message";
import Table from "../Table";

//
// This was just a test entity I used to ensure that multi-hop and filtered relations were handled correctly.
//  Uncomment and see for yourself.
/*
mappings.push({
    name: "Foo",
    ogit: "ogit/Foo",
    required: {
        foo: {
            src: "ogit/foo",
            type: "bool"
        }
    },
    relations: {
        foobar: [
            {
                direction: "out",
                verb: "ogit/bar",
                vertices: "ogit/Bar",
                filter: { "ogit/is_foobar": "yes" }
            },
            "ogit/baz <- ogit/Baz"
        ]
    }
});
*/

// these are just the default mappings.
const schema = new Schema(mappings);

// this uses both definition and entitym because the entity has all the "compiled" information,
// but the definition has the type info, also we only want the "defined" properties, not the generic
// internal OGIT ones
const getPropInfo = (defs = {}, entity) => {
    return Object.keys(defs).map(key => {
        return {
            ...entity.prop(key),
            codec: typeof defs[key] === "string" ? "string" : defs[key].type
        };
    });
};

export const schemaData = schema.names.map(name => {
    const entity = schema.get(name);
    const def = entity[$dangerouslyGetDefinition]();
    const props = getPropInfo(def.required, entity).concat(
        getPropInfo(def.optional, entity)
    );
    const relations = entity[$dangerouslyGetRelations]();
    return {
        type: entity.name.toLowerCase(),
        name: (
            <span>{entity.name + " "}<small>{`(${entity.ogit})`}</small></span>
        ),
        key: entity.ogit,
        relations: Object.keys(relations).map(alias => {
            return {
                ...relations[alias],
                query: getRelationQuery(entity, alias).toString()
            };
        }),
        def,
        props
    };
});
const schemaMap = schemaData.reduce((obj, entry) => {
    obj[entry.type] = entry;
    return obj;
}, {});

export const schemaTypes = Object.keys(schemaMap).join("|");

export class SchemaDropdown extends Component {
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
        const {
            label = "Select a Schema",
            onClickItem,
            selected,
            className
        } = this.props;

        return (
            <div className={cx("dropdown", open && "show", className)}>
                <a
                    tabIndex="-1"
                    className="btn btn-secondary dropdown-toggle"
                    onFocus={this.open}
                    onBlur={this.handleBlur}
                >
                    {selected in schemaMap ? schemaMap[selected].name : label}
                </a>
                <div className="dropdown-menu">
                    {schemaData.map(item => {
                        const { name, key } = item;
                        return (
                            <button
                                key={key}
                                className="dropdown-item"
                                onClick={() => onClickItem(item)}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
}

// mapping types as router components?

class SchemaExplorer extends Component {
    state = {
        dropdownOpen: false
    };
    render() {
        const { history } = this.props;
        return (
            <div className="container-fluid">
                <div className="container">
                    <h2>Schema Explorer</h2>
                    <p>
                        These entities are defined with the default Schema
                        provided
                        by
                        {" "}
                        <a href="https://github.com/arago/hiro-graph-js/tree/master/packages/hiro-graph-orm-mappings">
                            <code>hiro-graph-orm-mappings</code>
                        </a>
                        .
                    </p>
                </div>
                <Switch>
                    <Route
                        path={`/schema/:entity(${schemaTypes})`}
                        component={SchemaEntity}
                    />
                    <Route
                        render={() => {
                            return (
                                <div className="container">
                                    <SchemaDropdown
                                        onClickItem={item =>
                                            history.push(
                                                `/schema/${item.type}`
                                            )}
                                    />
                                    <Message
                                        type="warning"
                                        title="Please pick a Schema Entity"
                                    />
                                </div>
                            );
                        }}
                    />
                </Switch>
            </div>
        );
    }
}

export default withRouter(SchemaExplorer);

const Required = () => <div style={{ textAlign: "center" }}>✔</div>;

const fieldRow = ({ src, dst, required, virtual, codec }) => {
    return [
        <code>{dst}</code>,
        <code>{src}</code>,
        <code>{codec}</code>,
        required ? <Required /> : "",
        virtual ? <Required /> : ""
    ];
};
const fieldKeys = [
    "Schema Field",
    "OGIT Ontology Field",
    "Type Coercion",
    "Required",
    "Virtual"
];

const relationKeys = [
    "Relation Alias",
    "Hop",
    "Direction",
    "Verb",
    "Vertices",
    "Filter"
];

class CodeView extends Component {
    state = {
        ready: false
    };

    componentDidMount() {
        import("brace").then(ace => {
            this.setState(
                {
                    ace
                },
                () => {
                    Promise.all([
                        import("brace/mode/javascript"),
                        import("brace/theme/chrome")
                    ]).then(() => {
                        const editor = ace.edit(this._ref);
                        this.editor = editor;
                        editor.getSession().setMode("ace/mode/javascript");
                        editor.setTheme("ace/theme/chrome");
                        editor.setOptions({
                            maxLines: Infinity,
                            readOnly: this.props.readOnly
                        });
                        this.setValue(this.props.value);
                    });
                    this.setState({ ready: true });
                }
            );
        });
    }

    componentWillUnmount() {
        clearTimeout(this._tid);
    }

    componentWillReceiveProps({ value }) {
        if (value !== this.props.value) {
            if (this.editor) {
                this.setValue(value);
            }
        }
    }

    setValue = value => {
        this.editor.setValue(value);
        this.editor.session.selection.setSelectionAnchor(1, 0);
        this.editor.moveCursorTo(1, 0);
    };

    render() {
        return (
            <div
                className={this.props.className}
                ref={ref => (this._ref = ref)}
            />
        );
    }
}

const SchemaEntity = ({ match, history }) => {
    const { props, relations, name, def, type } = schemaMap[
        match.params.entity
    ];
    const fieldRows = props.map(fieldRow);
    const relRows = [];
    relations.forEach(({ alias, hops, query }) => {
        const nHops = hops.length;
        hops.forEach(({ verb, direction, vertices, filter }, i) => {
            relRows.push([
                i === 0 &&
                    <code>
                        {alias}
                    </code>,
                `${i + 1} of ${nHops}`,
                <code>{direction}</code>,
                <code>{verb}</code>,
                vertices.map(v => <code key={v} className="mr-2">{v}</code>),
                filter ? <code>{JSON.stringify(filter)}</code> : "-"
            ]);
        });
        // get the gremlin query to find this relation
        relRows.push([
            false,
            {
                span: 5,
                content: (
                    <input
                        type="text"
                        value={query}
                        className="form-control"
                        onFocus={e => e.target.select()}
                        style={{ marginBottom: "24px" }}
                        readOnly
                    />
                )
            }
        ]);
    });

    return (
        <div className="container">
            <SchemaDropdown
                selected={type}
                onClickItem={item => history.push(`/schema/${item.type}`)}
            />
            <div className="SchemaEntity">
                <h2>{name}</h2>
                <p>
                    <code>
                        {type}.js
                    </code>
                </p>
                <CodeView
                    className="SchemaCodeView"
                    value={"export default " + JSON.stringify(def, null, 4)}
                    readOnly
                />
                <p> </p>
                <h4>Fields</h4>
                <p>
                    Each defined field in the mappping converts a field in the
                    ontology to a typed field in the schema.
                </p>
                <Table keys={fieldKeys} rows={fieldRows} />
                <h4>Relations</h4>
                <p>
                    The relation definitions in the mapping can be multi-hop and
                    the
                    can be filtered at each hop. The relevant gremlin queries
                    are generated to take all of this into account.
                </p>
                <Table keys={relationKeys} rows={relRows} />
            </div>
        </div>
    );
};
