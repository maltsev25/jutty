import {
    handleParentPath,
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
    handleContentType,
} from "./common";

export default [
    handleParentPath,
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
    handleContentType,
];