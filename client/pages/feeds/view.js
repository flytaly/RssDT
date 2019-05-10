import BigCard from '../../components/big-card';
import withAuth from '../../components/decorators/withAuth';
import ViewFeedItems from '../../components/view-feed-items';

const ViewFeeds = () => <BigCard page="view"><ViewFeedItems /></BigCard>;

export default withAuth(true)(ViewFeeds);
