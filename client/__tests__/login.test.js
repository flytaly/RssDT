import 'jest-dom/extend-expect';
import {
    render, cleanup, fireEvent, wait, waitForElement, getByText,
} from 'react-testing-library';
import { axe, toHaveNoViolations } from 'jest-axe';
import router from 'next/router';
import LoginCard from '../components/login/login-card';
import { SIGN_IN_MUTATION } from '../components/login/login-form';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import { ME_QUERY_MOCK } from '../test-utils/qgl-mocks';

expect.extend(toHaveNoViolations);

const values = { email: 'email@tst.com', password: 'password' };
const mocks = [{
    request: {
        query: SIGN_IN_MUTATION,
        variables: {
            ...values,
        },
    },
    result: { data: { signIn: { message: 'OK' } } },
},
ME_QUERY_MOCK,
];

describe('Log In form', () => {
    afterEach(() => { cleanup(); jest.clearAllMocks(); });

    test('the form should not have accessibility violations', async () => {
        const container = document.createElement('div');
        render(
            <ApolloMockedProvider mocks={mocks}>
                <LoginCard />
            </ApolloMockedProvider>,
            { container },
        );

        const result = await axe(container.innerHTML);

        expect(result).toHaveNoViolations();
    });

    test('should replace url after successful logging in', async () => {
        const { getByLabelText, container } = render(
            <ApolloMockedProvider mocks={mocks}>
                <LoginCard />
            </ApolloMockedProvider>,
        );
        const submitBtn = getByText(container.querySelector('form button'), /log in/i);
        const inputs = {
            email: getByLabelText(/email/i),
            password: getByLabelText(/password/i),
        };
        fireEvent.change(inputs.email, { target: { value: values.email } });
        fireEvent.change(inputs.password, { target: { value: values.password } });
        fireEvent.click(submitBtn);

        await wait(() => {
            expect(router.replace).toHaveBeenCalledWith('/subscriptions');
        });
    });

    test('should show error after failed logging in', async () => {
        const { email } = values;
        const password = 'wrongpassword';
        const errorMsg = 'Wrong password';

        const errorMocks = [...mocks, {
            request: { query: SIGN_IN_MUTATION, variables: { email, password } },
            error: new Error('Wrong password'),
        }];

        const { getByLabelText, getByTestId, container } = render(
            <ApolloMockedProvider mocks={errorMocks}>
                <LoginCard />
            </ApolloMockedProvider>,
        );
        const submitBtn = getByText(container.querySelector('form button'), /log in/i);
        const inputs = {
            email: getByLabelText(/email/i),
            password: getByLabelText(/password/i),
        };
        fireEvent.change(inputs.email, { target: { value: email } });
        fireEvent.change(inputs.password, { target: { value: password } });
        fireEvent.click(submitBtn);
        await wait(() => {
            expect(getByTestId('login-message')).toHaveTextContent(errorMsg);
            // form values should not be cleared
            expect(container.querySelector('form')).toHaveFormValues({ email, password });
        });
    });
});
