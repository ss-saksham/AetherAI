import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";
import { getModel } from "../utils/model.js";

export const codingAgent = async (state) => {

await checkAgentLimit(
    state.userId,
    "coding"
  );
 await deductCredits(

        state.userId,

        "coding"

    );

function cleanCode(code = "") {
  return code
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .trim();
}

  const llm = getModel("coding", state.model);

  const response = await llm.invoke(`You are Aether Coding Agent, a premium developer sandbox engine.

Your first task is to identify the user's intent.

=========================
INTENT DETECTION & FORMATS
=========================
Classify the request into:
1. CODE_GENERATION: If the user wants a UI component, website, utility, or layout.
2. CODE_REVIEW / DEBUG: If they provide existing code and ask to review/explain/fix.

=========================
CODE GENERATION RULES
=========================
- ALWAYS generate a single-page interactive client application.
- STYLING: You MUST include the Tailwind CSS CDN script tag inside the <head> of index.html:
  <script src="https://cdn.tailwindcss.com"></script>
- DESIGN AESTHETIC: Create premium, Stripe-grade visual layouts. Use neutral dark/matte colors (base bg-zinc-950), high-contrast borders, clear grids, flexible flexboxes, glassmorphism filters (backdrop-blur), and smooth micro-animations.
- JS: Include active interactive logic inside script.js when relevant.
- NEVER output placeholders.

=========================
OUTPUT FORMATTING RULE
=========================
If the intent is CODE_GENERATION, you must return ONLY the files separated by "FILE: <filename>" headers.
- Do NOT wrap code blocks in triple backticks inside the files (output raw code directly under each header).
- Do NOT add markdown formatting around the FILE: declarations.
- Do NOT add any explanations, introductory text, or concluding notes. Terminate the response immediately after the last file's code.

Example structure:
FILE: index.html
<!DOCTYPE html>
<html>
...
</html>

FILE: style.css
/* Extra custom styles here */

FILE: script.js
// Interactive logic here

If the intent is REVIEW/DEBUG:
- Return clean Markdown only.

User Request:
${state.prompt}`);

  const content =
    response.content?.trim();
console.log(content)
  const files = [];

  const matches = [
    ...content.matchAll(
      /FILE:\s*([^\n]+)\n([\s\S]*?)(?=\nFILE:\s*[^\n]+\n|$)/g
    )
  ];

  if(matches.length){

    matches.forEach(match => {

      files.push({
  name: match[1].trim(),
  content: cleanCode(match[2]),
});

    });

  }else{

    let fileName = "main.js";

    const prompt =
      state.prompt.toLowerCase();

    if(prompt.includes("html")){
      fileName = "index.html";
    }
    else if(prompt.includes("css")){
      fileName = "style.css";
    }
    else if(prompt.includes("python")){
      fileName = "main.py";
    }
    else if(prompt.includes("java")){
      fileName = "Main.java";
    }
    else if(prompt.includes("c++")){
      fileName = "main.cpp";
    }

   

 

  }


  if (!content.includes("FILE:")) {
  return {
    ...state,
    response: content,
    artifacts: []
  };
}

  return {

    ...state,

    response:
      "Code generated successfully.",

    artifacts:[
      {
        id:Date.now(),
        type:"project",
        title:state.prompt,
        files,
        createdAt:
          new Date().toISOString()
      }
    ]

  };

};