import BigCard from '../components/big-card';
import withAuth from '../components/decorators/withAuth';
import Settings from '../components/settings';

const SettingsPage = () => <BigCard page="settings"><Settings /></BigCard>;

export default withAuth(true)(SettingsPage);
