import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidBranchQR(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsValidBranchQR',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return (
                        typeof value === 'string' &&
                        value.length > 15 &&
                        value.substring(0, 15) === '85C1J2S3O4L5103'
                    );
                },
            },
        });
    };
}
