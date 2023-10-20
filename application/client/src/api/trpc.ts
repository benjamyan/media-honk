import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../../../server/src/routes";

export const trpc = createTRPCReact<AppRouter>();