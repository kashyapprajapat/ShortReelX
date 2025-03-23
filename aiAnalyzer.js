const tf = require("@tensorflow/tfjs-node");
const mobilenet = require("@tensorflow-models/mobilenet");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Extract keyframes and analyze them
async function analyzeFrames(videoPath, numShorts, frameCount = 10) {
    const keyFrames = await extractFrames(videoPath, frameCount);
    const model = await mobilenet.load();

    const scores = await Promise.all(
        keyFrames.map(async (frame) => {
            try {
                const processedFrame = await preprocessImage(frame);
                const tensor = tf.node.decodeImage(processedFrame);
                const prediction = await model.classify(tensor);
                const score = prediction.reduce((acc, p) => acc + p.probability, 0) / prediction.length;
                return { frame, score };
            } catch (error) {
                console.error(`Error processing ${frame}:`, error);
                return null;
            }
        })
    );

    const validScores = scores.filter(Boolean);
    validScores.sort((a, b) => b.score - a.score);
    return validScores.slice(0, numShorts).map((item) => parseFloat(path.basename(item.frame, ".jpg")));
}

// Extract frames from video
function extractFrames(videoPath, frameCount) {
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
            .screenshots({ count: frameCount, folder: framesDir });
    });
}


async function preprocessImage(imagePath) {
    return sharp(imagePath).resize(224, 224).toBuffer();
}

module.exports = { analyzeFrames };
