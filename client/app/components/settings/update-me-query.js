import ME_QUERY from '../../queries/me-query';

const updateMeQuery = (dataProxy, mutationResult) => {
    try {
        const data = dataProxy.readQuery({ query: ME_QUERY });
        data.me = { ...data.me, ...mutationResult.data.updateMyInfo };
        dataProxy.writeQuery({ query: ME_QUERY, data });
    } catch (e) {
        console.error(e);
    }
};

export default updateMeQuery;
