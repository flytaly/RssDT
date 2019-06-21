import React from 'react';
import { Form, Icon, Input, Button, Alert, Layout } from 'antd';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import SIGN_IN_MUTATION from '../queries/signin-mutation';
import ME_QUERY from '../queries/me-query';

const LoginForm = ({ form, needPermissions }) => {
    const { getFieldDecorator, validateFields } = form;
    const [signIn, { loading, error }] = useMutation(SIGN_IN_MUTATION, {
        refetchQueries: () => [{ query: ME_QUERY }],
        awaitRefetchQueries: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        validateFields(async (err, values) => {
            if (!err) {
                const { email, password } = values;
                try {
                    await signIn({ variables: { email, password } });
                    // For some reasons refetchQueries doesn't work if initially user isn't logged in
                    window.location.reload();
                } catch (mutationError) {
                    console.error(mutationError);
                }
            }
        });
    };

    return (
        <Layout style={{ minHeight: '100vh', alignItems: 'center' }}>
            <Layout.Content style={{ width: 300, marginTop: 50 }}>
                {needPermissions ? <Alert description="You don't have admin permissions" type="error" /> : null}
                {error ? <Alert description={error.message} type="error" /> : null}
                <Form onSubmit={handleSubmit} className="login-form">
                    <Form.Item>
                        {getFieldDecorator('email', {
                            rules: [
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please input valid email!' },
                            ],
                        })(
                            <Input
                                prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Email"
                                disabled={loading}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                                disabled={loading}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Layout.Content>
        </Layout>
    );
};

LoginForm.propTypes = {
    form: PropTypes.shape({
        getFieldDecorator: PropTypes.func.isRequired,
        validateFields: PropTypes.func.isRequired,
    }).isRequired,
    needPermissions: PropTypes.bool,
};

LoginForm.defaultProps = {
    needPermissions: false,
};

const WrappedLoginForm = Form.create({ name: 'login' })(LoginForm);

export default WrappedLoginForm;
