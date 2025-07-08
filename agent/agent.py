"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import asyncio
from typing import Any, List
from typing_extensions import Literal
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.types import Command, interrupt
from langgraph.graph import MessagesState
from langchain_core.callbacks.manager import adispatch_custom_event

class AgentState(MessagesState):
    proverbs: List[str] = []
    status: str
    tools: List[Any] # new ag-ui implementation, frontend tools go here
    # your_custom_agent_state: str = ""

async def interrupt_node(state: AgentState, config: RunnableConfig) -> Command[Literal["__end__"]]:
    proverb_from_user = interrupt("What should I write a proverb about?")

    model = ChatOpenAI(model="gpt-4o")
    response = await model.ainvoke([
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content=f"Write a proverb about: {proverb_from_user}"),
    ])

    updates = [
        f"thinking about {proverb_from_user}",
        f"dreaming about {proverb_from_user}",
        f"debating the philosophy of {proverb_from_user}",
        f"digging deep",
        f"almost done",
    ]

    for update in updates:
        await adispatch_custom_event(
            "manually_emit_state",
            {**state, "status": update},
            config=config,
        )
        await asyncio.sleep(2)

    return Command(
        goto=END,
        update={
            "proverbs": [*state["proverbs"], response.content]
        }
    )

# Define the workflow graph
workflow = StateGraph(AgentState)
workflow.add_node("interrupt_node", interrupt_node)
workflow.set_entry_point("interrupt_node")

graph = workflow.compile()
