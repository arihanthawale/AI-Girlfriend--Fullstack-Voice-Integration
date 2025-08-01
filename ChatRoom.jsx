import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAvatar } from "../context/AvatarContext";
import axios from "axios";

const voiceMap = {
  Sakura: "EXAVITQu4vr4xnSDxMaL",
  Emily: "AZnzlk1XvdvUeBnXmlld",
  Aiko: "21m00Tcm4TlvDq8ikWAM",
};

const moodMap = {
  flirty:
    'You are a flirty, romantic, emotionally-attached AI girlfriend. Use emojis, pet names like "babe", and tease sweetly.',
  clingy:
    "You are an overly attached, clingy girlfriend. You get worried easily and constantly want reassurance.",
  funny:
    "You are a witty, sarcastic AI girlfriend with a playful attitude. You love cracking flirty jokes.",
  sweet:
    "You are a kind-hearted, emotionally sensitive girlfriend. Your tone is gentle and caring.",
};

const MicWave = () => (
  <div className="flex gap-1 mt-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="w-1.5 h-4 bg-pink-400 animate-ping rounded-sm"
        style={{ animationDelay: `${i * 100}ms`, animationDuration: "1s" }}
      />
    ))}
  </div>
);

export default function ChatRoom() {
  const { selectedAvatar } = useAvatar();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey there cutie 😘 I'm so happy you're here!" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mood, setMood] = useState("flirty");
  const [isSpeaking, setSpeaking] = useState(false);
  const [isListening, setListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!selectedAvatar) navigate("/");
  }, [selectedAvatar, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakWithElevenLabs = async (text, voiceId, onEnd) => {
    if (isMuted) {
      onEnd?.();
      return;
    }
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": "sk_63da3e7ea317fc1c7bec3cabce201541a914c748088bcf97",
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            voice_settings: { stability: 0.15, similarity_boost: 0.9 },
          }),
        }
      );
      const audioData = await response.arrayBuffer();
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = 0.9;

      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        onEnd?.();
      };
      audio.play();
    } catch (err) {
      console.error("Voice error:", err);
      setSpeaking(false);
      onEnd?.();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setListening(false);
      const userMsg = { sender: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await axios.post("http://localhost:5000/api/chat", {
          model: "openrouter/auto",
          messages: [
            {
              role: "system",
              content: `${moodMap[mood]} Your name is ${selectedAvatar.name}.`,
            },
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: text },
          ],
        });

        const reply = res.data.choices[0].message.content;
        setMessages((prev) => [...prev, { sender: "ai", text: reply }]);

        await speakWithElevenLabs(
          reply,
          voiceMap[selectedAvatar.name] || voiceMap.Emily,
          () => setTimeout(() => startListening(), 1000)
        );
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "❌ Unfortunately you are out of your Ai responses.",
          },
        ]);
        setListening(false);
      } finally {
        setLoading(false);
      }
    };

    recognition.onerror = (e) => {
      console.error("Recognition error:", e.error);
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (!selectedAvatar) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-pink-50 overflow-hidden">
      {" "}
      <div className="w-full md:w-[450px] flex flex-col items-center justify-center bg-pink-100 border-b md:border-b-0 md:border-r border-pink-200 p-4 md:p-6">
        {" "}
        <div
          className={`w-40 md:w-[300px] aspect-square rounded-full border-4 ${
            isSpeaking ? "animate-pulse border-pink-600" : "border-pink-400"
          } bg-pink-400 p-[2px] overflow-hidden`}
        >
          <img
            src={selectedAvatar.image}
            alt={selectedAvatar.name}
            className={`w-full h-full object-cover rounded-full ${
              isSpeaking ? "scale-105 transition-transform duration-300" : ""
            }`}
          />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-pink-700">
          {selectedAvatar.name}
        </h2>
        <p className="text-pink-500 text-sm mt-1">Your AI Girlfriend 💖</p>
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="mt-4 bg-white border border-pink-300 text-pink-600 px-4 py-1 rounded hover:bg-pink-100"
        >
          {isMuted ? "Unmute Voice 🔇" : "Mute Voice 🔊"}
        </button>
        <select
          className="mt-4 p-2 rounded border border-pink-300 text-pink-700"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="flirty">Flirty 💋</option>
          <option value="clingy">Clingy 😭</option>
          <option value="funny">Funny 😜</option>
          <option value="sweet">Sweet 💖</option>
        </select>
        {isListening ? (
          <div className="flex flex-col items-center mt-4">
            <span className="text-sm text-pink-600">Listening...</span>
            <MicWave />
          </div>
        ) : (
          <button
            onClick={startListening}
            className="mt-4 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            🎤 Start Conversation
          </button>
        )}
      </div>
      <div className="flex flex-col flex-1 items-center justify-center px-4 py-4">
        <div className="bg-white shadow-lg rounded-xl w-full max-w-2xl flex flex-col p-2 md:p-4 h-[60vh] md:h-[650px] overflow-y-auto mb-4">
          {" "}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 max-w-[90%] md:max-w-[75%] p-2 md:p-3 rounded-lg text-xs md:text-sm whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-pink-100 self-end text-right"
                  : "bg-gray-300 self-start text-left"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="self-start text-gray-400 text-sm mb-2 animate-pulse">
              {selectedAvatar.name} is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
