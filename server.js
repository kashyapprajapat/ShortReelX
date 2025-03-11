const express = require("express");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const { analyzeFrames } = require("./aiAnalyzer.js");

const app = express();
app.use(cors());
app.use(express.json());

const OUTPUT_DIR = path.join(__dirname, "output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// sample test route
app.get("/",(req,res)=>{
    res.json({ message: "Everyting working fine"});
})


// Route to process video
app.post("/generate-shorts", async (req, res) => {
    try {
        const { videoUrl, numShorts } = req.body;
        if (!ytdl.validateURL(videoUrl)) return res.status(400).json({ error: "Invalid YouTube URL" });

        const videoId = ytdl.getURLVideoID(videoUrl);
        const videoPath = path.join(OUTPUT_DIR, `${videoId}.mp4`);
        
        console.log("Downloading video...");
        const videoStream = ytdl(videoUrl, { quality: "highestvideo" }).pipe(fs.createWriteStream(videoPath));

        videoStream.on("finish", async () => {
            console.log("Download complete. Analyzing...");
            const keyScenes = await analyzeFrames(videoPath, numShorts);
            console.log("Key scenes detected:", keyScenes);

            const generatedShorts = [];
            for (let i = 0; i < keyScenes.length; i++) {
                const startTime = keyScenes[i];
                const outputShort = path.join(OUTPUT_DIR, `short_${i + 1}.mp4`);
                await extractClip(videoPath, startTime, outputShort);
                generatedShorts.push(outputShort);
            }

            res.json({ message: "Shorts generated", shorts: generatedShorts });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Function to extract clip using FFmpeg
const extractClip = (videoPath, startTime, outputShort) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .setStartTime(startTime)
            .setDuration(15) // 15-sec clip
            .output(outputShort)
            .on("end", () => resolve(outputShort))
            .on("error", (err) => reject(err))
            .run();
    });
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
