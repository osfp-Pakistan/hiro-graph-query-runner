import { createSelector } from "reselect";

// Our Redux Action Names
const QUERY_ADD = "QUERY_ADD";
const QUERY_REMOVE = "QUERY_REMOVE";

const initialState = {};

const omit = (o, k) =>
    Object.keys(o).reduce((oo, kk) => {
        if (kk !== k) {
            oo[kk] = o[k];
        }
        return oo;
    }, {});

// here is the reducer for our queries
export const queryReducer = {
    queries: (state = initialState, { type, payload }) => {
        switch (type) {
            case QUERY_ADD:
                return { ...state, [payload.id]: payload };
            case QUERY_REMOVE:
                return omit(state, payload.id);
            default:
                return state;
        }
    }
};

// simple action creators
export const actionAddQuery = ({ type, args, id }) => {
    return { type: QUERY_ADD, payload: { type, args, id } };
};

export const actionRemoveQuery = id => {
    return { type: QUERY_REMOVE, payload: { id } };
};

// and here are the selectors for these data

// this one uses reselect to memoize so we don't have to
// Object.keys().map() every time if nothing has changed
export const selectQueryHistory = createSelector(
    state => state.queries,
    queries => Object.keys(queries).map(k => queries[k])
);

export const selectQueryById = (state, id) => state.queries[id];
