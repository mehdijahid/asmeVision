import { GoogleGenAI, createUserContent, createPartFromUri, } 
from "@google/genai"; 
const ai = new GoogleGenAI
({apiKey:"AIzaSyBLU6RDQdgFsvM35jiP4v9dk9YYgQaasMo"}); 
async function main() { 
    const image = await ai.files.upload({ file: "images.jpg", }); 
    const response = await ai.models.generateContent(
        { model: "gemini-2.5-flash", contents: [ createUserContent([ 
            "Tell me about this image and say hello in the beggining in three lines and don't forget to describe the background", 
            createPartFromUri(image.uri, image.mimeType), ]), ], }); 
            console.log(response.text); } 
await main();