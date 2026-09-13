"use client";

import { useState, Fragment } from "react";
import { useChat } from "@ai-sdk/react";


import {
    PromptInput,
    PromptInputBody,
    PromptInputFooter,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
    Message,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Spinner } from "@/components/ui/spinner";


export default function RAGChatBot() {

    const [input, setInput] = useState("");
    const { messages, sendMessage, status, error } = useChat();

    const handleSubmit = (message: PromptInputMessage) => {
        if (!message.text) return;
        sendMessage({ text: message.text });
        setInput("");
    }

    return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem) ]">
        <div className="flex flex-col h-full">
            <Conversation className="h-full">
                <ConversationContent>
                    {
                        messages.map((message) => (
                            <div key={message.id}>
                                {message.parts.map((part, i) => {
                                    switch (part.type) {
                                        case "text":
                                            return (
                                                <Fragment key={`${message.id}-${i}`}>
                                                    <Message from={message.role}>
                                                        <MessageContent>
                                                            <MessageResponse>
                                                                {part.text}
                                                            </MessageResponse>
                                                        </MessageContent>
                                                    </Message>
                                                </Fragment>
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                            </div>
                        ))
                    }
                    {(status === "submitted" || status === "streaming") && <Spinner />}
                    {error && (
                        <p className="text-sm text-destructive">
                            Unable to get a response. Check the server logs for the provider error.
                        </p>
                    )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>
            <PromptInput onSubmit={handleSubmit} className="mt-4">
                <PromptInputBody>
                    <PromptInputTextarea value={input} onChange={(e) => setInput(e.target.value)} />
                </PromptInputBody>
                <PromptInputFooter>
                    <PromptInputTools>  </PromptInputTools>
                    <PromptInputSubmit />
                </PromptInputFooter>
            </PromptInput>
        </div>
    </div>
    )
}