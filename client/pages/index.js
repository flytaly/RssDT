import WelcomeCard from '../components/welcome/welcome-card';
import withAuth from '../components/decorators/withAuth';

const Index = () => <WelcomeCard />;

export default withAuth(false)(Index);
