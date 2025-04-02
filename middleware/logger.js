const fs = require("fs");
const path = require("path");
const moment = require("moment");

const logDirectory = path.join(__dirname, "../logs");

// Ensure logs directory exists sometimes in production not created 
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = (req, res, next) => {
    const start = Date.now(); 

    res.on("finish", () => {
        const duration = Date.now() - start;
        const logFile = path.join(logDirectory, `${moment().format("YYYY-MM-DD")}-logs.txt`);

        const logEntry = `[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${req.ip} - ${
            req.method
        } ${req.originalUrl} - ${res.statusCode} - ${duration}ms\n`;

        fs.appendFile(logFile, logEntry, (err) => {
            if (err) console.error("Error writing log:", err);
        });
    });

    next();
};

module.exports = logger;
