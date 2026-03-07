'use client';

import { Map, MapControls, MapMarker, MarkerContent } from "@/components/ui/map";
import { useEffect, useState } from "react";

export default function DemoUser() {
    const [code, setCode] = useState<string>("");
    const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
    const [center, setCenter] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        // generate a code
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setCode(generatedCode);

        // send it to the server function
        const sendCodeToServer = async (code: string) => {
            await fetch("/api/code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code,
                    data: typeof window !== 'undefined' && localStorage.getItem("info") ? JSON.parse(localStorage.getItem("info") || '{}') : {}
                })
            });
        }

        // only send if we have info and we're in the browser
        if (typeof window !== 'undefined' && localStorage.getItem("info")) {
            sendCodeToServer(generatedCode);
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCenter([latitude, longitude]);
            setPoints([{ lat: latitude, lng: longitude }]);
        }, (error) => {
            console.error("Error getting location:", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        // update location
        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setPoints(prev => [...prev, { lat: latitude, lng: longitude }]);
            setCenter([latitude, longitude]);
            console.log("Updated location:", latitude, longitude);
        }, (error) => {
            console.error("Error watching location:", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
        }
    }, [])
    
    const setInfo = () => {
        const name = prompt("Enter your name:", "John Doe");
        const age = prompt("Enter your age:", "75");
        const medicalConditions = prompt("Enter any medical conditions:", "Diabetes, Hypertension");
        const emergencyContacts = prompt("Enter emergency contacts (comma separated):", "Jane Doe: 123-456-7890, Dr. Smith: 987-654-3210");
        localStorage.setItem("info", JSON.stringify({
            name,
            age,
            medicalConditions,
            emergencyContacts: emergencyContacts?.split(',').map(contact => contact.trim())
        }));
        alert("Information saved!");
    }

    const setMedications = () => {
        const meds = prompt("Enter your medications (comma separated):", "Aspirin 100mg, Lisinopril 10mg");
        const times = prompt("Enter the times you take them (comma separated):", "8:00 AM, 8:00 PM");
        const locations = prompt("Enter where you last put each one (comma separated):", "Bathroom cabinet, Kitchen drawer");

        const medList = meds?.split(',').map(m => m.trim()) || [];
        const timeList = times?.split(',').map(t => t.trim()) || [];
        const locationList = locations?.split(',').map(l => l.trim()) || [];

        const medObjects = medList.map((name, idx) => ({
        name,
        time: timeList[idx] || "",
        location: locationList[idx] || ""
        }));

        const info = JSON.parse(localStorage.getItem("info") || "{}");
        info.medications = medObjects;
        localStorage.setItem("info", JSON.stringify(info));

        alert("Medications saved!");
    };

    const updateLocation = (position: any) => {
        const { latitude, longitude } = position.coords;
        setPoints(prev => [...prev, { lat: latitude, lng: longitude }]);
        setCenter([latitude, longitude]);
        console.log("Updated location:", latitude, longitude);
    }

    return (
        <div className="content flex flex-col">
            { /* buttons */ }
            <div className="emergency flex flex-col mx-auto mt-10">
                { /* set details */ }
                <button 
                    className="bg-zinc-500 p-2 mb-3 rounded-xl"
                    onClick={setInfo}
                >
                    Set Info
                </button>
                <div className="flex flex-row gap-x-3">
                    { /* Emergency */ }
                    <button 
                        className="bg-blue-400 p-5 px-7 rounded-2xl cursor-pointer hover:bg-blue-500 transition-colors"
                        onClick={() => alert('Contacting family members and first responders...')}
                    >
                        Contact Family
                    </button>
                    <button 
                        className="bg-red-400 p-5 px-7 rounded-2xl cursor-pointer hover:bg-red-500 transition-colors"
                        onClick={() => alert('EMERGENCY SERVICES CALLED! Help is on the way!')}
                    >
                        EMERGENCY
                    </button>
                </div>
            </div>
            <div className="w-80 h-100 mt-10 mx-auto">
                {center[0] !== 0 && center[1] !== 0 && (
                    <Map center={[center[1], center[0]]} zoom={15}>
                        <MapMarker longitude={center[1]} latitude={center[0]}>
                            <MarkerContent>
                                <div className="relative flex items-center justify-center">
                                <div className="absolute size-4 rounded-full bg-blue-500/30 animate-ping" />
                                <div className="size-3 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                                </div>
                            </MarkerContent>
                        </MapMarker>
                    </Map>
                )}
            </div>

            { /* code for first responders */ }
            <div className="bg-zinc-300 w-80 h-30 mt-10 mx-auto items-center justify-center flex text-3xl">
                FR CODE: {code}
            </div>
        </div>
    )
}