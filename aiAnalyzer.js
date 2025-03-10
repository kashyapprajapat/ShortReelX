const tf = require("@tensorflow/tfjs-node");
const mobilenet = require("@tensorflow-models/mobilenet");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

// Extract keyframes and analyze them
async function analyzeFrames(videoPath, numShorts) {
    const keyFrames = await extractFrames(videoPath);
    const model = await mobilenet.load();
    
    const scores = [];
    for (let frame of keyFrames) {
        const image = fs.readFileSync(frame);
        const tensor = tf.node.decodeImage(image);
        const prediction = await model.classify(tensor);
        const score = prediction.reduce((acc, p) => acc + p.probability, 0) / prediction.length;
        scores.push({ frame, score });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, numShorts).map((item) => parseFloat(path.basename(item.frame, ".jpg")));
}

// Extract frames from video
function extractFrames(videoPath) {
    return new Promise((resolve, reject) => {
        const framesDir = path.join(__dirname, "frames");
        if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

        const frameFiles = [];
        ffmpeg(videoPath)
            .on("filenames", (filenames) => {
                filenames.forEach((filename) => frameFiles.push(path.join(framesDir, filename)));
            })
            .on("end", () => resolve(frameFiles))
            .on("error", reject)
            .screenshots({ count: 10, folder: framesDir });
    });
}

module.exports = { analyzeFrames };
