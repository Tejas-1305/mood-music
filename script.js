// Replace these with your actual API keys
const VISION_API_KEY = "YOUR_GOOGLE_CLOUD_VISION_API_KEY";
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_DATA_API_KEY";

async function detectMood() {
    const fileInput = document.getElementById("photoInput").files[0];
    if (!fileInput) {
        alert("Please upload a photo first.");
        return;
    }

    // Convert image to Base64
    const reader = new FileReader();
    reader.onloadend = async function () {
        const base64Image = reader.result.split(',')[1];

        // Call Google Vision API
        const visionResponse = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
            {
                method: "POST",
                body: JSON.stringify({
                    requests: [
                        {
                            image: { content: base64Image },
                            features: [{ type: "FACE_DETECTION", maxResults: 1 }]
                        }
                    ]
                }),
                headers: { "Content-Type": "application/json" }
            }
        );

        const visionData = await visionResponse.json();
        console.log(visionData);

        if (!visionData.responses[0].faceAnnotations) {
            document.getElementById("moodResult").innerText = "No face detected.";
            return;
        }

        const joyLikelihood = visionData.responses[0].faceAnnotations[0].joyLikelihood;
        let mood = "";

        if (joyLikelihood === "VERY_LIKELY" || joyLikelihood === "LIKELY") {
            mood = "happy";
        } else {
            mood = "sad";
        }

        document.getElementById("moodResult").innerText = `Detected Mood: ${mood}`;
        fetchMusic(mood);
    };
    reader.readAsDataURL(fileInput);
}

async function fetchMusic(mood) {
    const query = mood + " songs";
    const youtubeResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=5&key=${YOUTUBE_API_KEY}`
    );
    const youtubeData = await youtubeResponse.json();

    const songsDiv = document.getElementById("songsList");
    songsDiv.innerHTML = "";

    youtubeData.items.forEach(item => {
        const videoId = item.id.videoId;
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        songsDiv.appendChild(iframe);
    });
}
