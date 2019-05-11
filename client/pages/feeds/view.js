import PropTypes from 'prop-types';
import BigCard from '../../components/big-card';
import withAuth from '../../components/decorators/withAuth';
import ViewFeedItems from '../../components/view-feed-items';

const ViewFeeds = ({ query }) => <BigCard page="view"><ViewFeedItems id={query.id} /></BigCard>;

ViewFeeds.propTypes = {
    query: PropTypes.shape({
        id: PropTypes.string,
    }),
};

ViewFeeds.defaultProps = {
    query: { id: null },
};

export default withAuth(true)(ViewFeeds);
