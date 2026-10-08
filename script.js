function startAnalysis() {
    alert("AI Analysis started!");
}

let cameraStream = null;
let currentCamera = "user";
let isDetecting = false;
let lastExpression = "";
let expressionCount = 0;
const requiredFrames = 5;
let modelsLoaded = false;


// ===============================
// LOAD AI MODELS
// ===============================
async function loadModels() {

    try {

        document.getElementById("camera-status").textContent =
            "Loading AI models...";

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            "./tiny_face_detector"
        );

        await faceapi.nets.faceExpressionNet.loadFromUri(
            "./face_expression"
        );

        modelsLoaded = true;

        document.getElementById("camera-status").textContent =
            "AI models loaded successfully";

    } catch (error) {

        console.error(error);

        document.getElementById("camera-status").textContent =
            "AI model loading failed";
    }
}


// ===============================
// CAMERA OPEN
// ===============================
async function openCamera() {

    try {

        stopCamera();

        if (!modelsLoaded) {
            await loadModels();
        }

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: currentCamera
                },
                audio: false
            });

        const video =
            document.getElementById("camera");

        video.srcObject = cameraStream;

        await video.play();

        document.getElementById("camera-status").textContent =
            currentCamera === "user"
                ? "Front Camera is active"
                : "Back Camera is active";

        detectLoop(video);

    } catch (error) {

        console.error(error);

        document.getElementById("camera-status").textContent =
            "Camera permission denied or unavailable.";
    }
}


// ===============================
// FACE + EXPRESSION DETECTION
// ===============================
async function detectLoop(video) {

    if (isDetecting) return;

    isDetecting = true;

    const expressionResult =
        document.getElementById("expression-result");

    const confidenceResult =
        document.getElementById("confidence-result");

    const analysisMessage =
        document.getElementById("analysis-message");
const lieResult =
    document.getElementById("lie-result");
    while (cameraStream && video.srcObject) {

        try {

            const detection = await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceExpressions();


            if (detection) {

                const expressions =
                    detection.expressions;

                const sortedExpressions =
                    Object.entries(expressions)
                        .sort((a, b) => b[1] - a[1]);

                const bestExpression =
                    sortedExpressions[0];

                const detectedExpression = bestExpression[0];
const confidence = bestExpression[1];

if (detectedExpression === lastExpression) {
    expressionCount++;
} else {
    lastExpression = detectedExpression;
    expressionCount = 1;
}

if (expressionCount >= requiredFrames) {

    expressionResult.textContent =
        "Expression: " + detectedExpression;

    confidenceResult.textContent =
        "Confidence: " +
        Math.round(confidence * 100) + "%";

    sendExpressionToBackend(
        detectedExpression,
        confidence
    );

    analysisMessage.textContent =
        "Facial expression detected successfully.";

    loadExpressionHistory();
}
if (detectedExpression === "happy") {
    lieResult.textContent =
        "Analysis Result: Positive facial expression detected";
} else if (detectedExpression === "sad") {
    lieResult.textContent =
        "Analysis Result: Sad facial expression detected";
} else if (detectedExpression === "angry") {
    lieResult.textContent =
        "Analysis Result: Angry facial expression detected";
} else if (detectedExpression === "surprised") {
    lieResult.textContent =
        "Analysis Result: Surprise detected";
} else if (detectedExpression === "neutral") {
    lieResult.textContent =
        "Analysis Result: Neutral facial expression detected";
}

                expressionResult.textContent =
                    "Expression: " + expression;

                confidenceResult.textContent =
                    "Confidence: " +
                    Math.round(confidence * 100) + "%";

                analysisMessage.textContent =
                    "Facial expression detected successfully.";

                document.getElementById("camera-status")
                    .textContent =
                    "Face detected";

            } else {

                expressionResult.textContent =
                    "Expression: Waiting...";

                confidenceResult.textContent =
                    "Confidence: --";

                analysisMessage.textContent =
                    "Please position your face in front of the camera.";

                document.getElementById("camera-status")
                    .textContent =
                    "No face detected";
            }

        } catch (error) {

            console.error(error);
        }

        await new Promise(resolve =>
            setTimeout(resolve, 200)
        );
    }

    isDetecting = false;
}


// ===============================
// SWITCH CAMERA
// ===============================
function switchCamera() {

    currentCamera =
        currentCamera === "user"
            ? "environment"
            : "user";

    openCamera();
}


// ===============================
// STOP CAMERA
// ===============================
function stopCamera() {

    isDetecting = false;

    if (cameraStream) {

        cameraStream.getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    const video =
        document.getElementById("camera");

    if (video) {
        video.srcObject = null;
    }

    document.getElementById("camera-status")
        .textContent = "Camera stopped";

    document.getElementById("expression-result")
        .textContent =
        "Expression: Waiting...";

    document.getElementById("confidence-result")
        .textContent =
        "Confidence: --";

    document.getElementById("analysis-message")
        .textContent =
        "Analysis result will appear here.";
}async function testBackendConnection() {
    try {
        const response = await fetch("https://ai-real-time-micro-expression-and-lie.onrender.com/api/status");
        const data = await response.json();

        console.log(data.message);
    } catch (error) {
        console.error("Backend connection failed:", error);
    }
}

testBackendConnection();
async function sendExpressionToBackend(expression, confidence) {
    try {
    const response = await fetch("https://ai-real-time-micro-expression-and-lie.onrender.com/api/expression", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expression: expression,
                confidence: confidence
            })
        });

        const data = await response.json();
console.log("Sending to backend:", expression, confidence);
        console.log(data.message);
        console.log("Backend response:", data);
loadExpressionHistory();
    } catch (error) {
        console.error("Expression backend connection failed:", error);
    }
}
async function loadExpressionHistory() {
    try {
        const response = await fetch(
            "https://ai-real-time-micro-expression-and-lie.onrender.com/api/history"
        );

        const data = await response.json();

        const historyList =
            document.getElementById("history-list");

        if (data.history.length === 0) {
            historyList.textContent =
                "No expression history yet.";
            return;
        }

        historyList.innerHTML = "";

        data.history.forEach(item => {

            const entry =
                document.createElement("p");

            entry.textContent =
                "Expression: " +
                item.expression +
                " | Confidence: " +
                Math.round(item.confidence * 100) +
                "%";

            historyList.appendChild(entry);
        });

    } catch (error) {

        console.error(
            "History loading failed:",
            error
        );
    }
}

loadExpressionHistory();
function toggleHistory() {
    const historyList =
        document.getElementById("history-list");

    const historyButton =
        document.getElementById("history-toggle");

    if (historyList.style.display === "none") {
        historyList.style.display = "block";
        historyButton.textContent =
            "Expression History ▲";
    } else {
        historyList.style.display = "none";
        historyButton.textContent =
            "Expression History ▼";
    }
}