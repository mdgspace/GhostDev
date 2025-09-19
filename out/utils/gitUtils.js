"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiffData = exports.openDifftool = void 0;
const vscode = __importStar(require("vscode"));
const terminalUtils_1 = require("./terminalUtils");
function openDifftool() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, terminalUtils_1.executeCommand)('git config --global diff.tool vscode');
            const cmdConfig = 'git config --global difftool.vscode.cmd "code --wait --diff \\$LOCAL \\$REMOTE"';
            yield (0, terminalUtils_1.executeCommand)(cmdConfig);
            yield (0, terminalUtils_1.executeCommand)('git config --global difftool.prompt false');
            yield (0, terminalUtils_1.executeCommand)('git difftool');
        }
        catch (error) {
            console.error('An error occurred while setting up or running git difftool:', error);
            vscode.window.showErrorMessage(`Failed to open Git difftool: ${error.message}`);
        }
    });
}
exports.openDifftool = openDifftool;
function getDiffData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const changedFilesOutput = yield (0, terminalUtils_1.executeCommand)('git diff --staged --name-only');
            const allFilePaths = changedFilesOutput.trim().split('\n').filter(Boolean);
            const filteredFilePaths = allFilePaths.filter(path => !path.startsWith('node_modules/') && !path.startsWith('.vscode/'));
            if (filteredFilePaths.length === 0) {
                return [];
            }
            const diffDataPromises = filteredFilePaths.map((filePath) => __awaiter(this, void 0, void 0, function* () {
                const diff = yield (0, terminalUtils_1.executeCommand)(`git diff --staged -- "${filePath}"`);
                const code = yield (0, terminalUtils_1.executeCommand)(`git show :"${filePath}"`);
                return { name: filePath, diff, code };
            }));
            return Promise.all(diffDataPromises);
        }
        catch (error) {
            console.error('An error occurred while getting git diff data:', error);
            vscode.window.showErrorMessage(`Failed to get Git diff data: ${error.message}`);
            return [];
        }
    });
}
exports.getDiffData = getDiffData;
