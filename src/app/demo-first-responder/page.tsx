'use client';

import { useEffect } from "react";

export default function DemoFirstResponder() {
    
    const fetchData = async (code: string) => {
        const response = await fetch(`/api/code?code=${encodeURIComponent(code)}`);
        if (response.ok) {
            const data = await response.json();
            // display data
            (document.getElementById("name") as HTMLSpanElement).innerText = data.name || 'N/A';
            (document.getElementById("age") as HTMLSpanElement).innerText = data.age || 'N/A';
            (document.getElementById("medicalConditions") as HTMLSpanElement).innerText = data.medicalConditions || 'N/A';
            (document.getElementById("emergencyContacts") as HTMLSpanElement).innerText = data.emergencyContacts ? data.emergencyContacts.join(', ') : 'N/A';
        } else {
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
                        fetchData(code);
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
        </div>
    )
}