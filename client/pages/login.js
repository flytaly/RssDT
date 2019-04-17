import LoginCard from '../components/login/login-card';
import withAuth from '../components/decorators/withAuth';

const LoginPage = () => <LoginCard />;

export default withAuth(false)(LoginPage);
