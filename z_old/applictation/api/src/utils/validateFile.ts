import * as Path from 'node:path'
import * as Fs from 'node:fs'

/** Validate that a file exists and that its valid
 * 
 * @param file the given name of the file
 * @param source the source directory for the file relative to toplevel - if left undefined, will default to `static`
 * 
 * @returns false || path as a string value
 */
export function validateFile(file: string, source?: string): false | string {
    try {
        const filename = file.startsWith('/') ? file.substring(0) : file
        const filepath = Path.join(__dirname, source || '../../static', filename);
        if (Fs.existsSync(filepath)) {
            return filepath
        } else {
            return false
        }
    } catch (err) {
        console.warn(err)
        return false
    }
}
