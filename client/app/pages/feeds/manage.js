import BigCard from '../../components/big-card';
import ManageFeeds from '../../components/manage-feeds';
import withAuth from '../../components/decorators/withAuth';

const ManageFeedsPage = () => (
    <BigCard page="manage">
        <ManageFeeds />
    </BigCard>
);

export default withAuth(true)(ManageFeedsPage);
