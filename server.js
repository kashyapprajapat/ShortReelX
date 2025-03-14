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
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HfInference } = require("@huggingface/inference");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = './uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.json({ message: "ShortReelX v2 is running properly" });
});

// Extract audio from uploaded video
async function extractAudio(videoPath, videoId) {
    const audioPath = `./uploads/${videoId}/audio.wav`;
    if (!fs.existsSync(`./uploads/${videoId}`)) fs.mkdirSync(`./uploads/${videoId}`, { recursive: true });

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(audioPath)
            .audioCodec('pcm_s16le')
            .format('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('end', () => resolve(audioPath))
            .on('error', reject)
            .run();
    });
}

// Split audio into 30-second chunks
async function splitAudio(audioPath, chunkDir) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

        ffmpeg(audioPath)
            .output(`${chunkDir}/chunk_%03d.wav`)
            .format('wav')
            .audioCodec('pcm_s16le')
            .audioChannels(1)
            .audioFrequency(16000)
            .duration(30) // Ensure each chunk is max 30 seconds
            .on('end', () => {
                const chunks = fs.readdirSync(chunkDir).map(file => path.join(chunkDir, file));
                resolve(chunks);
            })
            .on('error', reject)
            .run();
    });
}

// Transcribe audio using Hugging Face Whisper Model (Handles Large Files)
async function transcribeAudio(audioPath) {
    const videoId = path.basename(audioPath, '.wav');
    const chunkDir = `./uploads/${videoId}/chunks`;

    const chunks = await splitAudio(audioPath, chunkDir);
    let fullTranscript = "";

    for (const chunk of chunks) {
        const audioBuffer = fs.readFileSync(chunk);
        const response = await hf.automaticSpeechRecognition({
            model: "openai/whisper-large", // Using Large Model
            data: audioBuffer,
            parameters: { return_timestamps: true } // Avoids error
        });

        fullTranscript += response.text + " ";
    }

    return fullTranscript.trim();
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
    const shortPath = `./uploads/${videoId}/short-${Date.now()}.mp4`;

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

// API to upload and process video
app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
        
        const videoPath = req.file.path;
        const videoId = req.file.filename.split('-')[0];

        // Extract audio
        const audioPath = await extractAudio(videoPath, videoId);

        // Transcribe audio
        const transcript = await transcribeAudio(audioPath);

        res.json({ videoId, transcript });
    } catch (error) {
        console.error("Error in /upload:", error);
        res.status(500).json({ error: error.message });
    }
});

// API to generate Shorts from uploaded video
app.post('/generate-shorts', async (req, res) => {
    try {
        const { videoId, numShorts } = req.body;
        const uploadDir = './uploads';

        // Find the video file by videoId
        const files = fs.readdirSync(uploadDir);
        const videoFile = files.find(file => 
            file.startsWith(`${videoId}-`) && 
            file.endsWith('.mp4')
        );

        if (!videoFile) throw new Error('Video not found');
        const videoPath = path.join(uploadDir, videoFile);

        // Extract audio (existing code)
        const audioPath = await extractAudio(videoPath, videoId);

        // Transcribe audio (existing code)
        const transcript = await transcribeAudio(audioPath);

        // Analyze transcript (existing code)
        const { clips } = await analyzeTranscript(transcript, numShorts);

        // Generate Shorts (existing code)
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

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
