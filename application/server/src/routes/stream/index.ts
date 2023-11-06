import { $Router } from "../trpc";
import { getStaticAsset } from "./getStaticAsset";
import { streamVideo } from "./streamVideo";

export const streamRouter = $Router({
    image: getStaticAsset,
    video: streamVideo
})