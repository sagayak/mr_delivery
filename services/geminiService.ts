import { GoogleGenAI } from "@google/genai";
import { Order } from '../types';

export const getOptimizedRoute = async (orders: Order[]): Promise<string> => {
    if (!process.env.API_KEY) {
        // In a real app, you'd want to handle this more gracefully.
        // For this context, we assume the key is present.
        return "Error: API key is not configured.";
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const undeliveredOrders = orders.filter(order => !order.isDelivered);
    if (undeliveredOrders.length === 0) {
        return "All orders for today have been delivered!";
    }

    const addresses = undeliveredOrders.map(order => order.address).join('\n');

    const prompt = `
        You are a delivery route optimization assistant for a food delivery service called "Mane Rotti".
        Your task is to create the most efficient delivery route based on a list of addresses within a large residential complex.

        Instructions:
        1. Group the deliveries by tower number in ascending order.
        2. Within each tower, list the deliveries by floor number in ascending order.
        3. Present the final route as a clear, numbered list. Each item should be the full address.

        Here are the addresses for today's deliveries:
        ${addresses}

        Provide only the optimized route as a numbered list.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Could not generate a route. The API call failed. Please check your API key and network connection.";
    }
};
