
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';

// Manually load env file since we are not using vite
try {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.error("Error loading .env.local", e);
}

async function listModels() {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Note: listModels is on the genAI instance or model manager?
    // SDK 0.2.0+ has it on GoogleGenerativeAI instance maybe? 
    // Actually usually it's not directly exposed in the client SDK easily for browser, but check node usage.
    // Actually, wait, the client SDK might not expose listModels easily. 

    // Let's just try to generate content with gemini-1.5-flash and see if it works here.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Testing gemini-1.5-flash...");
    try {
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash");
        console.log(result.response.text());
    } catch (e) {
        console.error("Failed gemini-1.5-flash:", e.message);
    }

    const model2 = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    // gemini-pro-vision is deprecated/legacy maybe?

    const model3 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log("Testing gemini-1.5-pro...");

    try {
        const result = await model3.generateContent("Hello");
        console.log("Success with gemini-1.5-pro");
        console.log(result.response.text());
    } catch (e) {
        console.error("Failed gemini-1.5-pro:", e.message);
    }
}

listModels();
