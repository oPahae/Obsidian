"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Voice() {
    const [isCalling, setIsCalling] = useState(false);
    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerConnections = useRef({});
    const config = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then(stream => {
                if (localAudioRef.current) {
                    localAudioRef.current.srcObject = stream;
                }
                socket.on("offer", async (id, description) => {
                    const pc = new RTCPeerConnection(config);
                    peerConnections.current[id] = pc;

                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    pc.ontrack = (event) => {
                        console.log("🔊 Audio reçu :", event.streams);
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = event.streams[0];
                        }
                    };

                    await pc.setRemoteDescription(new RTCSessionDescription(description));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socket.emit("answer", id, pc.localDescription);
                });

                socket.on("answer", (id, description) => {
                    peerConnections.current[id]?.setRemoteDescription(new RTCSessionDescription(description));
                });

                socket.on("candidate", (id, candidate) => {
                    peerConnections.current[id]?.addIceCandidate(new RTCIceCandidate(candidate));
                });

                socket.on("call-user", async (id) => {
                    const pc = new RTCPeerConnection(config);
                    peerConnections.current[id] = pc;

                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    pc.ontrack = (event) => {
                        console.log("🔊 Audio reçu :", event.streams);
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = event.streams[0];
                        }
                    };

                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit("candidate", id, event.candidate);
                        }
                    };

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    socket.emit("offer", id, pc.localDescription);
                });
            })
            .catch(err => console.error("Erreur lors de l'accès au microphone :", err));

        return () => {
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
            socket.off("call-user");
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-2xl font-bold mb-4">Appel vocal WebRTC</h1>
            <audio ref={localAudioRef} autoPlay controls className="mb-4" />
            <audio ref={remoteAudioRef} autoPlay controls />
            <button
                onClick={() => {
                    socket.emit("call-user", socket.id);
                    setIsCalling(true);
                }}
                className="bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded mt-4"
            >
                {isCalling ? "Appel en cours..." : "Démarrer l'appel"}
            </button>
        </div>
    );
}