import gql from 'graphql-tag';

export default gql`
  mutation SIGN_IN_MUTATION(
    $email: String!
    $password: String!
  ) {
    signIn(
        email: $email
        password: $password
    ) {
        message
    }
  }
`;
