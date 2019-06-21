import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import ME_QUERY from '../queries/me-query';

const Auth = ({ children }) => {
    const { data, loading, errors } = useQuery(ME_QUERY);
    const permissions = get(data, 'me.permissions', []);
    if (errors) console.log(errors);
    const isAdmin = permissions.includes('ADMIN');
    return children({ loading, needLogin: !isAdmin });
};

Auth.propTypes = {
    children: PropTypes.func.isRequired,
};

export default Auth;
