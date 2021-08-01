import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export function IsAfterStartTimeAndSameDate(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsAfterStartConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'IsAfterStartTimeAndSameDate' })
export class IsAfterStartConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        const copyVal = new Date(value.valueOf());
        const copyRelatedVal = new Date(relatedValue.valueOf());
        copyVal.setHours(0, 0, 0, 0);
        copyRelatedVal.setHours(0, 0, 0, 0);
        return value > relatedValue && copyVal.valueOf() === copyRelatedVal.valueOf();
    }

    defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `${relatedPropertyName} should be before ${args.property}`;
    }
}
