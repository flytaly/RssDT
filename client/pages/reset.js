import PropTypes from 'prop-types';
import LoginCard from '../components/login/login-card';
import redirect from '../lib/redirect';

const ResetPasswordPage = ({ query }) => <LoginCard token={query.token} form="set_password" />;

ResetPasswordPage.getInitialProps = (context) => {
    const { query } = context;
    if (!query.token) { redirect(context, '/login'); }
    return {};
};

ResetPasswordPage.propTypes = {
    query: PropTypes.shape({ token: PropTypes.string }).isRequired,
};

export default ResetPasswordPage;
