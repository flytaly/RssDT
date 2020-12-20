import { Field, InputType } from 'type-graphql';
import { InputMetadata } from '../../middlewares/normalize-validate-args';
import { Theme, DigestSchedule, TernaryState } from '../../types/enums';

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

@InputType()
export class OptionsInput {
    @InputMetadata('dailyDigestHour')
    @Field({ nullable: true })
    dailyDigestHour?: number;

    @InputMetadata('customSubject')
    @Field({ nullable: true })
    customSubject?: string;

    @InputMetadata('shareList')
    @Field(() => [String], { nullable: true })
    shareList?: string[];

    @Field({ nullable: true })
    shareEnable?: boolean;

    @Field({ nullable: true })
    withContentTableDefault?: boolean;

    @Field({ nullable: true })
    itemBodyDefault?: boolean;

    @Field({ nullable: true })
    attachmentsDefault?: boolean;

    @Field({ nullable: true })
    themeDefault?: Theme;
}

@InputType()
export class UserFeedOptionsInput {
    @Field({ nullable: true })
    schedule: DigestSchedule;

    @Field({ nullable: true })
    withContentTable: TernaryState;

    @Field({ nullable: true })
    itemBody: TernaryState;

    @Field({ nullable: true })
    attachments: TernaryState;

    @Field({ nullable: true })
    theme: Theme;
}
