"use client";

import { useCoAgent, useCopilotChat, useLangGraphInterrupt, useLangGraphInterruptRender } from "@copilotkit/react-core";
import { useState } from "react";

// State of the agent, make sure this aligns with your agent's state.
type AgentState = {
  proverbs?: string[];
  status?: string;
}

export default function CopilotKitPage() {
  const { isLoading } = useCopilotChat();

  const { state, run } = useCoAgent<AgentState>({
    name: "sample_agent",
    initialState: {
      proverbs: [],
      status: "",
    },
  })

  useLangGraphInterrupt({
    render: ({resolve, event}) => {
      const [value, setValue] = useState("");
      return (
        <div className="bg-gray-100 p-4 rounded-md">
          <p>{event.value}</p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              className="border-2 border-gray-300 rounded-md p-2"
            />
            <button 
              className="bg-blue-500 text-white p-2 rounded-md w-[100px] cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
              onClick={() => resolve(value)}
              disabled={!value}
            >
              Resolve
            </button>
          </div>
        </div>
      )
    }
  })

  const interrupt = useLangGraphInterruptRender();

  return (
    <main className="grid grid-cols-2 gap-4 h-screen">
      <div className="flex items-center flex-col justify-center gap-4">
        <button 
          className="bg-blue-500 text-white p-2 rounded-md w-[100px] disabled:animate-pulse cursor-pointer disabled:cursor-not-allowed"
          onClick={() => run()}
          disabled={isLoading}
        >
          {isLoading ? "Running..." : "Run agent"}
        </button>
        <p>{state.status}</p>
        {interrupt}
      </div>
      <pre className="overflow-y-auto p-4 border-l">
        {JSON.stringify(state, null, 2)}
      </pre>
    </main>
  );
}
