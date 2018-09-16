const { db, db_actions } = require('./db');

// Handler
module.exports = function handler(ws, data) {
    try {
        const json = JSON.parse(data);
        const messageType = json.messageType;
        if (!messageType) throw Error(`Invalid message type ${messageType}`);
        const action = ACTIONS[messageType];
        if (!action) throw Error("Invalid action");
        handleRequest(ws, json);
    } catch(e) {
        // [Fix] Handle error properly
        ws.json({
            error: "Invalid request",
            message: e.message
        });
    }
}

function handleRequest(ws, req) {
    const { messageType } = req;
    const action = ACTIONS[messageType];
    if (typeof action === 'function') {
        action(ws, req);
    }
}

// Request actions
function setProperty(ws, req) {
    const { data } = req;
    const res = {};
    for (const key of Object.keys(data)) {
        db.actuators[key] = data[key];
        res[key] = data[key];
    }
    propertyStatus(ws, res);
}

function requestAction(ws, req) {
    const { data } = req;
    const res = {};
    for (const key of Object.keys(data)) {
        let timeRequested = new Date();
        let action = db_actions[key];
        let args = data[key];
        if (typeof action === 'function') {
            action(args);
            res[key] = {
                status: 'completed',
                timeRequested,
                timeCompleted: new Date()
            }
        }
    }
    actionStatus(ws, res);
}

function addEventSubscription(ws, req) {
    const { data } = req;
    const intervals = [];
    Object.keys(data).forEach(key => {
        const value = db.sensors[key];
        if (typeof value === 'function') {
            const it = setInterval(() => {
                event(ws, {
                    [key]: value(),
                    timestamp: new Date()
                });
                // ws.json({
                //     value: value()
                // });
            }, 2000);
            intervals.push(it);
        }
    });
    ws.on('close', () => {
        intervals.forEach(clearInterval);
    });
}

// Response actions
function propertyStatus(ws, data) {
    ws.json({
        messageType: "propertyStatus",
        data
    });
}

function actionStatus(ws, data) {
    ws.json({
        messageType: "actionStatus",
        data
    });
}

function event(ws, data) {
    ws.json({
        messageType: "event",
        data
    });
}

const ACTIONS = {
    "setProperty": setProperty,
    "requestAction": requestAction,
    "addEventSubscription": addEventSubscription 
}