export function parseUserQueryEval(raw) {
    return new Promise((resolve, reject) => {
        let parsedUserQuery;
        const userQuery = raw.trim();
        const len = userQuery.length;
        if (raw[0] === "{" && raw[len - 1] === "}") {
            try {
                // We know eval is bad. We try to use a worker if possible
                // eslint-disable-next-line no-eval
                eval("parsedUserQuery = " + userQuery);
            } catch (err) {
                reject(err);
            }
        }
        resolve(parsedUserQuery);
    });
}

const prepareUserQueryString = str => {
    const userQuery = str.trim();
    const len = userQuery.length;
    if (userQuery[0] === "{" && userQuery[len - 1] === "}") {
        return userQuery;
    }
    return null;
};

const workerStart = "var userQuery; try { userQuery = ";
const workerEnd =
    " } catch(err) { self.postMessage('@@ERROR@@ ' + err.message) } if (userQuery) { self.postMessage(userQuery) }";
const rError = /@@ERROR@@/;
let previousWorker;
let previousWorkerReject;

export const parseUserQueryWorker = str => {
    return new Promise((resolve, reject) => {
        const userQuery = prepareUserQueryString(str);
        if (userQuery) {
            if (previousWorkerReject) {
                previousWorkerReject(new Error("Interrupted"));
            }
            if (previousWorker) {
                previousWorker.terminate();
                previousWorker = null;
            }
            previousWorkerReject = reject;
            let code, url, worker;
            try {
                code = workerStart + str + workerEnd;
                url = URL.createObjectURL(
                    new Blob([code], { type: "text/javascript" })
                );
            } catch (err) {
                err._code = code;
                reject(err);
            }
            if (url) {
                worker = new Worker(url);
                worker.addEventListener("message", e => {
                    previousWorkerReject = null;
                    if (rError.test(e.data)) {
                        reject(e.data);
                    }
                    resolve(e.data);
                });
                worker.addEventListener("error", e => {
                    previousWorkerReject = null;
                    reject(e);
                });
                previousWorker = worker;
                setTimeout(() => {
                    worker.terminate();
                }, 5000);
            }
        } else {
            resolve();
        }
    });
};

export default function parseUserQuery(str) {
    if (typeof Worker !== "undefined") {
        return parseUserQueryWorker(str);
    }
    return parseUserQueryEval(str);
}
