import 'jest-dom/extend-expect';
import {
    render, cleanup, fireEvent, wait, waitForElement, getByText,
} from 'react-testing-library';
import { axe, toHaveNoViolations } from 'jest-axe';
import router from 'next/router';
import LoginCard from '../components/login/login-card';
import { SIGN_IN_MUTATION } from '../components/login/login-form';
import RequestPasswordForm, { REQUEST_PASSWORD_CHANGE } from '../components/login/request-password-form';
import SetPasswordForm, { SET_PASSWORD_MUTATION } from '../components/login/set-password-form';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import { ME_QUERY_MOCK } from '../test-utils/qgl-mocks';

expect.extend(toHaveNoViolations);

const values = { email: 'email@tst.com', password: 'password' };
const mocks = [{
    request: { query: SIGN_IN_MUTATION, variables: { ...values } },
    result: { data: { signIn: { message: 'OK' } } },
}, {
    request: { query: REQUEST_PASSWORD_CHANGE, variables: { email: values.email } },
    result: { data: { requestPasswordChange: { message: 'OK' } } },
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
        const { getByLabelText, getByTestId } = render(
            <ApolloMockedProvider mocks={mocks}>
                <LoginCard />
            </ApolloMockedProvider>,
        );
        const submitBtn = getByText(getByTestId('login').querySelector('button'), /log in/i);
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

        const { getByLabelText, getByTestId } = render(
            <ApolloMockedProvider mocks={errorMocks}>
                <LoginCard />
            </ApolloMockedProvider>,
        );
        const submitBtn = getByText(getByTestId('login').querySelector('button'), /log in/i);
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
            expect(getByTestId('login')).toHaveFormValues({ email, password });
        });
    });
});


describe('Request password change form', () => {
    afterEach(() => { cleanup(); jest.clearAllMocks(); });

    test('the form should not have accessibility violations', async () => {
        const container = document.createElement('div');
        render(
            <ApolloMockedProvider mocks={mocks}>
                <RequestPasswordForm setMessages={() => {}} changeForm={() => {}} />
            </ApolloMockedProvider>,
            { container },
        );

        const result = await axe(container.innerHTML);

        expect(result).toHaveNoViolations();
    });

    test('should replace login form to request password form', () => {
        const { getByTestId, container } = render(
            <ApolloMockedProvider mocks={mocks}>
                <LoginCard />
            </ApolloMockedProvider>,
        );
        fireEvent.click(getByText(container, /I forgot or don't have password/i));
        expect(getByTestId('request_password')).toBeInTheDocument();
        fireEvent.click(getByText(container, /back to log in form/i));
        expect(getByTestId('login')).toBeInTheDocument();
    });

    test('should send graphql query on submit', async () => {
        const { getByTestId, getByLabelText, container } = render(
            <ApolloMockedProvider mocks={mocks}>
                <LoginCard form="request_password" />
            </ApolloMockedProvider>,
        );
        expect(getByTestId('request_password')).toBeInTheDocument();
        fireEvent.change(getByLabelText(/email/i), { target: { value: values.email } });
        fireEvent.click(getByText(container, /email me/i));

        await wait(async () => {
            expect(getByTestId('login-message')).toHaveTextContent('If provided email is correct reset link has been sent');
        });
    });
});

describe('Set password form', () => {
    const token = 'testToken';
    const password = 'testPassword';
    const setPasswordMocks = [...mocks, {
        request: { query: SET_PASSWORD_MUTATION, variables: { token, password } },
        result: { data: { setPassword: { email: values.email } } },
    },
    ];

    afterEach(() => { cleanup(); jest.clearAllMocks(); });

    test('the form should not have accessibility violations', async () => {
        const container = document.createElement('div');
        render(
            <ApolloMockedProvider mocks={setPasswordMocks}>
                <SetPasswordForm setMessages={() => {}} token="token" />
            </ApolloMockedProvider>,
            { container },
        );

        const result = await axe(container.innerHTML);

        expect(result).toHaveNoViolations();
    });

    test('should render set password form', () => {
        const { getByTestId } = render(
            <ApolloMockedProvider mocks={setPasswordMocks}>
                <LoginCard token={token} form="set_password" />
            </ApolloMockedProvider>,
        );
        expect(getByTestId('set_password')).toBeInTheDocument();
    });

    test('should show errors if password is invalid', async () => {
        const { getByTestId, getByLabelText, container } = render(
            <ApolloMockedProvider mocks={setPasswordMocks}>
                <LoginCard token={token} form="set_password" />
            </ApolloMockedProvider>,
        );
        const inputs = {
            password: getByLabelText(/Password/i),
            confirm: getByLabelText(/Confirm password/i),
        };
        fireEvent.change(inputs.password, { target: { value: 'short' } });
        fireEvent.change(inputs.confirm, { target: { value: 'shor' } });
        fireEvent.blur(inputs.password);
        fireEvent.blur(inputs.confirm);
        await waitForElement(() => [
            getByText(container, /Password must be at least 8 characters/i),
            getByText(container, /Passwords don't match/i),
        ]);
    });

    test('should send graphql query on submit', async () => {
        const { getByTestId, getByLabelText, container } = render(
            <ApolloMockedProvider mocks={setPasswordMocks}>
                <LoginCard token={token} form="set_password" />
            </ApolloMockedProvider>,
        );
        const inputs = {
            password: getByLabelText(/Password/i),
            confirm: getByLabelText(/Confirm password/i),
        };
        fireEvent.change(inputs.password, { target: { value: password } });
        fireEvent.change(inputs.confirm, { target: { value: password } });
        fireEvent.click(getByText(container, /set password/i));

        await wait(async () => {
            expect(getByTestId('login-message')).toHaveTextContent('New password was saved');
        });

        await wait(() => {
            expect(router.replace).toHaveBeenCalled();
        });
    });
});
