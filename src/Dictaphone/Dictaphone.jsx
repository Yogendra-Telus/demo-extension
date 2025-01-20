import "regenerator-runtime/runtime";
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = ({ commands }) => {
  const [transcribing, setTranscribing] = useState(true);
  const [clearTranscriptOnListen, setClearTranscriptOnListen] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ transcribing, clearTranscriptOnListen, commands });

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    if (interimTranscript !== '') {
      console.log('Got interim result:', interimTranscript);
    }
    if (finalTranscript !== '') {
      console.log('Got final result:', finalTranscript);
    }
  }, [interimTranscript, finalTranscript]);

  const checkMicrophonePermission = async () => {
    try {
      // Request microphone permission using Chrome extension API
      const result = await chrome.permissions.request({
        permissions: ['audioCapture']
      });
      
      if (result) {
        // Check if we can actually access the microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        setHasMicPermission(true);
      } else {
        setHasMicPermission(false);
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasMicPermission(false);
    }
  };

  const startListening = async () => {
    try {
      if (!hasMicPermission) {
        await checkMicrophonePermission();
      }
      if (hasMicPermission) {
        await SpeechRecognition.startListening({ continuous: true });
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const toggleTranscribing = () => setTranscribing(!transcribing);
  const toggleClearTranscriptOnListen = () => setClearTranscriptOnListen(!clearTranscriptOnListen);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 text-red-500">
        Browser doesn't support speech recognition.
      </div>
    );
  }

  if (!hasMicPermission) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">Microphone access is required</div>
        <button 
          onClick={checkMicrophonePermission}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Grant Microphone Access
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="text-sm">
        <div>Status: {listening ? 'Listening' : 'Not listening'}</div>
        <div>Transcribing: {transcribing ? 'On' : 'Off'}</div>
        <div>Clear on Listen: {clearTranscriptOnListen ? 'On' : 'Off'}</div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <button 
          onClick={resetTranscript}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          Reset
        </button>
        <button 
          onClick={toggleTranscribing}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Toggle Transcribing
        </button>
        <button 
          onClick={toggleClearTranscriptOnListen}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Toggle Clear on Listen
        </button>
        <button 
          onClick={startListening}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Start
        </button>
        <button 
          onClick={SpeechRecognition.stopListening}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Stop
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded min-h-[100px] max-h-[200px] overflow-y-auto">
        {transcript || 'Start speaking...'}
      </div>
    </div>
  );
};

export default Dictaphone;