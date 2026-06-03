import JSZip from 'jszip';

/**
 * Wrap a File in a ZIP archive and return a new File named <original>.zip
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function zipFileForUpload(file) {
    const zip = new JSZip();
    zip.file(file.name, file);
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    return new File([blob], file.name + '.zip', { type: 'application/zip' });
}
