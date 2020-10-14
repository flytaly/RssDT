import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class FieldError {
    constructor(field: string, message: string) {
        this.field = field;
        this.message = message;
    }

    @Field()
    field: string;

    @Field()
    message: string;
}
