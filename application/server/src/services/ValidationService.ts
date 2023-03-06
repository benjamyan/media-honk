import { permittedMediaTypes } from "../config/constants";

let ValidationServiceIntermediary: ValidationService = null!;

/** @todo This is a weird use case. Either refactor for more generic functionality, or extend */
export class ValidationService {
    private constructor() {}

    static get instance() {
        if (ValidationServiceIntermediary === null) {
            ValidationServiceIntermediary = new ValidationService();
        }
        return ValidationServiceIntermediary
    }

    public parseStringForError(givenStr: string): boolean | Error {
        if (typeof(givenStr) !== 'string') {
            return new Error(`String failed validation`)
        }
        return true;
    }

    public permissibleMediaProperties(mediaEntry: Honk.Media.BaselineMediaProperties & Partial<Honk.Media.MediaPropertyDefition>): boolean | Error {
        // const { title, type, subtitle, artists, categories, _guid } = mediaEntry;
        
        let currentProperty: Parameters<typeof this.permissibleMediaProperties>[0][keyof Parameters<typeof this.permissibleMediaProperties>[0]] = null!;

        // validateMediaEntry:
        for (const property in mediaEntry) {
            currentProperty = mediaEntry[property as keyof typeof mediaEntry];
            switch(property) {
                case 'type': 
                case 'title': {
                    if (!currentProperty || currentProperty.length === 0) {
                        return new Error(`Required property not provided: ${property}`)
                    } else if (this.parseStringForError(currentProperty as string) instanceof Error) {
                        return new Error(`Invalid typeof property provided: ${property}`)
                    } else if (property === 'type') {
                        if (!permittedMediaTypes.includes(currentProperty as string)) {
                            return new Error(`Expected one of permitted types, but got: ${currentProperty}`)
                        }
                    }
                    break;
                }
                case '_guid':
                case 'subtitle': {
                    if (!currentProperty || this.parseStringForError(currentProperty as string) === true) {
                        break;
                    } else {
                        return new Error(`Invalid property: ${property}`);
                    }
                }
                case 'artists':
                case 'categories': {
                    if (!currentProperty || Array.isArray(currentProperty)) {
                        break;
                    } else {
                        return new Error(`Expected undefined or array type, but got: ${typeof currentProperty}`);
                    }
                }
                default: {
                    return new Error(`Explicit property found: ${property}`)
                }
            }
        }
        return true;
    }

}

