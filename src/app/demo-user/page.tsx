'use client';

import { Map, MapControls, MapMarker, MapRoute, MarkerContent, useMap } from "@/components/ui/map";
import { useCallback, useEffect, useState } from "react";

const CLICK_THRESHOLD = 0.0003; // ~30m at equator, good for map click proximity

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const handleClick = (e: maplibregl.MapMouseEvent) => {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
        };

        map.on("click", handleClick);
        return () => { map.off("click", handleClick); };
    }, [map, onMapClick]);

    return null;
}

export default function DemoUser() {
    const [code, setCode] = useState<string>("");
    const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
    const [center, setCenter] = useState<[number, number]>([0, 0]);
    const [locationUpdates, setLocationUpdates] = useState<number>(0);
    const [settingBounds, setSettingBounds] = useState<boolean>(false);
    const [selections, setSelections] = useState<{ lat: number; lng: number }[]>([]);
    const [bounds, setBounds] = useState<{ topLeft: [number, number]; bottomRight: [number, number] } | null>(null);

    useEffect(() => {
        let watchId: number | null = null;
        (async () => {
        // see if we already have a code
        let generatedCode = localStorage.getItem("code");
        if(!generatedCode) {
            generatedCode = await createNewUser();
            if (generatedCode !== "-1") {
                localStorage.setItem("code", generatedCode);
            } else {
                alert("Error creating user. Please refresh the page.");
                return;
            }
        }

        // ensure code is in server, if not re-sync it
        const res = await fetch("/api/info/exists?code=" + encodeURIComponent(generatedCode || ""));
        if (!res.ok) {
            console.log("Code not found on server, re-syncing...");
            const localInfo = localStorage.getItem("info");
            if (localInfo) {
                await fetch("/api/info/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: generatedCode, data: JSON.parse(localInfo) })
                });
            }
        }

        setCode(generatedCode || "");

        // sync local info with server
        const localInfo = localStorage.getItem("info");
        if (localInfo) {
            fetch("/api/info/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: generatedCode,
                    data: JSON.parse(localInfo)
                })
            }).then(response => {
                if (!response.ok) {
                    console.error("Failed to sync info with server");
                }
            });
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            updateLocation(generatedCode || "", latitude, longitude);
            console.log("Initial location:", latitude, longitude);
        }, (error) => {
            console.error("Error getting location:", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        // update location
        watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            updateLocation(generatedCode || "", latitude, longitude);
            console.log("Updated location:", latitude, longitude);
            console.log("Current points:", [...points, { lat: latitude, lng: longitude }]);
        }, (error) => {
            console.error("Error watching location:", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        })();
        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, [])

    const updateLocation = (userCode: string, lat: number, lng: number) => {
        setPoints(prev => [...prev, { lat, lng }]);
        setCenter([lat, lng]);
        setLocationUpdates(prev => prev + 1);

        if(locationUpdates >= 5) {
            setLocation(userCode);
            setLocationUpdates(0);
            return;
        }

        console.log("send location update to server", userCode, lat, lng);
        if(userCode) {
            fetch("/api/location/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: userCode,
                    lat,
                    lng
                })
            }).then(response => {
                if (!response.ok) {
                    console.error("Failed to send location to server");
                }
            });
        }
    }

    const setLocation = (userCode: string) => {
        if(userCode) {
            fetch("/api/location/replace", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: userCode,
                    coords: points
                })
            });
        }
    }

    const createNewUser = async (): Promise<string> => {
        // prompt for a name if it doesn't exist
        let name = localStorage.getItem("info") ? JSON.parse(localStorage.getItem("info") || "{}").name : null;
        if (!name) {
            setInfo();
            name = JSON.parse(localStorage.getItem("info") || "{}").name;
        }

        // send a request to the server
        const response = await fetch("/api/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: localStorage.getItem("info"),
        });
        return await response.text();
    }
    
    // Handle map click: toggle existing dot or add new (max 2)
    const handleMapClick = useCallback((lat: number, lng: number) => {
        setSelections(prev => {
            // Check if click is near an existing dot
            const existingIdx = prev.findIndex(
                p => Math.abs(p.lat - lat) < CLICK_THRESHOLD && Math.abs(p.lng - lng) < CLICK_THRESHOLD
            );
            if (existingIdx !== -1) {
                // Remove the dot
                return prev.filter((_, i) => i !== existingIdx);
            }
            if (prev.length >= 2) {
                // Already have 2 dots, ignore
                return prev;
            }
            return [...prev, { lat, lng }];
        });
    }, []);

    // Compute bounds whenever selections change
    useEffect(() => {
        if (selections.length === 2) {
            const [a, b] = selections;
            const topLeft: [number, number] = [Math.max(a.lat, b.lat), Math.min(a.lng, b.lng)];
            const bottomRight: [number, number] = [Math.min(a.lat, b.lat), Math.max(a.lng, b.lng)];
            const newBounds = { topLeft, bottomRight };
            setBounds(newBounds);

            // Persist to localStorage info
            const info = localStorage.getItem("info");
            if (info) {
                const parsed = JSON.parse(info);
                parsed.bounds = newBounds;
                localStorage.setItem("info", JSON.stringify(parsed));
            }
        } else {
            setBounds(null);
        }
    }, [selections]);

    const setInfo = () => {
        const name = prompt("Enter your name:", "John Doe");
        const age = prompt("Enter your age:", "75");
        const medicalConditions = prompt("Enter any medical conditions:", "Diabetes, Hypertension");
        const emergencyContacts = prompt("Enter emergency contacts (comma separated):", "Jane Doe: 123-456-7890, Dr. Smith: 987-654-3210");
        localStorage.setItem("info", JSON.stringify({
            name,
            age,
            medicalConditions,
            emergencyContacts: emergencyContacts?.split(',').map(contact => contact.trim()),
            bounds: {
                "topLeft": [0, 0],
                "bottomRight": [0, 0]
            }
        }));
        alert("Information saved!");
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-sm space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Dashboard</h1>
                        <p className="text-sm text-slate-500">Safety tracking active</p>
                    </div>
                    <button
                        className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
                        onClick={setInfo}
                    >
                        Edit Info
                    </button>
                </div>

                {/* Emergency buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        className="flex flex-col items-center gap-2 bg-white border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                        onClick={() => alert('Contacting family members and first responders...')}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition-colors">
                            📞
                        </div>
                        <span className="font-semibold text-sm text-blue-700">Contact Family</span>
                    </button>
                    <button
                        className="flex flex-col items-center gap-2 bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer group"
                        onClick={() => alert('EMERGENCY SERVICES CALLED! Help is on the way!')}
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg group-hover:bg-red-200 transition-colors">
                            🚨
                        </div>
                        <span className="font-bold text-sm text-red-700">EMERGENCY</span>
                    </button>
                </div>

                {/* Map */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700">Live Location</h2>
                    </div>
                    <div className="w-full h-72">
                        {center[0] !== 0 && center[1] !== 0 ? (
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
                                <MapClickHandler onMapClick={handleMapClick} />
                                {selections.map((sel, i) => (
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
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                                    <span>Acquiring location...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bounds */}
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
                            <div className="text-center py-2">
                                <p className="text-sm text-slate-400">
                                    Tap the map to place {2 - selections.length} bound marker{2 - selections.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    {[0, 1].map(i => (
                                        <div
                                            key={i}
                                            className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                                                i < selections.length
                                                    ? 'bg-red-500 border-red-500'
                                                    : 'bg-transparent border-slate-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Responder code */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700">First Responder Code</h2>
                    </div>
                    <div className="px-4 py-5 flex items-center justify-center">
                        {code ? (
                            <span className="text-4xl font-bold tracking-[0.2em] text-slate-900 font-mono">{code}</span>
                        ) : (
                            <span className="text-sm text-slate-400">Generating code...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}