// ======================================================================
//
//       Approach v1 -- Tenserflow.js,Ml model,hiigh engage seen detection
//
// =======================================================================
// const express = require("express");
// const ytdl = require("ytdl-core");
// const ffmpeg = require("fluent-ffmpeg");
// const fs = require("fs");
// const path = require("path");
// const cors = require("cors");
// require("dotenv").config();
// const { analyzeFrames } = require("./aiAnalyzer.js");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const OUTPUT_DIR = path.join(__dirname, "output");
// if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// // sample test route
// app.get("/",(req,res)=>{
//     res.json({ message: "Everyting working fine"});
// })


// // Route to process video
// app.post("/generate-shorts", async (req, res) => {
//     try {
//         const { videoUrl, numShorts } = req.body;
//         if (!ytdl.validateURL(videoUrl)) return res.status(400).json({ error: "Invalid YouTube URL" });

//         const videoId = ytdl.getURLVideoID(videoUrl);
//         const videoPath = path.join(OUTPUT_DIR, `${videoId}.mp4`);
        
//         console.log("Downloading video...");
//         const videoStream = ytdl(videoUrl, { quality: "highestvideo" }).pipe(fs.createWriteStream(videoPath));

//         videoStream.on("finish", async () => {
//             console.log("Download complete. Analyzing...");
//             const keyScenes = await analyzeFrames(videoPath, numShorts);
//             console.log("Key scenes detected:", keyScenes);

//             const generatedShorts = [];
//             for (let i = 0; i < keyScenes.length; i++) {
//                 const startTime = keyScenes[i];
//                 const outputShort = path.join(OUTPUT_DIR, `short_${i + 1}.mp4`);
//                 await extractClip(videoPath, startTime, outputShort);
//                 generatedShorts.push(outputShort);
//             }

//             res.json({ message: "Shorts generated", shorts: generatedShorts });
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // Function to extract clip using FFmpeg
// const extractClip = (videoPath, startTime, outputShort) => {
//     return new Promise((resolve, reject) => {
//         ffmpeg(videoPath)
//             .setStartTime(startTime)
//             .setDuration(15) // 15-sec clip
//             .output(outputShort)
//             .on("end", () => resolve(outputShort))
//             .on("error", (err) => reject(err))
//             .run();
//     });
// };

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// =========================================================================
//
//    Approach V2 
//
//
//
// ==========================================================================










require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const { Whisper } = require('whisper-nodejs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.json({ message: "ShortReelX v2 is running properly" });
});

// Function to download YouTube video
async function downloadVideo(url) {
    if (!ytdl.validateURL(url)) throw new Error('Invalid YouTube URL');

    const videoId = uuidv4();
    const dirPath = `./videos/${videoId}`;
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const videoPath = `${dirPath}/original.mp4`;
    return new Promise((resolve, reject) => {
        ytdl(url, { quality: 'highest' })
            .pipe(fs.createWriteStream(videoPath))
            .on('finish', () => resolve({ videoId, videoPath }))
            .on('error', reject);
    });
}

// Extract audio from video
async function extractAudio(videoPath, videoId) {
    const audioPath = `./videos/${videoId}/audio.wav`;
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(audioPath)
            .audioCodec('pcm_s16le')
            .format('wav')
            .on('end', () => resolve(audioPath))
            .on('error', reject)
            .run();
    });
}

// Transcribe audio using Whisper
async function transcribeAudio(audioPath) {
    const whisper = new Whisper({ model: 'base.en' });
    const transcript = await whisper.transcribe(audioPath);
    return transcript;
}

// Analyze transcript with Gemini AI
async function analyzeTranscript(text, numShorts) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Analyze this video transcript and suggest ${numShorts} timestamps (in seconds) 
    for YouTube Shorts that would likely get high engagement. Follow these rules:
    1. Each clip must be 15-60 seconds long
    2. Identify the most dramatic/interesting moments
    3. Prefer segments with clear visual action
    4. Avoid slow-paced sections
    
    Return JSON format: { "clips": [{ "start": number, "end": number }] }
    
    Transcript: ${text}
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

// Generate Shorts from extracted clips
async function generateShort(videoPath, videoId, clip) {
    const shortPath = `./videos/${videoId}/short-${Date.now()}.mp4`;

    await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .setStartTime(clip.start)
            .setDuration(clip.end - clip.start)
            .videoFilters([
                { filter: 'scale', options: { w: 1080, h: 1920, force_original_aspect_ratio: 'decrease' } },
                { filter: 'pad', options: { w: 1080, h: 1920, x: '(ow-iw)/2', y: '(oh-ih)/2' } }
            ])
            .output(shortPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });

    return shortPath;
}

// API to generate Shorts
app.post('/generate-shorts', async (req, res) => {
    try {
        const { url, numShorts } = req.body;

        // 1. Download video
        const { videoId, videoPath } = await downloadVideo(url);

        // 2. Extract audio
        const audioPath = await extractAudio(videoPath, videoId);

        // 3. Transcribe audio
        const transcript = await transcribeAudio(audioPath);

        // 4. Analyze transcript
        const { clips } = await analyzeTranscript(transcript, numShorts);

        // 5. Generate Shorts
        const shortPaths = [];
        for (const clip of clips) {
            const path = await generateShort(videoPath, videoId, clip);
            shortPaths.push(path);
        }

        res.json({ videoId, shorts: shortPaths });
    } catch (error) {
        console.error("Error in /generate-shorts:", error);
        res.status(500).json({ error: error.message });
    }
});

// API to download video
app.post('/download', async (req, res) => {
    try {
        const { url } = req.body;
        const { videoId } = await downloadVideo(url);
        res.json({ videoId });
    } catch (error) {
        console.error("Error in /download:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
