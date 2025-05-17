export enum ClientMessageType {
    USER_MESSAGE = 'user_message',
    VOICE_TRANSCRIPT = 'voice_transcript',
    LOAD_VRM = 'load_vrm',
    PING = 'ping'
}

export enum ServerMessageType {
    LLM_RESPONSE_CHUNK = 'llm_response_chunk',
    LLM_RESPONSE_COMPLETE = 'llm_response_complete',
    TTS_AUDIO_READY = 'tts_audio_ready',
    ERROR_MESSAGE = 'error_message',
    VRM_LOADED = 'vrm_loaded',
    PONG = 'pong'
}

// Client to Server Messages
export interface ClientUserMessage {
    type: ClientMessageType.USER_MESSAGE;
    payload: {
        text: string;
        session_id?: string;
    };
}

export interface ClientVoiceTranscriptMessage {
    type: ClientMessageType.VOICE_TRANSCRIPT;
    payload: {
        transcript: string;
        is_final: boolean;
        session_id?: string;
    };
}

export interface ClientLoadVRMMessage {
    type: ClientMessageType.LOAD_VRM;
    payload: {
        model_id: string;
    };
}

export interface ClientPingMessage {
    type: ClientMessageType.PING;
}

export type ClientMessage =
    | ClientUserMessage
    | ClientVoiceTranscriptMessage
    | ClientLoadVRMMessage
    | ClientPingMessage;

// Server to Client Messages
export interface ServerLLMResponseChunk {
    type: ServerMessageType.LLM_RESPONSE_CHUNK;
    payload: {
        text_chunk: string;
        conversation_id: string;
    };
}

export interface ServerLLMResponseComplete {
    type: ServerMessageType.LLM_RESPONSE_COMPLETE;
    payload: {
        full_text: string;
        conversation_id: string;
    };
}

export interface ServerTTSAudioReady {
    type: ServerMessageType.TTS_AUDIO_READY;
    payload: {
        audio_url: string;
        text_for_lipsync: string;
        conversation_id: string;
    };
}

export interface ServerErrorMessage {
    type: ServerMessageType.ERROR_MESSAGE;
    payload: {
        message: string;
        code?: number;
    };
}

export interface ServerVRMLoadedMessage {
    type: ServerMessageType.VRM_LOADED;
    payload: {
        model_id: string;
        status: 'success' | 'error';
        message?: string;
    };
}

export interface ServerPongMessage {
    type: ServerMessageType.PONG;
}

export type ServerMessage =
    | ServerLLMResponseChunk
    | ServerLLMResponseComplete
    | ServerTTSAudioReady
    | ServerErrorMessage
    | ServerVRMLoadedMessage
    | ServerPongMessage; 