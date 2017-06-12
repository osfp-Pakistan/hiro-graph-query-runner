import React, { Component } from "react";
import { NavLink, Switch, Route } from "react-router-dom";

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

const schemaData = schema.names.map(name => {
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
        props
    };
});
const schemaMap = schemaData.reduce((obj, entry) => {
    obj[entry.type] = entry;
    return obj;
}, {});

const schemaTypes = Object.keys(schemaMap).join("|");

// mapping types as router components?

class SchemaExplorer extends Component {
    render() {
        return (
            <div className="container-fluid">
                <p className="display-4">Schema Explorer</p>
                <p className="lead">
                    These entities are defined with the default Schema provided by
                    {" "}
                    <a href="https://github.com/arago/hiro-graph-js/packages/hiro-graph-orm-mappings">
                        <code>hiro-graph-orm-mappings</code>
                    </a>
                    .
                </p>
                <ul className="nav nav-tabs">
                    {schemaData.map(({ type, name, key }) => {
                        return (
                            <li className="nav-item" key={key}>
                                <NavLink
                                    activeClassName="active"
                                    className="nav-link text-center"
                                    to={`/schema/${type}`}
                                >
                                    {name}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
                <Switch>
                    <Route
                        path={`/schema/:entity(${schemaTypes})`}
                        component={SchemaEntity}
                    />
                    <Route
                        render={() => {
                            return (
                                <Message
                                    type="warning"
                                    title="Please pick a Schema Entity"
                                />
                            );
                        }}
                    />
                </Switch>
            </div>
        );
    }
}

export default SchemaExplorer;

const fieldRow = ({ src, dst, required, virtual, codec }) => {
    return [
        <code>{dst}</code>,
        <code>{src}</code>,
        <code>{codec}</code>,
        required ? "✔" : "✖",
        virtual ? "✔" : "✖"
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

const SchemaEntity = ({ match }) => {
    const { props, relations, name } = schemaMap[match.params.entity];
    console.log(relations);
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
                filter ? <code>{JSON.stringify(filter)}</code> : "✖"
            ]);
        });
        // get the gremlin query to find this relation
        relRows.push([
            false,
            {
                span: 5,
                content: <code>{query}</code>
            }
        ]);
    });

    return (
        <div>
            <p className="display-4">{name}</p>
            <h3>Fields</h3>
            <p className="lead">
                Each defined field in the mappping converts a field in the ontology to a typed field in the schema.
            </p>
            <Table keys={fieldKeys} rows={fieldRows} />

            <h3>Relations</h3>
            <p className="lead">
                The relation definitions in the mapping can be multi-hop and the can be filtered at each hop. The relevant gremlin queries
                are generated to take all of this into account.
            </p>
            <Table keys={relationKeys} rows={relRows} />
        </div>
    );
};
