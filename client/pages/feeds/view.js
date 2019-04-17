import BigCard from '../../components/big-card';
import withAuth from '../../components/decorators/withAuth';

const ViewFeeds = () => <BigCard page="view"><div>View Feeds</div></BigCard>;

export default withAuth(true)(ViewFeeds);
