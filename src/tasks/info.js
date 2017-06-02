import { createTask } from "hiro-graph-redux";

/**
 *  This one get the Graph Info
 */
const { action: infoAction, selector: infoTaskSelector } = createTask(orm => {
    return orm.getConnection().info();
});

export { infoAction, infoTaskSelector };
