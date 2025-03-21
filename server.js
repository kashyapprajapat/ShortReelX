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
//               Clodinary -- use in production
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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require("xss-clean");
const hpp = require("hpp");
const slowDown = require("express-slow-down");

const app = express();
app.use(cors());
app.use(express.json());

// { "query": { "category": ["books", "electronics"] }} An attacker can manipulate logic by sending multiple values!
// ✅ With hpp (Protected) The server will now receive only the last value that is electronics
app.use(hpp()); 

// security headers for request
app.use(helmet());

// to prevent api from this { "name": "<script>alert('Hacked!')</script>" }  
// it can send from req.body, parameter etc way
app.use(xss());    

// Rate Limmiter which is hardcoded means after 5 request you are bloack
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, 
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // Remaining seconds for devs 👨🏻‍💻

    res.status(429).send(`
      <html>
        <head>
          <title>Too Many Requests</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8d7da; }
            .message { text-align: center; font-size: 24px; color: #721c24; background: #f8d7da; padding: 20px; border-radius: 8px; }
          </style>
          <script>
            let timeLeft = ${retryAfter};

            function updateTimer() {
              if (timeLeft > 0) {
                document.getElementById("timer").innerText = timeLeft;
                timeLeft--;
                setTimeout(updateTimer, 1000);
              } else {
                location.reload();
              }
            }

            document.addEventListener("DOMContentLoaded", updateTimer);
          </script>
        </head>
        <body>
          <div class="message">
            🚫 Too Many Requests! Please wait <span id="timer">${retryAfter}</span> seconds. 🚫
          </div>
        </body>
      </html>
    `);
  }
});

// 🚀 Slow down repeated requests instead of blocking immediately
// so insted of blaking we alow down aggresive devs 👨🏻‍💻
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 3, // Allow 3 requests before slowing down
  delayMs: () => 1000, // Add 1 second delay per request after the limit
});

app.use(speedLimiter); // <<- Slows down requests
app.use(limiter);


// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), 'shortreel-' + uuidv4());
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
};

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
        resolve(result);
      }
    );
  });
};

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

async function extractAudio(videoPath, videoId, tempDir) {
  const audioPath = path.join(tempDir, 'audio.wav');

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('pcm_s16le')
      .format('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .outputOptions([
        '-threads 2',
        '-preset ultrafast'
      ])
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });

  await uploadFileToCloudinary(audioPath, videoId, 'audio');
  return audioPath;
}

async function splitAudio(audioPath, videoId, tempDir) {
  const chunkDir = path.join(tempDir, 'chunks');
  fs.mkdirSync(chunkDir, { recursive: true });

  await new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .output(`${chunkDir}/chunk_%03d.wav`)
      .format('wav')
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .duration(30)
      .outputOptions([
        '-threads 2',
        '-preset ultrafast'
      ])
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const chunkFiles = fs.readdirSync(chunkDir).map(file => path.join(chunkDir, file));
  
  const chunkUrls = [];
  for (const chunkFile of chunkFiles) {
    const result = await uploadFileToCloudinary(chunkFile, `${videoId}/chunks`, path.basename(chunkFile));
    chunkUrls.push(result.secure_url);
    // Add delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { localPaths: chunkFiles, cloudinaryUrls: chunkUrls };
}

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
    // Add delay between chunks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const transcriptPath = path.join(tempDir, 'transcript.txt');
  fs.writeFileSync(transcriptPath, fullTranscript);
  await uploadFileToCloudinary(transcriptPath, videoId, 'transcript');

  return fullTranscript.trim();
}

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
    const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse AI response');
  }
}

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
      .outputOptions([
        '-threads 2',
        '-preset ultrafast',
        '-crf 28',
        '-maxrate 2M',
        '-bufsize 2M'
      ])
      .output(shortPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const result = await uploadFileToCloudinary(shortPath, `${videoId}/shorts`, shortName.split('.')[0]);
  return result.secure_url;
}

async function findExcitingThumbnailTimestamps(videoPath, transcript, numThumbnails) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
    const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing Gemini response for thumbnails:', error);
    const thumbnails = [];
    for (let i = 0; i < numThumbnails; i++) {
      const timestamp = Math.floor((videoDuration / (numThumbnails + 1)) * (i + 1));
      thumbnails.push({ timestamp, description: `Auto-generated thumbnail ${i+1}` });
    }
    return { thumbnails };
  }
}

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

async function extractThumbnail(videoPath, timestamp, tempDir, index) {
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
      .outputOptions([
        '-threads 2',
        '-preset ultrafast'
      ])
      .on('end', resolve)
      .on('error', reject);
  });

  return rawPath;
}

async function enhanceThumbnail(inputPath, videoId, index, tempDir) {
  const enhancedFilename = `thumbnail-${index}.jpg`;
  const enhancedPath = path.join(tempDir, enhancedFilename);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters([
        { filter: 'eq', options: { brightness: '0.05', contrast: '1.2', saturation: '1.3' } },
        { filter: 'unsharp', options: { luma_msize_x: 5, luma_msize_y: 5, luma_amount: 1.0 } }
      ])
      .outputOptions([
        '-threads 2',
        '-preset ultrafast'
      ])
      .output(enhancedPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const result = await uploadFileToCloudinary(enhancedPath, `${videoId}/thumbnails`, enhancedFilename.split('.')[0]);
  return result.secure_url;
}

async function cleanupTempFiles(tempDir) {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// Home 🏠 Route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ShortReelX v2 - API Docs</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px; 
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f9f9f9;
        }
        h1 { color: #1a73e8; }
        .container {
          max-width: 600px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .route { 
          margin: 20px 0; 
          padding: 15px; 
          border: 1px solid #ddd; 
          border-radius: 5px; 
          text-align: left;
        }
        .method { 
          background: #1a73e8; 
          color: white; 
          padding: 3px 6px; 
          border-radius: 3px; 
          font-weight: bold;
        }
        .endpoint {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎥 ShortReelX v2 - API Documentation</h1>
        <p>AI-powered video processing service</p>
        
        <div class="route">
          <h3><span class="method">POST</span> <span class="endpoint">/upload</span></h3>
          <p><strong>Description:</strong> Upload a video for processing.</p>
          <p><strong>Headers:</strong> <code>Content-Type: multipart/form-data</code></p>
          <p><strong>Request Body:</strong></p>
          <ul>
            <li><code>video</code> (file) - The video file to upload.</li>
          </ul>
          <p><strong>Response:</strong></p>
          <pre>
{
  "videoId": "UUID",
  "transcript": "Extracted text from video",
  "videoUrl": "URL to the uploaded video"
}
          </pre>
        </div>

        <div class="route">
          <h3><span class="method">POST</span> <span class="endpoint">/generate-shorts</span></h3>
          <p><strong>Description:</strong> Generate short clips from an uploaded video.</p>
          <p><strong>Headers:</strong> <code>Content-Type: application/json</code></p>
          <p><strong>Request Body:</strong></p>
          <ul>
            <li><code>videoId</code> (string) - ID of the uploaded video.</li>
            <li><code>numShorts</code> (number) - Number of shorts to generate.</li>
            <li><code>videoUrl</code> (string) - URL of the uploaded video.</li>
          </ul>
          <p><strong>Response:</strong></p>
          <pre>
{
  "videoId": "UUID",
  "shorts": ["URL to short clip"],
  "message": "All shorts generated successfully"
}
          </pre>
        </div>

        <div class="route">
          <h3><span class="method">POST</span> <span class="endpoint">/getexcitingthumbnails</span></h3>
          <p><strong>Description:</strong> Generate engaging thumbnails from a video.</p>
          <p><strong>Headers:</strong> <code>Content-Type: multipart/form-data</code></p>
          <p><strong>Request Body:</strong></p>
          <ul>
            <li><code>video</code> (file) - The video file.</li>
            <li><code>numThumbnails</code> (number) - Number of thumbnails (1-3).</li>
          </ul>
          <p><strong>Response:</strong></p>
          <pre>
{
  "videoId": "UUID",
  "thumbnails": ["URL to thumbnail images"],
  "message": "All thumbnails generated successfully"
}
          </pre>
        </div>

        <div class="route">
          <h3><span class="method">POST</span> <span class="endpoint">/generate-viral-reels</span></h3>
          <p><strong>Description:</strong> Generate viral-optimized reels with catchy titles from an uploaded video.</p>
          <p><strong>Headers:</strong> <code>Content-Type: application/json</code></p>
          <p><strong>Request Body:</strong></p>
          <ul>
            <li><code>videoId</code> (string) - ID of the uploaded video.</li>
            <li><code>videoUrl</code> (string) - URL of the uploaded video.</li>
            <li><code>numReels</code> (number) - Number of viral reels to generate (max 5).</li>
          </ul>
          <p><strong>Response:</strong></p>
          <pre>
{
  "videoId": "UUID",
  "reels": [
    {
      "url": "URL to reel clip",
      "title": "Catchy viral-worthy title",
      "description": "Brief description of content",
      "hashtags": ["tag1", "tag2", "tag3"],
      "viralScore": 8.5
    }
  ],
  "message": "All viral reels generated successfully",
  "aiInsights": "Brief analysis of viral potential"
}
          </pre>
        </div>
        
        <div class="route">
          <h3><span class="method">POST</span> <span class="endpoint">/generate-subtitles</span></h3>
          <p><strong>Description:</strong> Generate subtitle files (SRT and VTT) from a video with optional styled video.</p>
          <p><strong>Headers:</strong> <code>Content-Type: multipart/form-data</code></p>
          <p><strong>Request Body:</strong></p>
          <ul>
            <li><code>video</code> (file) - The video file to generate subtitles for.</li>
            <li><code>generateStyledVideo</code> (string) - Set to 'true' to generate a video with styled subtitles.</li>
          </ul>
          <p><strong>Response:</strong></p>
          <pre>
{
  "videoId": "UUID",
  "subtitles": {
    "srt": "URL to SRT subtitle file",
    "vtt": "URL to VTT subtitle file",
    "styledVideo": "URL to video with styled subtitles (if requested)"
  },
  "message": "Subtitles generated successfully"
}
          </pre>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Video upload
app.post('/upload', upload.single('video'), async (req, res) => {
  const tempDir = getTempDir();
  try {
    if (!req.file) throw new Error('No file uploaded');
    
    const videoId = uuidv4();
    const tempVideoPath = path.join(tempDir, 'video.mp4');
    fs.writeFileSync(tempVideoPath, req.file.buffer);
    
    const audioPath = await extractAudio(tempVideoPath, videoId, tempDir);
    const transcript = await transcribeAudio(audioPath, videoId, tempDir);
    
    const videoResult = await uploadToCloudinary(req.file.buffer, videoId, 'original');
    
    await cleanupTempFiles(tempDir);
    res.json({ videoId, transcript, videoUrl: videoResult.secure_url });
  } catch (error) {
    await cleanupTempFiles(tempDir);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Please ensure the video file is valid and try again'
    });
  }
});

// Youtube shorts
app.post('/generate-shorts', async (req, res) => {
  const tempDir = getTempDir();
  try {
    const { videoId, numShorts, videoUrl } = req.body;
    if (!videoId || !videoUrl) throw new Error('Missing parameters');
    
    const tempVideoPath = path.join(tempDir, 'video.mp4');
    await downloadFromCloudinary(videoUrl, tempVideoPath);
    
    // Add delay between processing to prevent memory overload
    const audioPath = await extractAudio(tempVideoPath, videoId, tempDir);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    const transcript = await transcribeAudio(audioPath, videoId, tempDir);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    const { clips } = await analyzeTranscript(transcript, numShorts);
    const shortUrls = [];
    
    for (const clip of clips) {
      try {
        const url = await generateShort(tempVideoPath, videoId, clip, tempDir);
        shortUrls.push(url);
        // Add delay between processing each short
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
      } catch (error) {
        console.error('Error generating short:', error);
        continue;
      }
    }
    
    await cleanupTempFiles(tempDir);
    res.json({ 
      videoId, 
      shorts: shortUrls,
      message: shortUrls.length < clips.length ? 
        'Some shorts could not be generated due to resource constraints' : 
        'All shorts generated successfully'
    });
  } catch (error) {
    await cleanupTempFiles(tempDir);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Try processing a shorter video or reducing the number of shorts'
    });
  }
});

// Exciting Thumbnails 
app.post('/getexcitingthumbnails', upload.single('video'), async (req, res) => {
  const tempDir = getTempDir();
  try {
    if (!req.file) throw new Error('No video uploaded');
    const numThumbnails = Math.min(Math.max(parseInt(req.body.numThumbnails) || 1, 1), 3);
    
    const videoId = uuidv4();
    const tempVideoPath = path.join(tempDir, 'video.mp4');
    fs.writeFileSync(tempVideoPath, req.file.buffer);
    
    const transcript = await transcribeAudio(await extractAudio(tempVideoPath, videoId, tempDir), videoId, tempDir);
    const { thumbnails } = await findExcitingThumbnailTimestamps(tempVideoPath, transcript, numThumbnails);
      
    const thumbnailResults = [];
    for (let i = 0; i < thumbnails.length; i++) {
      try {
        const rawPath = await extractThumbnail(tempVideoPath, thumbnails[i].timestamp, tempDir, i+1);
        const thumbnailUrl = await enhanceThumbnail(rawPath, videoId, i+1, tempDir);
        thumbnailResults.push({
          url: thumbnailUrl,
          timestamp: thumbnails[i].timestamp,
          description: thumbnails[i].description
        });
        // Add delay between processing thumbnails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        continue;
      }
    }
    
    await cleanupTempFiles(tempDir);
    res.json({ 
      videoId, 
      thumbnails: thumbnailResults,
      message: thumbnailResults.length < thumbnails.length ?
        'Some thumbnails could not be generated due to resource constraints' :
        'All thumbnails generated successfully'
    });
  } catch (error) {
    await cleanupTempFiles(tempDir);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Try processing a shorter video or reducing the number of thumbnails'
    });
  }
});

// Reels 
app.post('/generate-viral-reels', async (req, res) => {
  const tempDir = getTempDir();
  try {
    const { videoId, numReels, videoUrl } = req.body;
    if (!videoId || !videoUrl || !numReels) {
      throw new Error('Missing required parameters: videoId, videoUrl, and numReels are required');
    }
    
    // Limit number of reels to prevent resource exhaustion
    const safeNumReels = Math.min(Math.max(parseInt(numReels), 1), 5);
    
    const tempVideoPath = path.join(tempDir, 'video.mp4');
    await downloadFromCloudinary(videoUrl, tempVideoPath);
    
    // Extract audio and get transcript for content analysis
    const audioPath = await extractAudio(tempVideoPath, videoId, tempDir);
    const transcript = await transcribeAudio(audioPath, videoId, tempDir);
    
    // Use AI to identify viral-worthy segments and generate titles
    const viralContent = await analyzeForViralContent(transcript, safeNumReels);
    
    const reelResults = [];
    for (let i = 0; i < viralContent.reels.length; i++) {
      try {
        const reel = viralContent.reels[i];
        // Generate the short video clip
        const url = await generateShort(tempVideoPath, videoId, reel, tempDir);
        
        // Add to results with the AI-generated title
        reelResults.push({
          url: url,
          title: reel.title,
          description: reel.description,
          hashtags: reel.hashtags,
          viralScore: reel.viralScore
        });
        
        // Add delay between processing each reel to prevent overloadin 👨🏻‍💻
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        console.error('Error generating viral reel:', error);
        continue;
      }
    }
    
    await cleanupTempFiles(tempDir);
    res.json({ 
      videoId, 
      reels: reelResults,
      message: reelResults.length < viralContent.reels.length ? 
        'Some viral reels could not be generated due to resource constraints' : 
        'All viral reels generated successfully',
      aiInsights: viralContent.insights
    });
  } catch (error) {
    await cleanupTempFiles(tempDir);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Try processing a shorter video or reducing the number of reels'
    });
  }
});

// Function to analyze transcript and find viral-worthy content with AI
async function analyzeForViralContent(transcript, numReels) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
  Analyze this video transcript and identify ${numReels} segments that have the highest viral potential 
  for social media reels/short-form content. Follow these rules:
  
  1. Each clip must be 15-60 seconds long
  2. Choose moments that will grab attention in the first 3 seconds
  3. Look for emotional moments, surprising facts, or captivating stories
  4. Focus on content that's either educational, inspirational, funny, or showcases a unique skill
  5. For each segment, create a catchy, clickable title (max 60 chars)
  6. Include a brief description (1-2 sentences)
  7. Suggest 3-5 relevant hashtags for each clip
  8. Give each clip a "viral score" from 1-10 based on its potential
  
  Return ONLY VALID JSON without any markdown formatting:
  {
    "reels": [
      {
        "start": number,
        "end": number,
        "title": "catchy viral-worthy title",
        "description": "brief description of content",
        "hashtags": ["tag1", "tag2", "tag3"],
        "viralScore": number
      }
    ],
    "insights": "Brief analysis of why these segments have viral potential"
  }
  
  Transcript: ${transcript}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing Gemini response for viral content:', error);
    
    // Fallback to basic clips if AI analysis fails
    const reels = [];
    const clipLength = 30; // 30 seconds per clip
    const transcriptWords = transcript.split(' ');
    const wordsPerSecond = 2.5; // Estimate speaking rate
    const totalSeconds = transcriptWords.length / wordsPerSecond;
    
    for (let i = 0; i < numReels; i++) {
      const startPos = (totalSeconds / (numReels + 1)) * (i + 1);
      reels.push({
        start: Math.max(0, startPos - (clipLength / 2)),
        end: Math.min(totalSeconds, startPos + (clipLength / 2)),
        title: `Engaging Moment ${i+1}`,
        description: "Automatically generated clip from your video",
        hashtags: ["viral", "trending", "content"],
        viralScore: 5
      });
    }
    
    return { 
      reels,
      insights: "Basic clips were generated as AI content analysis encountered an error."
    };
  }
}

// Generate subtitles
app.post('/generate-subtitles', upload.single('video'), async (req, res) => {
  const tempDir = getTempDir();
  try {
    if (!req.file) throw new Error('No video uploaded');
    
    const videoId = uuidv4();
    const tempVideoPath = path.join(tempDir, 'video.mp4');
    fs.writeFileSync(tempVideoPath, req.file.buffer);
    
    // Extract audio 
    const audioPath = await extractAudio(tempVideoPath, videoId, tempDir);
    
    // Get  transcript with timestamps using HuggingFace
    const detailedTranscript = await generateTimestampedTranscript(audioPath, videoId);
    
    // Generate SRT file
    const srtPath = await createSRTFile(detailedTranscript, tempDir, videoId);
    
    // Generate VTT file (Web Video Text Tracks format)
    const vttPath = await createVTTFile(detailedTranscript, tempDir, videoId);
    
    // Upload subtitle files to Cloudinary
    const srtResult = await uploadFileToCloudinary(srtPath, `${videoId}/subtitles`, 'subtitles-srt');
    const vttResult = await uploadFileToCloudinary(vttPath, `${videoId}/subtitles`, 'subtitles-vtt');
    
    // Optional: Generate styled subtitle video
    const styledVideoUrl = req.body.generateStyledVideo === 'true' ? 
      await createStyledSubtitleVideo(tempVideoPath, srtPath, videoId, tempDir) : null;
    
    await cleanupTempFiles(tempDir);
    res.json({ 
      videoId, 
      subtitles: {
        srt: srtResult.secure_url,
        vtt: vttResult.secure_url,
        styledVideo: styledVideoUrl
      },
      message: 'Subtitles generated successfully'
    });
  } catch (error) {
    await cleanupTempFiles(tempDir);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Make sure the video has clear audio and try again'
    });
  }
});

// Generate timestamped transcript with word-level timing
async function generateTimestampedTranscript(audioPath, videoId) {
  const chunks = await splitAudio(audioPath, videoId, getTempDir());
  let detailedTranscript = [];
  
  for (const chunk of chunks.localPaths) {
    const audioBuffer = fs.readFileSync(chunk);
    try {
      // Using Hugging Face for timestamped transcription
      const response = await hf.automaticSpeechRecognition({
        model: "openai/whisper-large",
        data: audioBuffer,
        parameters: { 
          return_timestamps: true,
          word_timestamps: true  
        }
      });
      
    
      if (response.chunks) {
        // API returns word-level chunks
        detailedTranscript = detailedTranscript.concat(response.chunks);
      } else {
        // only sentence-level timestamps are available
        detailedTranscript.push({
          text: response.text,
          timestamp: [response.start || 0, response.end || 0]
        });
      }
    } catch (error) {
      console.error('Error in transcription:', error);
      // Fall back to simpler transcription method if detailed fails
      const response = await hf.automaticSpeechRecognition({
        model: "openai/whisper-large",
        data: audioBuffer,
        parameters: { return_timestamps: true }
      });
      
      // Parse timestamps from text if they're embedded like [0:05-0:10]
      const timestampRegex = /\[(\d+:\d+)-(\d+:\d+)\]/g;
      const matches = [...response.text.matchAll(timestampRegex)];
      
      if (matches.length > 0) {
        for (const match of matches) {
          const startTime = convertTimestampToSeconds(match[1]);
          const endTime = convertTimestampToSeconds(match[2]);
          const textSegment = response.text.replace(match[0], '').trim();
          
          detailedTranscript.push({
            text: textSegment,
            timestamp: [startTime, endTime]
          });
        }
      } else {
        // If no embedded timestamps, estimate based on text length
        const words = response.text.split(' ');
        const avgWordDuration = 0.4; // Average word duration in seconds
        const duration = words.length * avgWordDuration;
        
        detailedTranscript.push({
          text: response.text,
          timestamp: [0, duration]
        });
      }
    }
    
    // Add delay between chunks to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return detailedTranscript;
}

// Helper function to convert timestamp format to seconds
function convertTimestampToSeconds(timestamp) {
  const parts = timestamp.split(':');
  return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
}

// Create SRT subtitle file
async function createSRTFile(transcript, tempDir, videoId) {
  const srtPath = path.join(tempDir, 'subtitles.srt');
  let srtContent = '';
  
  transcript.forEach((segment, index) => {
    srtContent += `${index + 1}\n`;
 
    const startTime = formatSRTTimestamp(segment.timestamp[0]);
    const endTime = formatSRTTimestamp(segment.timestamp[1]);
    srtContent += `${startTime} --> ${endTime}\n`;
    
    srtContent += `${segment.text}\n\n`;
  });
  
  fs.writeFileSync(srtPath, srtContent);
  return srtPath;
}

// Create WebVTT subtitle file
async function createVTTFile(transcript, tempDir, videoId) {
  const vttPath = path.join(tempDir, 'subtitles.vtt');
  let vttContent = 'WEBVTT\n\n';
  
  transcript.forEach((segment, index) => {
   
    vttContent += `${index + 1}\n`;
    

    const startTime = formatVTTTimestamp(segment.timestamp[0]);
    const endTime = formatVTTTimestamp(segment.timestamp[1]);
    vttContent += `${startTime} --> ${endTime}\n`;
  
    vttContent += `${segment.text}\n\n`;
  });
  
  fs.writeFileSync(vttPath, vttContent);
  return vttPath;
}

// Format timestamp for SRT files
function formatSRTTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

// Format timestamp for VTT files
function formatVTTTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Create a video with styled burned-in subtitles
async function createStyledSubtitleVideo(videoPath, srtPath, videoId, tempDir) {
  const outputPath = path.join(tempDir, `${videoId}-subtitled.mp4`);
  
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', `subtitles=${srtPath}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,BackColour=&H80000000,BorderStyle=4'`,
        '-threads 2',
        '-preset ultrafast',
        '-crf 28'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  
  const result = await uploadFileToCloudinary(outputPath, `${videoId}/styled-video`, 'subtitled-video');
  return result.secure_url;
}

// to check service is live or not
app.get('/ping', (req, res) => {
  res.send('pong');
});

// system health route
app.get('/health', (req, res) => {
  const healthInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
  };
  res.json(healthInfo);
});



const PORT = process.env.PORT || 7777;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));