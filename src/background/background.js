chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed/updated:", details.reason);
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message);
  console.log("From sender:", sender);

  switch (message.type) {
    case "MIC_PERMISSION_REQUESTED":
      console.log("Microphone permission requested");
      break;
    case "MIC_PERMISSION_GRANTED":
      console.log("Microphone permission granted");
      break;
    case "MIC_PERMISSION_DENIED":
      console.log("Microphone permission denied");
      break;
    case "SPEECH_RECOGNITION_STARTED":
      console.log("Speech recognition started");
      break;
    case "SPEECH_RECOGNITION_STOPPED":
      console.log("Speech recognition stopped");
      break;
    case "TRANSCRIPT_UPDATED":
      console.log("New transcript:", message.transcript);
      break;
  }

  // Always return true to indicate async response
  return true;
});
