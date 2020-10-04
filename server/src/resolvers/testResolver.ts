import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { TestEntity } from '../entities/TestEntity';

@Resolver()
export class TestResolver {
    @Query(() => [TestEntity], { nullable: true })
    records() {
        return TestEntity.find();
    }

    @Mutation(() => TestEntity)
    createTestRecord(@Arg('text', () => String) text: string) {
        return TestEntity.create({ text }).save();
    }
}
