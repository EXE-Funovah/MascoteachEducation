/**
 * Temporary in-memory store for the uploaded File object
 */

let _pendingFile = null;

export function setPendingFile(file) {
    _pendingFile = file;
}

export function getPendingFile() {
    return _pendingFile;
}

export function clearPendingFile() {
    _pendingFile = null;
}
