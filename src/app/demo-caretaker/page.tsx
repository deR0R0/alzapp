'use client';

import { useEffect, useState, useRef } from "react";
import { Map, MapMarker, MapRoute, MarkerContent } from "@/components/ui/map";

export default function DemoCaretaker() {
    const [center, setCenter] = useState<[number, number] | null>(null);
    const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
    const [bounds, setBounds] = useState<{ topLeft: [number, number], bottomRight: [number, number] } | null>(null);
    const intervalRef = useRef<number | undefined>(undefined);

    const startPolling = (code: string) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
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
                if (data.length > 0) {
                    setCenter([data[data.length - 1].lat, data[data.length - 1].lng]);
                }
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
            if (data.bounds) {
                setBounds({
                    topLeft: data.bounds.topLeft,
                    bottomRight: data.bounds.bottomRight
                });
            } else {
                setBounds(null);
            }
        } else if (manual) {
            alert("Code not found");
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-sm space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Caretaker</h1>
                    <p className="text-sm text-slate-500">Look up patient info &amp; location</p>
                </div>

                {/* Code input */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700">Patient Code</h2>
                    </div>
                    <div className="px-4 py-4 flex gap-3">
                        <input
                            id="code"
                            type="number"
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter code"
                        />
                        <button
                            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm cursor-pointer"
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
                            Search
                        </button>
                    </div>
                </div>

                {/* Patient info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700">Patient Information</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { label: "Name", id: "name" },
                            { label: "Age", id: "age" },
                            { label: "Medical Conditions", id: "medicalConditions" },
                            { label: "Emergency Contacts", id: "emergencyContacts" },
                        ].map(({ label, id: fieldId }) => (
                            <div key={fieldId} className="px-4 py-3 flex items-start justify-between gap-4">
                                <span className="text-sm text-slate-500 shrink-0">{label}</span>
                                <span id={fieldId} className="text-sm font-medium text-slate-900 text-right">N/A</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700">Patient Location</h2>
                    </div>
                    <div className="w-full h-72">
                        {center ? (
                            <Map center={[center[1], center[0]]} zoom={15}>
                                <MapMarker longitude={center[1]} latitude={center[0]}>
                                    <MarkerContent>
                                        <div className="relative flex items-center justify-center">
                                            <div className="absolute size-4 rounded-full bg-blue-500/30 animate-ping" />
                                            <div className="size-3 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                                        </div>
                                    </MarkerContent>
                                </MapMarker>
                                <MapRoute coordinates={points.map(s => [s.lng, s.lat])} />
                                {bounds && [
                                    { lat: bounds.topLeft[0], lng: bounds.topLeft[1] },
                                    { lat: bounds.bottomRight[0], lng: bounds.bottomRight[1] },
                                ].map((sel, i) => (
                                    <MapMarker key={`sel-${i}`} longitude={sel.lng} latitude={sel.lat}>
                                        <MarkerContent>
                                            <div className="relative flex items-center justify-center">
                                                <div className="absolute size-5 rounded-full bg-red-500/20 animate-pulse" />
                                                <div className="size-3 rounded-full bg-red-500 border-2 border-white shadow-md" />
                                            </div>
                                        </MarkerContent>
                                    </MapMarker>
                                ))}
                            </Map>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                Enter a code to see patient location
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700">Safe Zone Bounds</h2>
                    </div>
                    <div className="px-4 py-3">
                        {bounds ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Top-Left</span>
                                    <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                                        {bounds.topLeft[0].toFixed(5)}, {bounds.topLeft[1].toFixed(5)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Bottom-Right</span>
                                    <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                                        {bounds.bottomRight[0].toFixed(5)}, {bounds.bottomRight[1].toFixed(5)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-emerald-600 font-medium">Bounds set</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                No bounds set for this patient
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}