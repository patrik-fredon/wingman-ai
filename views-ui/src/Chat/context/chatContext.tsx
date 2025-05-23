import { ChatMessages, ChatMessage, AppMessage, Message, CodeReviewMessage, CodeContext } from "@shared/types/Message";
import { AppState } from "@shared/types/Settings";
import { createContext, useContext, useState, PropsWithChildren, FC, useEffect } from "react";
import { vscode } from "../utilities/vscode";

interface ChatContextType {
  messages: ChatMessages;
  loading: boolean;
  setLoading: (isLoading: boolean) => void,
  activeMessage: Message | undefined,
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  clearActiveMessage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatContext must be used within ChatProvider");
  return context;
};

export const ChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const [appState, setAppState] = useState<AppState | null>();
  const [messages, setMessages] = useState<ChatMessages>([]);
  const [loading, setChatLoading] = useState<boolean>(false);
  const [activeMessage, setActiveMessage] = useState<Message | undefined>();

  useEffect(() => {
    const handleResponse = (event: MessageEvent<AppMessage>) => {
      const { command, value } = event.data;
      switch (command) {
        case "init":
          const storedAppState = value as AppState;
          setAppState(storedAppState);
          setMessages(storedAppState.settings.chatMessages || []);
          break;
        case "response":
          if (!value) {
            return;
          }
  
          setActiveMessage((prevMessage) => {
            const updatedMessage = {
              loading: true,
              context: undefined,
              from: "assistant",
              ...prevMessage,
              message: !prevMessage?.message ? String(value) : prevMessage.message += String(value),
              type: "chat",
            } satisfies Message;
            
            return updatedMessage;
          });
          break;
        case "done":
          setActiveMessage((currentMessage) => {
            if (currentMessage) {
              addMessage(currentMessage);
              setLoading(false);
              setTimeout(() => clearActiveMessage(), 0);
            }
            return currentMessage;
          });
          break;
        case "code-review-failed":
          addMessage({
            from: "assistant",
            loading: false,
            message: "Sorry I have failed to generate a code review, please ensure Git is available locally",
            type: "chat"
          });
          setActiveMessage(undefined);
          break;
        case "code-review-result":
          addMessage({
            ...(value as CodeReviewMessage),
          });
          setActiveMessage(undefined);
          break;
        case "context":
          setActiveMessage((prevMessage) => {
            const updatedMessage = {
              loading: true,
              from: "assistant",
              ...prevMessage,
              message: prevMessage?.message || "",
              context: value as CodeContext,
              type: "chat",
            } satisfies Message;
            
            return updatedMessage;
          });
          break;
      }
    };

    window.addEventListener("message", handleResponse);
    return () => window.removeEventListener("message", handleResponse);
  }, []);

  useEffect(() => {
    if (!appState) return;

    const newState: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        chatMessages: messages,
      },
    };

    setAppState(newState);
    vscode.postMessage({
      command: "state-update",
      value: newState,
    });
  }, [messages]);

  const addMessage = (message: ChatMessage) => {
    if (!message) return;
    setMessages(prev => [...prev, message]);
  }

  const clearMessages = () => {
    setMessages([]);
  };

  const setLoading = (isLoading: boolean) => {
    setChatLoading(isLoading);
  }

  const clearActiveMessage = () => {
    setActiveMessage(undefined);
  }

  return (
    <ChatContext.Provider value={{ messages, loading, setLoading, clearActiveMessage, activeMessage, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};