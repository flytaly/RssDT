import PropTypes from 'prop-types';
import LoginCard from '../components/login/login-card';
import redirect from '../lib/redirect';
import formTypes from '../components/login/form-types';

const ResetPasswordPage = ({ query }) => <LoginCard token={query.token} form={formTypes.set_password} />;

ResetPasswordPage.propTypes = {
    query: PropTypes.shape({ token: PropTypes.string }).isRequired,
};

ResetPasswordPage.getInitialProps = (context) => {
    const { query } = context;
    if (!query.token) { redirect(context, '/login'); }

    return {};
};


export default ResetPasswordPage;
