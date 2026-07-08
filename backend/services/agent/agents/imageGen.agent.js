import axios from "axios";
import { getModel } from "../utils/model.js";

import { uploadToS3 } from "../utils/uploadToS3.js";
import { getDownloadUrl } from "../utils/getDownloadUrl.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const imageAgent = async (state) => {

  try {

await checkAgentLimit(
    state.userId,
    "image"
  );
 await deductCredits(

        state.userId,

        "image"

    );


    const llm =
      getModel("image");

    const promptResponse =
      await llm.invoke(`

You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:

${state.prompt}

`);

    const enhancedPrompt =
      promptResponse.content.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}`;
    let finalUrl = imageUrl;
    let fallbackUsed = false;

    try {
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const fileName = `image-${Date.now()}.png`;

      await uploadToS3(
        imageBuffer,
        fileName,
        "image/png"
      );

      finalUrl = await getDownloadUrl(
        fileName,
        24 * 60 * 60
      );
    } catch (s3Error) {
      console.warn("⚠️ S3 Upload/URL sign failed. Falling back to direct Pollinations URL:", s3Error.message);
      fallbackUsed = true;
    }

    return {
      ...state,
      response: `
# 🖼️ Image Generated Successfully

![Generated Image](${finalUrl})

📥 [Download Image](${finalUrl})

${fallbackUsed ? "⚠️ *Note: Rendering direct feed due to S3 storage configuration limits.*" : "⏳ *Link expires in 24 hours.*"}
`.trim()
    };

  } catch (error) {
    console.log("Image Agent Error:", error);
    return {
      ...state,
      response: "❌ Failed to generate image."
    };
  }
};