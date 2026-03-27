import dotenv from "dotenv";
dotenv.config();
import DataUriParser from 'datauri/parser.js';
import path from 'path';

const getBuffer = (file) => {                    // ✅ removed `: any`
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
};

export default getBuffer;