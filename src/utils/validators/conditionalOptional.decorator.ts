import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export function IsOptionalBasedOn(property: string, validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsOptionalBasedOnConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'IsOptionalBasedOn' })
export class IsOptionalBasedOnConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        if (relatedValue && relatedValue !== 0 && value === undefined) {
            return false; //relatedValue가 정의가 되있는데 value가 널이면 검증 실패
        } else {
            return true;
        }
    }

    defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `${args.property} should be defined based on ${relatedPropertyName}`;
    }
}
