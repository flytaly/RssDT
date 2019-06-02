import PropTypes from 'prop-types';
import RequestUnsubscribe from '../components/request-unsubscribe';
import redirect from '../lib/redirect';

const UnsubscribePage = ({ query }) => <RequestUnsubscribe id={query.id} />;

UnsubscribePage.propTypes = {
    query: PropTypes.shape({ token: PropTypes.string }).isRequired,
};

UnsubscribePage.getInitialProps = (context) => {
    const { query } = context;
    if (!query.id) { redirect(context, '/login'); }

    return {};
};


export default UnsubscribePage;
