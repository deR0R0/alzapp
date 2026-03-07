'use client';

import { useEffect, useState, useRef } from "react";
import { Map, MapMarker, MapRoute, MarkerContent } from "@/components/ui/map";

export default function DemoFirstResponder() {
    const [center, setCenter] = useState<[number, number] | null>(null);
    const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
    const intervalRef = useRef<number | undefined>(undefined);

    const startPolling = (code: string) => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        // Start new interval
        intervalRef.current = window.setInterval(() => updateInformation(code), 2500);
    };

    useEffect(() => {
        const initializeEffect = async () => {
            let code = document.getElementById("code") as HTMLInputElement;
            if (!code) {
                console.error("Code input element not found");
                return;
            }
            code.value = localStorage.getItem("code") || "";
            if(code.value === "") {
                return; // wait for user to input code
            }
            await updateInformation(code.value);
            startPolling(code.value);
        };
        initializeEffect();
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [])

    const updateInformation = async (code: string, manual: boolean = false) => {
        await fetchData(code, manual);
        await updateLocation(code);
        console.log("Information updated");
    }

    const updateLocation = async (code: string) => {
        fetch("/api/location/get?code=" + encodeURIComponent(code)).then(async response => {
            if (response.ok) {
                const data = await response.json();
                setPoints(data)
                setCenter([data[data.length - 1].lat, data[data.length - 1].lng]);
                console.log("Location updated:", data);
            } else {
                console.error("Failed to fetch location data");
            }
        }).catch(error => {
            console.error("Error fetching location data:", error);
        });
    }
    
    const fetchData = async (code: string, manual: boolean = false) => {
        const response = await fetch(`/api/info/get?code=${encodeURIComponent(code)}`);
        if (response.ok) {
            const data = await response.json();
            // display data
            (document.getElementById("name") as HTMLSpanElement).innerText = data.name || 'N/A';
            (document.getElementById("age") as HTMLSpanElement).innerText = data.age || 'N/A';
            (document.getElementById("medicalConditions") as HTMLSpanElement).innerText = data.medicalConditions || 'N/A';
            (document.getElementById("emergencyContacts") as HTMLSpanElement).innerText = data.emergencyContacts ? data.emergencyContacts.join(', ') : 'N/A';
        } else if (manual) {
            alert("Code not found");
        }
    }

    return (
        <div className="content flex flex-col">
            <input id="code" type="number" className="border-2 border-black rounded-xl p-2 mt-10 mx-auto text-center" placeholder="Enter Code" />
            <button
                onClick={() => {
                    const codeInput = document.getElementById("code") as HTMLInputElement;
                    const code = codeInput.value.trim();
                    if (code) {
                        updateInformation(code, true);
                        startPolling(code);
                    } else {
                        alert("Please enter a valid code.");
                    }
                }}
            >
                Submit
            </button>

            <div id="info" className="mt-10 mx-auto">
                <h2 className="text-2xl font-bold mb-5">Patient Info</h2>
                <p><strong>Name:</strong> <span id="name">N/A</span></p>
                <p><strong>Age:</strong> <span id="age">N/A</span></p>
                <p><strong>Medical Conditions:</strong> <span id="medicalConditions">N/A</span></p>
                <p><strong>Emergency Contacts:</strong> <span id="emergencyContacts">N/A</span></p>
            </div>

            <div className="w-80 h-100 mt-10 mx-auto">
                {center && (
                    <Map center={[center[1], center[0]]} zoom={15}>
                        <MapMarker longitude={center[1]} latitude={center[0]}>
                            <MarkerContent>
                                <div className="relative flex items-center justify-center">
                                <div className="absolute size-4 rounded-full bg-blue-500/30 animate-ping" />
                                <div className="size-3 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                                </div>
                            </MarkerContent>
                        </MapMarker>
                        <MapRoute coordinates={points.map(s => [s.lng, s.lat])}></MapRoute>
                    </Map>
                )}
            </div>
        </div>
    )
}