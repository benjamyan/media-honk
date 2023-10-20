import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { $Router } from "../trpc";
import { getCoverImage } from "./getCoverImage";

export const resourceRouter = $Router({
    cover: getCoverImage
});
