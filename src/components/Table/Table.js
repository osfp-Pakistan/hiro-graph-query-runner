import React from "react";
import isplainobject from "lodash.isplainobject";
import "./Table.css";
/**
 *  Show a table of OGIT data.
 *
 *  because it is ogit data, we want to perform some special
 *  manipulation on the internal fields to display the time/boolean
 *  first basic data.
 *
 *  also in order to handle gremlin (which can return anything...)
 *  we check for "ogit/_id" field in responses to see
 *  if they are "vertices", and assume that they are meta data if not.
 */

const Table = ({ rows = [], keys = [] }) => {
    // get the data in a good form
    //  rows =  [ [a,b,c], [a,b,c] ]
    // keys = ["1","2","3"]
    // rows might be an object with "meta" => any
    // we rowspan and JSON this.

    return (
        <table className="Table table table-hover table-bordered table-sm">
            <thead className="thead-inverse">
                <tr>
                    {keys.map(k => <th key={k}>{k}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => {
                    return (
                        <tr key={"r" + i}>
                            {Array.isArray(r)
                                ? r.map((v, ii) => {
                                      if (isplainobject(v) && "span" in v) {
                                          return (
                                              <td
                                                  key={"v" + ii}
                                                  colSpan={v.span}
                                              >
                                                  {v.content}
                                              </td>
                                          );
                                      }
                                      return <td key={"v" + ii}>{v}</td>;
                                  })
                                : <td colSpan={keys.length || 1}>
                                      {"meta" in r &&
                                          <code>
                                              {JSON.stringify(r.meta, null, 2)}
                                          </code>}
                                  </td>}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default Table;
