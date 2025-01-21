import "regenerator-runtime/runtime";
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = ({ commands }) => {
  const [transcribing, setTranscribing] = useState(true);
  const [clearTranscriptOnListen, setClearTranscriptOnListen] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ transcribing, clearTranscriptOnListen, commands });

  useEffect(() => {
    console.log('Component mounted, checking microphone permission...');
    checkMicrophonePermission();
  }, []);
  
  useEffect(() => {
    if (transcript) {
      chrome.runtime.sendMessage({ 
        type: 'TRANSCRIPT_UPDATED',
        transcript 
      });
    }
  }, [transcript]);

  const checkMicrophonePermission = async () => {
    console.log('Starting microphone permission check...');
    chrome.runtime.sendMessage({ type: 'MIC_PERMISSION_REQUESTED' });
  
    try {
      const perms = await chrome.permissions.contains({
        permissions: ['audioCapture']
      });
  
      if (!perms) {
        const granted = await chrome.permissions.request({
          permissions: ['audioCapture']
        });
        
        if (!granted) {
          chrome.runtime.sendMessage({ type: 'MIC_PERMISSION_DENIED' });
          setErrorMessage('Microphone permission denied');
          setHasMicPermission(false);
          return;
        }
      }
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicPermission(true);
        setErrorMessage('');
        chrome.runtime.sendMessage({ type: 'MIC_PERMISSION_GRANTED' });
      } catch (mediaError) {
        chrome.runtime.sendMessage({ 
          type: 'MIC_PERMISSION_DENIED',
          error: mediaError.message 
        });
        setErrorMessage(`Microphone access error: ${mediaError.message}`);
        setHasMicPermission(false);
      }
    } catch (error) {
      chrome.runtime.sendMessage({ 
        type: 'MIC_PERMISSION_DENIED',
        error: error.message 
      });
      setErrorMessage(`Permission error: ${error.message}`);
      setHasMicPermission(false);
    }
  };

  const startListening = async () => {
    try {
      if (!hasMicPermission) {
        await checkMicrophonePermission();
      }
      if (hasMicPermission) {
        chrome.runtime.sendMessage({ type: 'SPEECH_RECOGNITION_STARTED' });
        await SpeechRecognition.startListening({ continuous: true });
      }
    } catch (error) {
      chrome.runtime.sendMessage({ 
        type: 'SPEECH_RECOGNITION_ERROR',
        error: error.message 
      });
      setErrorMessage(`Start listening error: ${error.message}`);
    }
  };
  

  const toggleTranscribing = () => {
    console.log('Toggling transcribing:', !transcribing);
    setTranscribing(!transcribing);
  };

  const toggleClearTranscriptOnListen = () => {
    console.log('Toggling clearTranscriptOnListen:', !clearTranscriptOnListen);
    setClearTranscriptOnListen(!clearTranscriptOnListen);
  };

  if (!browserSupportsSpeechRecognition) {
    console.log('Browser does not support speech recognition');
    return (
      <div className="p-4 text-red-500">
        Browser doesn't support speech recognition.
      </div>
    );
  }

  if (!hasMicPermission) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">
          Microphone access is required
          {errorMessage && (
            <div className="mt-2 text-sm">
              Error details: {errorMessage}
            </div>
          )}
        </div>
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
        {errorMessage && (
          <div className="text-red-500 mt-2">
            {errorMessage}
          </div>
        )}
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