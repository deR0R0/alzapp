'use client';

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function UserMarker() {
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    }, []);

    if (!position) return null;

    return (
        <Marker position={position}>
            <Popup>Your current location</Popup>
        </Marker>
    );
}


export default function DemoUser() {
    const [code, setCode] = useState<string>("");

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
            <div className="w-80 h-80 mt-10 mx-auto">
    <MapContainer 
        center={[37.7749, -122.4194]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} // fill the parent div
    >
        <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
        />
        <UserMarker />
    </MapContainer>
</div>


            { /* code for first responders */ }
            <div className="bg-zinc-300 w-80 h-30 mt-10 mx-auto items-center justify-center flex text-3xl">
                FR CODE: {code}
            </div>
        </div>
    )
}