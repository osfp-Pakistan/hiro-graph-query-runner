import { createTask } from "hiro-graph-redux";

/**
 *  This one get the Graph Info
 */
const { action: infoAction, selector: infoTaskSelector } = createTask(orm => {
    return orm.getClient().info();
});

export { infoAction, infoTaskSelector };
