import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import get from 'lodash.get';
import ME_QUERY from '../queries/me-query';

const Auth = ({ children }) => {
    const { data = {}, loading, errors } = useQuery(ME_QUERY, { fetchPolicy: 'cache-and-network' });
    const permissions = get(data, 'me.permissions', []);
    if (errors) console.log(errors);
    const isAdmin = permissions.includes('ADMIN');
    return children({ loading, needPermissions: !isAdmin, needLogin: !data.me });
};

Auth.propTypes = {
    children: PropTypes.func.isRequired,
};

export default Auth;
