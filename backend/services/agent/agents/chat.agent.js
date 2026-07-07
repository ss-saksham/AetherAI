import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getMemory } from "../utils/memory.js";
import { getModel } from "../utils/model.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";


export const chatAgent =
async(state)=>{

await checkAgentLimit(
    state.userId,
    "chat"
  );

   await deductCredits(

        state.userId,

        "chat"

    );


 const llm =
 getModel("chat", state.model);

 const history =
 await getMemory(
  state.conversationId
 );

 

let formattedResults = "";
if (state.searchResults) {
  if (typeof state.searchResults === "string") {
    formattedResults = state.searchResults;
  } else if (Array.isArray(state.searchResults)) {
    formattedResults = state.searchResults.map((r, i) => `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join("\n\n");
  } else if (typeof state.searchResults === "object") {
    const resultsArray = state.searchResults.results || [];
    formattedResults = resultsArray.map((r, i) => `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join("\n\n");
  }
}

const searchContext = formattedResults
  ? `
Web Search Results:

${formattedResults}

Answer the user using only the above search results.
`
  : ""




 const messages = [

  new SystemMessage(
`
You are CortexAI, an intelligent AI assistant.

${searchContext}



If searchContext exists:

- Use search results to answer.
- Do not mention internal tools.

Rules:

- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.

Formatting:

- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.




`
  )

 ];

 history.forEach((msg)=>{

  if(
   msg.role === "user"
  ){

   messages.push(

    new HumanMessage(
     msg.content
    )

   );

  }

  if(
   msg.role === "assistant"
  ){

   messages.push(

    new AIMessage(
     msg.content
    )

   );

  }

 });

 messages.push(

  new HumanMessage(
   state.prompt
  )

 );

 const response = await llm.invoke(messages);



const images = state.searchResults?.images || [];



return {
  ...state,

  response:response.content,
  images:images
  
};

};