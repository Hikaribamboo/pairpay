import { writeFileSync } from "fs";
import { openApiDocument } from "@/lib/openapi";

writeFileSync("openapi.json", JSON.stringify(openApiDocument, null, 2));
