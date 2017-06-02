import { createTask } from "hiro-graph-redux";

/**
 *  `createTask` is a convenience for async tasks.
 *
 *  This one checks for a query and performs the HIRO Graph API call
 *
 *  The first argument is the function that will be called. It gets an object
 *  as it's first arugment which is the `hiro-graph-orm` context with some extra properties
 *  for convenience, the context itself is added as `orm` so you can destrcture like this example.
 *  The rest of it's arugments are the arguments passed to the action creator.
 *
 *  The second argument is the "key function", used to create a unique key for each set of
 *  arguments. This stops the same task running more than once in parallel.
 */
const {
    action: queryTaskAction,
    selector: queryTaskSelector
} = createTask(({ orm, getState }, queryId) => {
    console.log(getState());
    const query = getState().queries[queryId];
    if (!query) {
        return Promise.reject(new Error("cannot find query: " + queryId));
    }
    const { type, args } = query;
    return orm.getConnection()[type](...args);
}, id => "q:" + id);

export { queryTaskAction, queryTaskSelector };
