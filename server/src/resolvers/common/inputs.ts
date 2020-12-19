import { Field, InputType } from 'type-graphql';
import { InputMetadata } from '../../middlewares/normalize-validate-args';

@InputType()
export class EmailPasswordInput {
    @InputMetadata('email')
    @Field()
    email: string;

    @InputMetadata('password')
    @Field()
    password: string;
}

@InputType()
export class UserInfoInput {
    @InputMetadata('locale')
    @Field({ nullable: true })
    locale?: string;

    @InputMetadata('timeZone')
    @Field({ nullable: true })
    timeZone?: string;
}

@InputType()
export class AddFeedInput {
    @InputMetadata('feedUrl')
    @Field()
    feedUrl: string;
}

@InputType()
export class AddFeedEmailInput extends AddFeedInput {
    @InputMetadata('email')
    @Field()
    email: string;
}
