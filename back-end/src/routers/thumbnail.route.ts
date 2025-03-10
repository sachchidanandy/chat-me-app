import { fetchThumbnail, uploadThumbnail } from "@controllers/thumbnail.controller";
import { tryCatchWrapper } from "@utils/wrapper";
import { Router } from "express";

const thumbnailRouter = Router();

thumbnailRouter.get("/:fileName", tryCatchWrapper(fetchThumbnail));
thumbnailRouter.post("/", tryCatchWrapper(uploadThumbnail));

export default thumbnailRouter;
