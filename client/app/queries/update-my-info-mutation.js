import gql from 'graphql-tag';

const UPDATE_MY_INFO_MUTATION = gql`mutation (
    $data: MyInfoUpdateInput!
  ){
    updateMyInfo (
      data: $data
    ) {
        locale
        timeZone
        dailyDigestHour
        shareEnable
        filterShare
        withContentTableDefault
    }
  }
`;

export default UPDATE_MY_INFO_MUTATION;
