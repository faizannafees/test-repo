import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import confetti from 'canvas-confetti';
import { GrPowerReset } from "react-icons/gr";

const WEIGHTS_URL =
    'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';

const compliments = [
    "That smile lights up my world!",
    "You make every day brighter ❤️",
    "Remember our first sunset together?",
    "I love the way you laugh!"
];

const voiceNotes = [
    'dummy-29502.mp3',
    'dummy-laugh-voiced-54997.mp3',
    'insects-69446.mp3',
    'thud-82914.mp3'
];

export default function SmileMirror() {
    const videoRef = useRef();
    const audioRef = useRef(new Audio());
    const intervalRef = useRef(null);
    const [message, setMessage] = useState('Smile at the camera 😊');

    useEffect(() => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(WEIGHTS_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(WEIGHTS_URL),
        ]).then(startCamera);
        return () => clearInterval(intervalRef.current);
    }, []);

    function startCamera() {
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then(stream => {
                videoRef.current.srcObject = stream;
            })
            .catch(() => setMessage('😞 Webcam access denied'));
    }

    function handlePlay() {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(async () => {
            const detection = await faceapi
                .detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceExpressions();

            if (detection?.expressions?.happy > 0.9) {
                clearInterval(intervalRef.current);
                triggerSurprise();
            }
        }, 200);
    }

    function triggerSurprise() {
        confetti({ particleCount: 150, spread: 60 });
        const note = voiceNotes[Math.floor(Math.random() * voiceNotes.length)];
        audioRef.current.src = `/${note}`;
        audioRef.current.play();

        let remaining = JSON.parse(localStorage.getItem('remainingCompliments') || '[]');
        if (remaining.length === 0) {
            remaining = [...compliments];
        }
        const idx = Math.floor(Math.random() * remaining.length);
        const choice = remaining.splice(idx, 1)[0];
        localStorage.setItem('remainingCompliments', JSON.stringify(remaining));
        setMessage(choice);
    }

    function onceMore() {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setMessage('Smile at the camera 😊');
        clearInterval(intervalRef.current);
        handlePlay();
    }

    function reset() {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setMessage('Smile at the camera 😊');
        clearInterval(intervalRef.current);
        localStorage.removeItem('remainingCompliments');
        handlePlay();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-gray-800 p-6">
            <h1 className="text-2xl font-extrabold mb-8 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-bounce">
                💖 Smile Mirror 💖
            </h1>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-400 bg-white/30 backdrop-blur-lg">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    width="340"
                    height="260"
                    onPlay={handlePlay}
                    className="rounded-2xl"
                />
                <div className="absolute inset-0 rounded-3xl border-4 border-transparent hover:border-pink-500 transition-all duration-500"></div>
            </div>

            <div className="mt-6 text-2xl font-bold text-center text-pink-800 bg-white/60 px-8 py-4 rounded-2xl shadow-lg border border-pink-300 backdrop-blur-sm animate-pulse">
                {message}
            </div>

            <div className="mt-8 flex gap-6">
                <button
                    onClick={onceMore}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:from-pink-400 hover:to-pink-600 transition transform hover:scale-110 hover:rotate-1 font-bold"
                >
                    🌸 Once More
                </button>
                <button
                    onClick={reset}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg hover:from-purple-400 hover:to-purple-600 transition transform hover:scale-110 hover:-rotate-1 font-bold flex items-center gap-2"
                >
                    <GrPowerReset size={18} /> Reset
                </button>
            </div>
        </div>
    );
}
