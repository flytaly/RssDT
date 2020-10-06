import { GraphQLClient } from 'graphql-request';
import { Connection } from 'typeorm';
import { initDbConnection } from '../dbConnection';
import { TestEntity } from '../entities/TestEntity';
import { getSdk } from './generated/graphql';

let sdk: ReturnType<typeof getSdk>;
let dbConnection: Connection;

beforeAll(async () => {
    const client = new GraphQLClient(`http://localhost:${process.env.PORT}/graphql`);
    sdk = getSdk(client);
    dbConnection = await initDbConnection();
});

afterAll(async () => {
    await dbConnection.close();
});

describe('Just testing', () => {
    const text = 'some text';

    const removeEntities = async () => {
        const entities = await TestEntity.find({ where: { text } });
        await TestEntity.remove(entities);
    };

    beforeAll(removeEntities);
    afterAll(removeEntities);

    test('mutation should work', async () => {
        const response = await sdk.testMutation({ text });
        expect(response.createTestRecord.text).toBe(text);
    });

    test('query should work', async () => {
        const response = await sdk.testQuery();
        expect(response.testRecords).toHaveLength(1);
        expect(response.testRecords![0].text).toBe(text);
    });
});
