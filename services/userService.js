import validator from "validator";

export function isStrongPassword(password) {
    return validator.isStrongPassword(password, {
        minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    });
}