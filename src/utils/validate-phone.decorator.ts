import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsValidPhoneNumber',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return (
                        typeof value === 'string' &&
                        value.length === 11 &&
                        (value.substring(0, 3) === '010' ||
                            value.substring(0, 3) === '011')
                    ); // you can return a Promise<boolean> here as well, if you want to make async validation
                },
            },
        });
    };
}
