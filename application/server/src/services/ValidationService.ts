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
        let currentProperty: Parameters<typeof this.permissibleMediaProperties>[0][keyof Parameters<typeof this.permissibleMediaProperties>[0]] = null!;

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
                            return new Error(`Expected one of permitted types in ${property}, but got: ${currentProperty}`)
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
                        return new Error(`Expected undefined or array in ${property}, but got: ${typeof currentProperty}`);
                    }
                }
                default: {
                    /** its got bad wordz HAUHAUAHHAUAHAU HAAA */
                    return new Error(`Unknown property found: ${property}`)
                }
            }
        }
        return true;
    }

}

