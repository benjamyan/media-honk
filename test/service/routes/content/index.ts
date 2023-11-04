import { $Router } from "../trpc";
import { getMetaList } from "./getMetaList";
import { getMediaTypeList } from "./getMediaTypeList";
import { getMediaBundles } from "./getMediaBundles";

export const contentRouter = $Router({
    meta: getMetaList,
    type: getMediaTypeList,
    bundles: getMediaBundles
})