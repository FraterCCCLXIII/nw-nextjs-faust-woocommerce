import { CoreBlocks } from "@faustwp/blocks";
import { CoreImage } from "./CoreImage.js";

export default {
	...CoreBlocks,
	CoreImage, // Override with custom CoreImage that fixes URLs
};

