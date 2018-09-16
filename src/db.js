const db = {
    sensors: {
        temperature: () => randomInt(10, 45)
    },
    actuators: {
        led: {
            r: 255,
            g: 100,
            b: 0
        },
        display: "random text"
    }
}

module.exports.db = db;

module.exports.db_actions = {
    setDisplayText,
}

function setDisplayText({text}) {
    db.actuators.display = text;
}

/* Utility function */
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}