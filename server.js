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
//
//                            Approach V2 
//
//
// ==========================================================================


// require('dotenv').config();
// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs');
// const ffmpeg = require('fluent-ffmpeg');
// const { v4: uuidv4 } = require('uuid');
// const path = require('path');
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { HfInference } = require("@huggingface/inference");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadPath = './uploads';
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
//         cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${uuidv4()}-${file.originalname}`);
//     }
// });

// const upload = multer({ storage: storage });

// // Home 🏠 Route 
// app.get('/', (req, res) => {
//     const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>ShortReelX v2</title>
//         <style>
//             body {
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                 line-height: 1.6;
//                 margin: 0;
//                 padding: 20px;
//                 background-color: #f0f2f5;
//                 display: flex;
//                 flex-direction: column;
//                 align-items: center;
//                 min-height: 100vh;
//             }

//             .container {
//                 max-width: 800px;
//                 background: white;
//                 padding: 2rem;
//                 border-radius: 12px;
//                 box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//                 margin: 20px;
//             }

//             h1 {
//                 color: #1a73e8;
//                 text-align: center;
//                 margin-bottom: 1.5rem;
//             }

//             .description {
//                 font-size: 1.1rem;
//                 color: #444;
//                 margin-bottom: 2rem;
//                 text-align: center;
//             }

//             .routes-section {
//                 margin-top: 2rem;
//             }

//             .route {
//                 background: #f8f9fa;
//                 padding: 1.5rem;
//                 border-radius: 8px;
//                 margin-bottom: 1.5rem;
//             }

//             .route h2 {
//                 color: #1a73e8;
//                 margin-top: 0;
//                 font-size: 1.2rem;
//             }

//             .route ul {
//                 list-style-type: none;
//                 padding-left: 0;
//             }

//             .route li {
//                 margin-bottom: 0.5rem;
//                 color: #666;
//             }

//             .method {
//                 display: inline-block;
//                 background: #1a73e8;
//                 color: white;
//                 padding: 0.2rem 0.5rem;
//                 border-radius: 4px;
//                 font-size: 0.9rem;
//                 margin-right: 0.5rem;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <h1>🎥 ShortReelX v2</h1>
            
//             <div class="description">
//                 <p>An AI-powered tool that transforms long videos into engaging YouTube Shorts, Instagram Reels, 
//                 and other social media clips with maximum impact and virality.</p>
//             </div>

//             <div class="routes-section">
//                 <div class="route">
//                     <h2><span class="method">POST</span> /upload</h2>
//                     <ul>
//                         <li><strong>Purpose:</strong> Upload and process video</li>
//                         <li><strong>Request Body:</strong> Multipart form with 'video' file</li>
//                         <li><strong>Response:</strong> { videoId: string, transcript: string }</li>
//                     </ul>
//                 </div>

//                 <div class="route">
//                     <h2><span class="method">POST</span> /generate-shorts</h2>
//                     <ul>
//                         <li><strong>Purpose:</strong> Generate short clips from uploaded video</li>
//                         <li><strong>Request Body:</strong> { videoId: string, numShorts: number }</li>
//                         <li><strong>Response:</strong> { videoId: string, shorts: string[] }</li>
//                     </ul>
//                 </div>
                
//                 <div class="route">
//                     <h2><span class="method">POST</span> /getexcitingthumbnails</h2>
//                     <ul>
//                         <li><strong>Purpose:</strong> Generate engaging thumbnails from video</li>
//                         <li><strong>Request Body:</strong> Multipart form with 'video' file and 'numThumbnails' field (1-3)</li>
//                         <li><strong>Process:</strong> AI analyzes video content to find visually compelling moments</li>
//                         <li><strong>Enhanced Features:</strong> Applies brightness, contrast, and sharpening for eye-catching results</li>
//                         <li><strong>Response:</strong> { 
//                             videoId: string, 
//                             thumbnails: [{ 
//                                 path: string, 
//                                 timestamp: number, 
//                                 description: string 
//                             }] 
//                         }</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;

//     res.send(htmlContent);
// });


// // Extract audio from uploaded video
// async function extractAudio(videoPath, videoId) {
//     const audioPath = `./uploads/${videoId}/audio.wav`;
//     if (!fs.existsSync(`./uploads/${videoId}`)) fs.mkdirSync(`./uploads/${videoId}`, { recursive: true });

//     return new Promise((resolve, reject) => {
//         ffmpeg(videoPath)
//             .output(audioPath)
//             .audioCodec('pcm_s16le')
//             .format('wav')
//             .audioChannels(1)
//             .audioFrequency(16000)
//             .on('end', () => resolve(audioPath))
//             .on('error', reject)
//             .run();
//     });
// }

// // Split audio into 30-second chunks
// async function splitAudio(audioPath, chunkDir) {
//     return new Promise((resolve, reject) => {
//         if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

//         ffmpeg(audioPath)
//             .output(`${chunkDir}/chunk_%03d.wav`)
//             .format('wav')
//             .audioCodec('pcm_s16le')
//             .audioChannels(1)
//             .audioFrequency(16000)
//             .duration(30)
//             .on('end', () => {
//                 const chunks = fs.readdirSync(chunkDir).map(file => path.join(chunkDir, file));
//                 resolve(chunks);
//             })
//             .on('error', reject)
//             .run();
//     });
// }

// // Transcribe audio using Hugging Face Whisper Model
// async function transcribeAudio(audioPath) {
//     const videoId = path.basename(audioPath, '.wav');
//     const chunkDir = `./uploads/${videoId}/chunks`;

//     const chunks = await splitAudio(audioPath, chunkDir);
//     let fullTranscript = "";

//     for (const chunk of chunks) {
//         const audioBuffer = fs.readFileSync(chunk);
//         const response = await hf.automaticSpeechRecognition({
//             model: "openai/whisper-large",
//             data: audioBuffer,
//             parameters: { return_timestamps: true }
//         });

//         fullTranscript += response.text + " ";
//     }

//     return fullTranscript.trim();
// }

// // Analyze transcript with Gemini AI (Fixed JSON parsing)
// async function analyzeTranscript(text, numShorts) {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const prompt = `
//     Analyze this video transcript and suggest ${numShorts} timestamps (in seconds) 
//     for YouTube Shorts that would likely get high engagement. Follow these rules:
//     1. Each clip must be 15-60 seconds long
//     2. Identify the most dramatic/interesting moments
//     3. Prefer segments with clear visual action
//     4. Avoid slow-paced sections
    
//     Return ONLY VALID JSON without any markdown formatting:
//     { "clips": [{ "start": number, "end": number }] }
    
//     Transcript: ${text}
//     `;

//     try {
//         const result = await model.generateContent(prompt);
//         const responseText = await result.response.text();
        
//         // Clean the response
//         const cleanedResponse = responseText
//             .replace(/```json/g, '')
//             .replace(/```/g, '')
//             .trim();

//         return JSON.parse(cleanedResponse);
//     } catch (error) {
//         console.error('Error parsing Gemini response:', error);
//         throw new Error('Failed to parse AI response');
//     }
// }

// // Generate Shorts from extracted clips
// async function generateShort(videoPath, videoId, clip) {
//     const shortPath = `./uploads/${videoId}/short-${Date.now()}.mp4`;

//     await new Promise((resolve, reject) => {
//         ffmpeg(videoPath)
//             .setStartTime(clip.start)
//             .setDuration(clip.end - clip.start)
//             .videoFilters([
//                 { filter: 'scale', options: { w: 1080, h: 1920, force_original_aspect_ratio: 'decrease' } },
//                 { filter: 'pad', options: { w: 1080, h: 1920, x: '(ow-iw)/2', y: '(oh-ih)/2' } }
//             ])
//             .output(shortPath)
//             .on('end', resolve)
//             .on('error', reject)
//             .run();
//     });

//     return shortPath;
// }

// // Find exciting thumbnail timestamps from video
// async function findExcitingThumbnailTimestamps(videoPath, transcript, numThumbnails) {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
//     // Get video duration
//     const videoDuration = await getVideoDuration(videoPath);
    
//     const prompt = `
//     Analyze this video transcript and suggest ${numThumbnails} timestamps (in seconds) 
//     for eye-catching thumbnails that would attract viewers. Follow these rules:
//     1. Choose moments with high visual appeal or action
//     2. Select diverse moments across the video's duration
//     3. Prefer moments with interesting subjects/faces if applicable
//     4. Avoid text-heavy or visually boring scenes
//     5. Timestamps must be between 0 and ${Math.floor(videoDuration)} seconds
    
//     Return ONLY VALID JSON without any markdown formatting:
//     { "thumbnails": [{ "timestamp": number, "description": "brief description of why this moment is visually interesting" }] }
    
//     Transcript: ${transcript}
//     `;

//     try {
//         const result = await model.generateContent(prompt);
//         const responseText = await result.response.text();
        
//         // Clean the response
//         const cleanedResponse = responseText
//             .replace(/```json/g, '')
//             .replace(/```/g, '')
//             .trim();

//         return JSON.parse(cleanedResponse);
//     } catch (error) {
//         console.error('Error parsing Gemini response for thumbnails:', error);
//         // Fallback to evenly spaced thumbnails if AI fails
//         const thumbnails = [];
//         for (let i = 0; i < numThumbnails; i++) {
//             const timestamp = Math.floor((videoDuration / (numThumbnails + 1)) * (i + 1));
//             thumbnails.push({
//                 timestamp,
//                 description: `Auto-generated thumbnail ${i+1}`
//             });
//         }
//         return { thumbnails };
//     }
// }

// // Get video duration using ffmpeg
// function getVideoDuration(videoPath) {
//     return new Promise((resolve, reject) => {
//         ffmpeg.ffprobe(videoPath, (err, metadata) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(metadata.format.duration);
//         });
//     });
// }

// // Extract thumbnail from video at specific timestamp
// async function extractThumbnail(videoPath, timestamp, outputPath) {
//     return new Promise((resolve, reject) => {
//         ffmpeg(videoPath)
//             .screenshots({
//                 timestamps: [timestamp],
//                 filename: path.basename(outputPath),
//                 folder: path.dirname(outputPath),
//                 size: '1280x720'
//             })
//             .on('end', () => resolve(outputPath))
//             .on('error', reject);
//     });
// }

// // Enhance thumbnail with filters
// async function enhanceThumbnail(inputPath, outputPath) {
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputPath)
//             .videoFilters([
//                 // Improve brightness, contrast and saturation for eye-catching thumbnails
//                 { filter: 'eq', options: { brightness: '0.05', contrast: '1.2', saturation: '1.3' } },
//                 // Light sharpening
//                 { filter: 'unsharp', options: { luma_msize_x: 5, luma_msize_y: 5, luma_amount: 1.0 } }
//             ])
//             .output(outputPath)
//             .on('end', () => {
//                 // Remove the original unenhanced thumbnail
//                 fs.unlinkSync(inputPath);
//                 resolve(outputPath);
//             })
//             .on('error', reject)
//             .run();
//     });
// }

// // API endpoints
// app.post('/upload', upload.single('video'), async (req, res) => {
//     try {
//         if (!req.file) throw new Error('No file uploaded');
        
//         const videoPath = req.file.path;
//         const videoId = req.file.filename.split('-')[0];

//         const audioPath = await extractAudio(videoPath, videoId);
//         const transcript = await transcribeAudio(audioPath);

//         res.json({ videoId, transcript });
//     } catch (error) {
//         console.error("Error in /upload:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// app.post('/generate-shorts', async (req, res) => {
//     try {
//         const { videoId, numShorts } = req.body;
//         const uploadDir = './uploads';

//         const files = fs.readdirSync(uploadDir);
//         const videoFile = files.find(file => 
//             file.startsWith(`${videoId}-`) && 
//             file.endsWith('.mp4')
//         );

//         if (!videoFile) throw new Error('Video not found');
//         const videoPath = path.join(uploadDir, videoFile);

        
//         const audioPath = await extractAudio(videoPath, videoId);
//         const transcript = await transcribeAudio(audioPath);
//         const { clips } = await analyzeTranscript(transcript, numShorts);

//         const shortPaths = [];
//         for (const clip of clips) {
//             const path = await generateShort(videoPath, videoId, clip);
//             shortPaths.push(path);
//         }

//         res.json({ videoId, shorts: shortPaths });
//     } catch (error) {
//         console.error("Error in /generate-shorts:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // New route for generating exciting thumbnails
// app.post('/getexcitingthumbnails', upload.single('video'), async (req, res) => {
//     try {
//         if (!req.file) throw new Error('No video file uploaded');
        
//         // Get number of thumbnails (default to 1, max 3)
//         const numThumbnails = Math.min(
//             Math.max(parseInt(req.body.numThumbnails) || 1, 1), 
//             3
//         );
        
//         const videoPath = req.file.path;
//         const videoId = req.file.filename.split('-')[0];
        
//         // Create directory for thumbnails if it doesn't exist
//         const thumbnailDir = `./uploads/${videoId}/thumbnails`;
//         if (!fs.existsSync(thumbnailDir)) {
//             fs.mkdirSync(thumbnailDir, { recursive: true });
//         }
        
//         // Extract audio and generate transcript to help AI pick good moments
//         const audioPath = await extractAudio(videoPath, videoId);
//         const transcript = await transcribeAudio(audioPath);
        
//         // Find exciting timestamps for thumbnails
//         const { thumbnails } = await findExcitingThumbnailTimestamps(
//             videoPath, 
//             transcript, 
//             numThumbnails
//         );
        
//         // Extract and enhance thumbnails
//         const thumbnailPaths = [];
//         for (let i = 0; i < thumbnails.length; i++) {
//             const timestamp = thumbnails[i].timestamp;
//             const description = thumbnails[i].description;
            
//             // Extract raw thumbnail
//             const rawPath = path.join(thumbnailDir, `raw-thumb-${i+1}.jpg`);
//             await extractThumbnail(videoPath, timestamp, rawPath);
            
//             // Enhance the thumbnail
//             const enhancedPath = path.join(thumbnailDir, `thumbnail-${i+1}.jpg`);
//             await enhanceThumbnail(rawPath, enhancedPath);
            
//             thumbnailPaths.push({
//                 path: enhancedPath,
//                 timestamp: timestamp,
//                 description: description
//             });
//         }
        
//         res.json({ 
//             videoId, 
//             thumbnails: thumbnailPaths
//         });
//     } catch (error) {
//         console.error("Error in /getexcitingthumbnails:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// const PORT = process.env.PORT || 7777;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//=============================================================================
//
//
//             Clodinary 
//
//
// ===============================================================================

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
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const axios = require('axios');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Set up multer for memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create temp directory for processing
const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), 'shortreel-' + uuidv4());
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `shortreel/${folder}`, 
        public_id: filename,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload file to Cloudinary
const uploadFileToCloudinary = (filePath, folder, filename) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { 
        folder: `shortreel/${folder}`, 
        public_id: filename,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        // Clean up local file after upload
        fs.unlinkSync(filePath);
        resolve(result);
      }
    );
  });
};

// Download file from Cloudinary
const downloadFromCloudinary = async (url, localPath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(localPath));
    writer.on('error', reject);
  });
};

// Home 🏠 Route remains the same
app.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ShortReelX v2</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f0f2f5;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
            }

            .container {
                max-width: 800px;
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 20px;
            }

            h1 {
                color: #1a73e8;
                text-align: center;
                margin-bottom: 1.5rem;
            }

            .description {
                font-size: 1.1rem;
                color: #444;
                margin-bottom: 2rem;
                text-align: center;
            }

            .routes-section {
                margin-top: 2rem;
            }

            .route {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
            }

            .route h2 {
                color: #1a73e8;
                margin-top: 0;
                font-size: 1.2rem;
            }

            .route ul {
                list-style-type: none;
                padding-left: 0;
            }

            .route li {
                margin-bottom: 0.5rem;
                color: #666;
            }

            .method {
                display: inline-block;
                background: #1a73e8;
                color: white;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-size: 0.9rem;
                margin-right: 0.5rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎥 ShortReelX v2</h1>
            
            <div class="description">
                <p>An AI-powered tool that transforms long videos into engaging YouTube Shorts, Instagram Reels, 
                and other social media clips with maximum impact and virality.</p>
            </div>

            <div class="routes-section">
                <div class="route">
                    <h2><span class="method">POST</span> /upload</h2>
                    <ul>
                        <li><strong>Purpose:</strong> Upload and process video</li>
                        <li><strong>Request Body:</strong> Multipart form with 'video' file</li>
                        <li><strong>Response:</strong> { videoId: string, transcript: string }</li>
                    </ul>
                </div>

                <div class="route">
                    <h2><span class="method">POST</span> /generate-shorts</h2>
                    <ul>
                        <li><strong>Purpose:</strong> Generate short clips from uploaded video</li>
                        <li><strong>Request Body:</strong> { videoId: string, numShorts: number }</li>
                        <li><strong>Response:</strong> { videoId: string, shorts: string[] }</li>
                    </ul>
                </div>
                
                <div class="route">
                    <h2><span class="method">POST</span> /getexcitingthumbnails</h2>
                    <ul>
                        <li><strong>Purpose:</strong> Generate engaging thumbnails from video</li>
                        <li><strong>Request Body:</strong> Multipart form with 'video' file and 'numThumbnails' field (1-3)</li>
                        <li><strong>Process:</strong> AI analyzes video content to find visually compelling moments</li>
                        <li><strong>Enhanced Features:</strong> Applies brightness, contrast, and sharpening for eye-catching results</li>
                        <li><strong>Response:</strong> { 
                            videoId: string, 
                            thumbnails: [{ 
                                url: string, 
                                timestamp: number, 
                                description: string 
                            }] 
                        }</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(htmlContent);
});

// Extract audio from uploaded video - Modified to use temp files and Cloudinary
async function extractAudio(videoPath, videoId, tempDir) {
    const audioPath = path.join(tempDir, 'audio.wav');

    await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(audioPath)
            .audioCodec('pcm_s16le')
            .format('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('end', () => resolve())
            .on('error', reject)
            .run();
    });

    // Upload to Cloudinary
    const result = await uploadFileToCloudinary(audioPath, videoId, 'audio');
    return { localPath: audioPath, cloudinaryUrl: result.secure_url };
}

// Split audio into 30-second chunks - Modified to use temp files and Cloudinary
async function splitAudio(audioPath, videoId, tempDir) {
    const chunkDir = path.join(tempDir, 'chunks');
    if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ffmpeg(audioPath)
            .output(`${chunkDir}/chunk_%03d.wav`)
            .format('wav')
            .audioCodec('pcm_s16le')
            .audioChannels(1)
            .audioFrequency(16000)
            .duration(30)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });

    const chunkFiles = fs.readdirSync(chunkDir).map(file => path.join(chunkDir, file));
    
    // Upload all chunks to Cloudinary
    const chunkUrls = [];
    for (let i = 0; i < chunkFiles.length; i++) {
        const result = await uploadFileToCloudinary(
            chunkFiles[i], 
            `${videoId}/chunks`, 
            `chunk_${i.toString().padStart(3, '0')}`
        );
        chunkUrls.push(result.secure_url);
    }

    return { localPaths: chunkFiles, cloudinaryUrls: chunkUrls };
}

// Transcribe audio using Hugging Face Whisper Model
async function transcribeAudio(audioPath, videoId, tempDir) {
    const chunks = await splitAudio(audioPath, videoId, tempDir);
    let fullTranscript = "";

    for (const chunk of chunks.localPaths) {
        const audioBuffer = fs.readFileSync(chunk);
        const response = await hf.automaticSpeechRecognition({
            model: "openai/whisper-large",
            data: audioBuffer,
            parameters: { return_timestamps: true }
        });

        fullTranscript += response.text + " ";
    }

    // Save transcript to Cloudinary as a text file
    const transcriptPath = path.join(tempDir, 'transcript.txt');
    fs.writeFileSync(transcriptPath, fullTranscript);
    await uploadFileToCloudinary(transcriptPath, videoId, 'transcript');

    return fullTranscript.trim();
}

// Analyze transcript with Gemini AI (remains the same)
async function analyzeTranscript(text, numShorts) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Analyze this video transcript and suggest ${numShorts} timestamps (in seconds) 
    for YouTube Shorts that would likely get high engagement. Follow these rules:
    1. Each clip must be 15-60 seconds long
    2. Identify the most dramatic/interesting moments
    3. Prefer segments with clear visual action
    4. Avoid slow-paced sections
    
    Return ONLY VALID JSON without any markdown formatting:
    { "clips": [{ "start": number, "end": number }] }
    
    Transcript: ${text}
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Clean the response
        const cleanedResponse = responseText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        throw new Error('Failed to parse AI response');
    }
}

// Generate Shorts from extracted clips - Modified to use Cloudinary
async function generateShort(videoPath, videoId, clip, tempDir) {
    const shortName = `short-${Date.now()}.mp4`;
    const shortPath = path.join(tempDir, shortName);

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

    // Upload to Cloudinary
    const result = await uploadFileToCloudinary(shortPath, `${videoId}/shorts`, shortName.split('.')[0]);
    return result.secure_url;
}

// Find exciting thumbnail timestamps from video (remains the same)
async function findExcitingThumbnailTimestamps(videoPath, transcript, numThumbnails) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Get video duration
    const videoDuration = await getVideoDuration(videoPath);
    
    const prompt = `
    Analyze this video transcript and suggest ${numThumbnails} timestamps (in seconds) 
    for eye-catching thumbnails that would attract viewers. Follow these rules:
    1. Choose moments with high visual appeal or action
    2. Select diverse moments across the video's duration
    3. Prefer moments with interesting subjects/faces if applicable
    4. Avoid text-heavy or visually boring scenes
    5. Timestamps must be between 0 and ${Math.floor(videoDuration)} seconds
    
    Return ONLY VALID JSON without any markdown formatting:
    { "thumbnails": [{ "timestamp": number, "description": "brief description of why this moment is visually interesting" }] }
    
    Transcript: ${transcript}
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Clean the response
        const cleanedResponse = responseText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Error parsing Gemini response for thumbnails:', error);
        // Fallback to evenly spaced thumbnails if AI fails
        const thumbnails = [];
        for (let i = 0; i < numThumbnails; i++) {
            const timestamp = Math.floor((videoDuration / (numThumbnails + 1)) * (i + 1));
            thumbnails.push({
                timestamp,
                description: `Auto-generated thumbnail ${i+1}`
            });
        }
        return { thumbnails };
    }
}

// Get video duration using ffmpeg
function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(metadata.format.duration);
        });
    });
}

// Extract thumbnail from video at specific timestamp - Modified to use Cloudinary
async function extractThumbnail(videoPath, timestamp, videoId, tempDir, index) {
    const rawFilename = `raw-thumb-${index}.jpg`;
    const rawPath = path.join(tempDir, rawFilename);

    await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [timestamp],
                filename: rawFilename,
                folder: tempDir,
                size: '1280x720'
            })
            .on('end', () => resolve())
            .on('error', reject);
    });

    return rawPath;
}

// Enhance thumbnail with filters - Modified to use Cloudinary
async function enhanceThumbnail(inputPath, videoId, index, tempDir) {
    const enhancedFilename = `thumbnail-${index}.jpg`;
    const enhancedPath = path.join(tempDir, enhancedFilename);

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoFilters([
                // Improve brightness, contrast and saturation for eye-catching thumbnails
                { filter: 'eq', options: { brightness: '0.05', contrast: '1.2', saturation: '1.3' } },
                // Light sharpening
                { filter: 'unsharp', options: { luma_msize_x: 5, luma_msize_y: 5, luma_amount: 1.0 } }
            ])
            .output(enhancedPath)
            .on('end', () => {
                // Remove the original unenhanced thumbnail
                fs.unlinkSync(inputPath);
                resolve();
            })
            .on('error', reject)
            .run();
    });

    // Upload to Cloudinary
    const result = await uploadFileToCloudinary(
        enhancedPath, 
        `${videoId}/thumbnails`, 
        enhancedFilename.split('.')[0]
    );

    return result.secure_url;
}

// Cleanup function to remove temporary files
async function cleanupTempFiles(tempDir) {
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

// API endpoints - Modified to use Cloudinary
app.post('/upload', upload.single('video'), async (req, res) => {
    const tempDir = getTempDir();
    try {
        if (!req.file) throw new Error('No file uploaded');
        
        const videoId = uuidv4();
        const videoBuffer = req.file.buffer;
        
        // Upload original video to Cloudinary
        const videoResult = await uploadToCloudinary(
            videoBuffer, 
            videoId, 
            'original_video'
        );
        
        // Save video temporarily for processing
        const tempVideoPath = path.join(tempDir, 'original_video.mp4');
        fs.writeFileSync(tempVideoPath, videoBuffer);
        
        // Extract audio and generate transcript
        const audio = await extractAudio(tempVideoPath, videoId, tempDir);
        const transcript = await transcribeAudio(audio.localPath, videoId, tempDir);

        // Cleanup temporary files
        await cleanupTempFiles(tempDir);
        
        res.json({ 
            videoId, 
            transcript,
            videoUrl: videoResult.secure_url
        });
    } catch (error) {
        console.error("Error in /upload:", error);
        await cleanupTempFiles(tempDir);
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate-shorts', async (req, res) => {
    const tempDir = getTempDir();
    try {
        const { videoId, numShorts, videoUrl } = req.body;
        
        if (!videoId || !videoUrl) {
            throw new Error('Video ID and URL are required');
        }
        
        // Download video from Cloudinary for processing
        const tempVideoPath = path.join(tempDir, 'video.mp4');
        await downloadFromCloudinary(videoUrl, tempVideoPath);
        
        // Create temp audio directory
        const audioTempDir = path.join(tempDir, 'audio');
        if (!fs.existsSync(audioTempDir)) {
            fs.mkdirSync(audioTempDir, { recursive: true });
        }
        
        // Extract audio and generate transcript
        const audio = await extractAudio(tempVideoPath, videoId, audioTempDir);
        const transcript = await transcribeAudio(audio.localPath, videoId, audioTempDir);
        
        // Analyze transcript to find interesting clips
        const { clips } = await analyzeTranscript(transcript, numShorts);
        
        // Generate shorts
        const shortUrls = [];
        for (const clip of clips) {
            const url = await generateShort(tempVideoPath, videoId, clip, tempDir);
            shortUrls.push(url);
        }
        
        // Cleanup temporary files
        await cleanupTempFiles(tempDir);
        
        res.json({ 
            videoId, 
            shorts: shortUrls 
        });
    } catch (error) {
        console.error("Error in /generate-shorts:", error);
        await cleanupTempFiles(tempDir);
        res.status(500).json({ error: error.message });
    }
});

// Modified thumbnail generation endpoint
app.post('/getexcitingthumbnails', upload.single('video'), async (req, res) => {
    const tempDir = getTempDir();
    try {
        if (!req.file) throw new Error('No video file uploaded');
        
        // Get number of thumbnails (default to 1, max 3)
        const numThumbnails = Math.min(
            Math.max(parseInt(req.body.numThumbnails) || 1, 1), 
            3
        );
        
        const videoId = uuidv4();
        const videoBuffer = req.file.buffer;
        
        // Upload original video to Cloudinary
        const videoResult = await uploadToCloudinary(
            videoBuffer, 
            videoId, 
            'original_video'
        );
        
        // Save video temporarily for processing
        const tempVideoPath = path.join(tempDir, 'original_video.mp4');
        fs.writeFileSync(tempVideoPath, videoBuffer);
        
        // Create audio directory
        const audioTempDir = path.join(tempDir, 'audio');
        if (!fs.existsSync(audioTempDir)) {
            fs.mkdirSync(audioTempDir, { recursive: true });
        }
        
        // Extract audio and generate transcript
        const audio = await extractAudio(tempVideoPath, videoId, audioTempDir);
        const transcript = await transcribeAudio(audio.localPath, videoId, audioTempDir);
        
        // Find exciting timestamps for thumbnails
        const { thumbnails } = await findExcitingThumbnailTimestamps(
            tempVideoPath, 
            transcript, 
            numThumbnails
        );
        
        // Extract and enhance thumbnails
        const thumbnailResults = [];
        for (let i = 0; i < thumbnails.length; i++) {
            const timestamp = thumbnails[i].timestamp;
            const description = thumbnails[i].description;
            
            // Extract raw thumbnail
            const rawPath = await extractThumbnail(tempVideoPath, timestamp, videoId, tempDir, i+1);
            
            // Enhance the thumbnail and upload to Cloudinary
            const thumbnailUrl = await enhanceThumbnail(rawPath, videoId, i+1, tempDir);
            
            thumbnailResults.push({
                url: thumbnailUrl,
                timestamp: timestamp,
                description: description
            });
        }
        
        // Cleanup temporary files
        await cleanupTempFiles(tempDir);
        
        res.json({ 
            videoId, 
            videoUrl: videoResult.secure_url,
            thumbnails: thumbnailResults
        });
    } catch (error) {
        console.error("Error in /getexcitingthumbnails:", error);
        await cleanupTempFiles(tempDir);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));