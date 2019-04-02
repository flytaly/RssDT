import 'jest-dom/extend-expect';
import {
    render, cleanup, fireEvent, wait, waitForElement,
} from 'react-testing-library';
import { axe, toHaveNoViolations } from 'jest-axe';
import WelcomeCard from '../components/welcome/welcome-card';
import { ADD_FEED_MUTATION } from '../components/welcome/add-feed-form';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import '../test-utils/disable-act-warning';
import periods from '../types/digest-periods';

expect.extend(toHaveNoViolations);

const values = {
    url: 'http://test.com/feed',
    email: 'email@email.com',
    period: periods.DAILY,
};
const successMsg = 'success';
const mocks = [{
    request: {
        query: ADD_FEED_MUTATION,
        variables: {
            ...values,
        },
    },
    result: { data: { addFeed: { message: successMsg } } },
}];

afterEach(cleanup);

describe('Add feed form', () => {
    test('the form should not have accessibility violations', async () => {
        // It's important to pass container so document.body stays empty
        // because axe temporary appends innerHTML to document.body and hence creates duplicates:
        // https://github.com/nickcolley/jest-axe/issues/56#issuecomment-476872378
        const container = document.createElement('div');
        render(
            <ApolloMockedProvider mocks={mocks}>
                <WelcomeCard />
            </ApolloMockedProvider>,
            { container },
        );

        const result = await axe(container.innerHTML);

        expect(result).toHaveNoViolations();
    });

    test('should show form errors', async () => {
        const { getByLabelText, getByText } = render(
            <ApolloMockedProvider mocks={mocks}>
                <WelcomeCard />
            </ApolloMockedProvider>,
        );
        const submitBtn = getByText(/subscribe/i);
        const inputs = {
            url: getByLabelText(/The RSS or Atom feed url/i),
            email: getByLabelText(/Email/i),
            period: getByLabelText(/Select a digest period/i),
        };
        fireEvent.change(inputs.url, { target: { value: 'notAnEmail' } });
        fireEvent.change(inputs.email, { target: { value: 'http:/notaurl' } });
        await waitForElement(() => [
            getByText(/invalid feed address/i),
            getByText(/invalid email address/i),
        ]);
        fireEvent.click(submitBtn);
    });
});

describe('Submitting data', () => {
    test('should submit valid data and display message', async () => {
        const { getByLabelText, getByText, getByTestId } = render(
            <ApolloMockedProvider mocks={mocks}>
                <WelcomeCard />
            </ApolloMockedProvider>,
        );
        const submitBtn = getByText(/subscribe/i);
        const inputs = {
            url: getByLabelText(/The RSS or Atom feed url/i),
            email: getByLabelText(/Email/i),
            period: getByLabelText(/Select a digest period/i),
        };

        fireEvent.change(inputs.url, { target: { value: values.url } });
        fireEvent.change(inputs.email, { target: { value: values.email } });
        fireEvent.change(inputs.period, { target: { value: values.period } });
        fireEvent.click(getByText(/subscribe/i));

        Object.values(inputs).forEach(input => expect(input).toBeDisabled());
        expect(submitBtn).toBeDisabled();
        expect(submitBtn).toHaveTextContent(/submitting/i);

        await wait(() => {
            Object.values(inputs).forEach(input => expect(input).toBeEnabled());
            expect(submitBtn).toBeEnabled();
            expect(submitBtn).toHaveTextContent(/subscribe/i);

            expect(getByTestId('add-feed-message')).toHaveTextContent(`${successMsg}`);
        });
    });

    test('should submit data and display error', async () => {
        const wrongFeedUrl = 'http://notafeed.com';
        const errorMsg = 'It\'s not a feed';
        const errorMocks = [{
            request: {
                query: ADD_FEED_MUTATION,
                variables: { ...values, url: wrongFeedUrl },
            },
            error: new Error(errorMsg),
        }];

        const { getByLabelText, getByText, getByTestId } = render(
            <ApolloMockedProvider mocks={errorMocks}>
                <WelcomeCard />
            </ApolloMockedProvider>,
        );

        const submitBtn = getByText(/subscribe/i);
        const inputs = {
            url: getByLabelText(/The RSS or Atom feed url/i),
            email: getByLabelText(/Email/i),
            period: getByLabelText(/Select a digest period/i),
        };

        fireEvent.change(inputs.url, { target: { value: wrongFeedUrl } });
        fireEvent.change(inputs.email, { target: { value: values.email } });
        fireEvent.change(inputs.period, { target: { value: values.period } });
        fireEvent.click(submitBtn);

        await wait(() => {
            expect(getByTestId('add-feed-message')).toHaveTextContent(errorMsg);
        });
    });
});

describe('Snapshot', () => {
    test('should match snapshot', () => {
        /* eslint-disable global-require */
        const { ThemeProvider } = require('styled-components');
        const { default: theme } = require('../components/themes/default');

        const { container } = render(
            <ApolloMockedProvider mocks={mocks}>
                <ThemeProvider theme={theme}>
                    <WelcomeCard />
                </ThemeProvider>
            </ApolloMockedProvider>,
        );

        expect(container.firstChild).toMatchSnapshot();
    });
});
