import { NextRequest } from "next/server";

import { LanguageModelV1, streamText } from "ai";

import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';

import { Models } from "@/types/models";
import { SolanaTokenPageTopHoldersAction, solanaTools } from "@/ai";
import { Connection } from "@solana/web3.js";

const system = (address: string) =>
`You are a blockchain agent that is specialized in the token with the address ${address}.`

export const POST = async (req: NextRequest, { params }: { params: Promise<{ address: string }> }) => {

    console.log("POST /api/chat/token/[address]");

    const { address } = await params;

    const { messages, modelName } = await req.json();

    console.log("messages", messages);
    console.log("modelName", modelName);
    
    let MAX_TOKENS: number | undefined = undefined;
    let model: LanguageModelV1 | undefined = undefined;

    if (modelName === Models.OpenAI) {
        model = openai("gpt-4o-mini");
        MAX_TOKENS = 128000;
    }

    if (modelName === Models.Anthropic) {
        model = anthropic("claude-3-5-sonnet-latest");
        MAX_TOKENS = 190000;
    }

    if (modelName === Models.XAI) {
        model = xai("grok-beta");
        MAX_TOKENS = 131072;
    }

    if (modelName === Models.Gemini) {
        model = google("gemini-2.0-flash-exp");
        MAX_TOKENS = 1048576;
    }

    if (modelName === Models.Deepseek) {
        model = deepseek("deepseek-chat") as LanguageModelV1;
        MAX_TOKENS = 64000;
    }

    if (!model || !MAX_TOKENS) {
        throw new Error("Invalid model");
    }

    // Add message token limit check
    let tokenCount = 0;
    const truncatedMessages = [];
    
    // Process messages from newest to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        // Rough token estimation: 4 chars ≈ 1 token
        const estimatedTokens = Math.ceil((msg.content?.length || 0) / 4);
        
        if (tokenCount + estimatedTokens <= MAX_TOKENS) {
            truncatedMessages.unshift(msg);
            tokenCount += estimatedTokens;
        } else {
            break;
        }
    }

    let streamTextResult = streamText({
        model,
        messages: truncatedMessages,
        system: system(address),
        tools: solanaTools(
            new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!), 
            [new SolanaTokenPageTopHoldersAction(address)]
        )
    });

    return streamTextResult.toDataStreamResponse();
}