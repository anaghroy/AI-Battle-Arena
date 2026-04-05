import axios from "axios";
import config from "../config/config.js";

const SHOTSTACK_URL = "https://api.shotstack.io/v1/render";
const PEXELS_URL = "https://api.pexels.com/videos/search";

// Fetch video from Pexels
const getPexelsVideo = async (query: string): Promise<string> => {
  try {
    const res = await axios.get(PEXELS_URL, {
      headers: {
        Authorization: config.PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: 1,
      },
    });

    const video = res.data.videos[0];
    if (!video) {
        console.warn(`No video found on Pexels for query: "${query}". Falling back to generic query...`);
        // Fallback to a single generic keyword
        const keywords = query.split(' ').filter(w => w.length > 3);
        const fallbackQuery = keywords.length > 0 ? keywords[keywords.length - 1] : "technology";
        
        const fallbackRes = await axios.get(PEXELS_URL, {
            headers: { Authorization: config.PEXELS_API_KEY },
            params: { query: fallbackQuery, per_page: 1 }
        });
        if (!fallbackRes.data.videos[0]) {
             return "https://cdn.pixabay.com/vimeo/32894014/technology-23588.mp4?width=1280&hash=648675ba319e7a96ef55fa4acaf6dc0808ac6379"; // default reliable MP4 fallback
        }
        return fallbackRes.data.videos[0].video_files[0].link;
    }

    return video.video_files[0].link; // direct video URL
  } catch (error) {
    console.error("Pexels Error:", error);
    throw new Error("Failed to fetch video");
  }
};

// Create Shotstack timeline
const createTimeline = (videoUrl: string, text: string) => {
  return {
    timeline: {
      tracks: [
        {
          clips: [
            {
              asset: {
                type: "video",
                src: videoUrl,
              },
              start: 0,
              length: 5,
            },
            {
              asset: {
                type: "title",
                text,
                style: "minimal",
              },
              start: 0,
              length: 5,
            },
          ],
        },
      ],
    },
    output: {
      format: "mp4",
      resolution: "sd",
    },
  };
};

// Render video via Shotstack
const renderVideo = async (timeline: any): Promise<string> => {
  try {
    const res = await axios.post(
      SHOTSTACK_URL,
      timeline,
      {
        headers: {
          "x-api-key": config.SHOTSTACK_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const renderId = res.data.response.id;

    // Poll status
    let status = "queued";
    let url = "";

    while (status !== "done") {
      await new Promise((r) => setTimeout(r, 3000));

      const statusRes = await axios.get(
        `https://api.shotstack.io/v1/render/${renderId}`,
        {
          headers: {
            "x-api-key": config.SHOTSTACK_API_KEY,
          },
        }
      );

      status = statusRes.data.response.status;

      if (status === "failed") {
        throw new Error("Shotstack render failed");
      }

      if (status === "done") {
        url = statusRes.data.response.url;
      }
    }

    return url;
  } catch (error) {
    console.error("Shotstack Error:", error);
    throw new Error("Video render failed");
  }
};

// MAIN VIDEO BATTLE FUNCTION
export const generateVideoBattle = async (prompt: string) => {
  try {
    console.log("Generating video battle...");

    // Step 1: Create variations
    const queryA = prompt;
    const queryB = prompt + " cinematic lighting";

    // Step 2: Get clips
    const [videoA, videoB] = await Promise.all([
      getPexelsVideo(queryA),
      getPexelsVideo(queryB),
    ]);

    // Step 3: Create timelines
    const timelineA = createTimeline(videoA, "Solution A");
    const timelineB = createTimeline(videoB, "Solution B");

    // Step 4: Render videos
    const [urlA, urlB] = await Promise.all([
      renderVideo(timelineA),
      renderVideo(timelineB),
    ]);

    return {
      solutionA: {
        videoUrl: urlA,
        model: "shotstack-pexels-A",
      },
      solutionB: {
        videoUrl: urlB,
        model: "shotstack-pexels-B",
      },
    };
  } catch (error) {
    console.error("Video Battle Error:", error);
    throw new Error("Video generation failed");
  }
};