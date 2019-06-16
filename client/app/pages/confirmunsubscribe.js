import PropTypes from 'prop-types';
import Unsubscribe from '../components/unsubscribe';
import redirect from '../lib/redirect';

const ConfirmUnsubscribePage = ({ query }) => <Unsubscribe token={query.token} />;

ConfirmUnsubscribePage.propTypes = {
    query: PropTypes.shape({ token: PropTypes.string }).isRequired,
};

ConfirmUnsubscribePage.getInitialProps = (context) => {
    const { query } = context;
    if (!query.token) { redirect(context, '/login'); }

    return {};
};


export default ConfirmUnsubscribePage;
