import { Arg, Field, InputType, Mutation, ObjectType, Resolver, UseMiddleware } from 'type-graphql';
import { sendFeedback } from '../mail/dispatcher';
import { InputMetadata, NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args';
import { rateLimit } from '../middlewares/rate-limit';
import { ArgumentError } from './common/ArgumentError';

@InputType()
export class FeedbackInput {
  @InputMetadata('email')
  @Field()
  email: string;

  @InputMetadata('feedbackText')
  @Field()
  text: string;
}

@ObjectType()
class FeedbackResponse {
  @Field(() => [ArgumentError], { nullable: true })
  errors?: ArgumentError[];

  @Field({ nullable: true })
  success?: boolean;
}

@Resolver()
export class MailResolver {
  @UseMiddleware(rateLimit(5, 60 * 10))
  @NormalizeAndValidateArgs([FeedbackInput, 'input'])
  @Mutation(() => FeedbackResponse, { nullable: true })
  async feedback(@Arg('input') { email, text }: FeedbackInput) {
    await sendFeedback(email, text);
    return { success: true };
  }
}
