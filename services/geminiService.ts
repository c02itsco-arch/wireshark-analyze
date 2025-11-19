import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// FIX: Aligned with coding guidelines to use process.env.API_KEY directly and
// assume it is always available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysisSummary: {
      type: Type.STRING,
      description: "A concise summary of the cybersecurity analysis and identified threats in Markdown format."
    },
    graphData: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The unique identifier for the node, typically an IP address." },
              type: { type: Type.STRING, description: "The type of node, e.g., 'source_ip', 'destination_ip', 'internal_ip', 'external_ip'." },
              threatLevel: { type: Type.STRING, description: "A classification of the threat level: 'low', 'medium', 'high', or 'none'." }
            },
            required: ["id", "type", "threatLevel"]
          }
        },
        links: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING, description: "The ID of the source node (an IP address)." },
              target: { type: Type.STRING, description: "The ID of the target node (an IP address)." },
              port: { type: Type.NUMBER, description: "The destination port used in the communication." },
              count: { type: Type.NUMBER, description: "The number of connections or packets for this link." }
            },
            required: ["source", "target", "port", "count"]
          }
        }
      },
      required: ["nodes", "links"]
    }
  },
  required: ["analysisSummary", "graphData"]
};


export const analyzePcapData = async (csvData: string): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert cybersecurity analyst. Your task is to analyze the following network traffic data, which is provided in CSV format from a PCAP file.

    Analyze the data to identify patterns, anomalies, and potential security threats. Classify any identified threats (e.g., Port Scanning, Malware C2 Communication, Unusual Protocol Activity, Data Exfiltration).

    Based on your analysis, provide two things:
    1. A concise, human-readable summary of your findings in Markdown format. Describe the potential threats and explain the relationships you discovered.
    2. A structured JSON object representing the relationships between the entities in the data. This JSON will be used to generate a force-directed graph. The JSON object must conform to the provided schema.

    Entities for the graph are source IPs, destination IPs, and ports. Create nodes for unique IPs and links for communication between them, including the port and connection count. Mark high-risk entities accordingly.

    Here is the CSV data:
    ---
    ${csvData}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const responseText = response.text;
    if (!responseText) {
        throw new Error("Received an empty response from the API.");
    }

    const parsedResult = JSON.parse(responseText);
    
    // Basic validation
    if (!parsedResult.analysisSummary || !parsedResult.graphData || !parsedResult.graphData.nodes || !parsedResult.graphData.links) {
        throw new Error("API response is missing required fields.");
    }

    return parsedResult as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini API. The model may have been unable to process the data.");
  }
};
