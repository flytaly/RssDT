import BigCard from '../components/big-card';
import withAuth from '../components/decorators/withAuth';

const ManageFeeds = () => <BigCard page="settings"><div>Settings</div></BigCard>;

export default withAuth(true)(ManageFeeds);
