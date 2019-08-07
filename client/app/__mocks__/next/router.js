const router = { replace: jest.fn() };
const withRouter = Component => props => <Component router={router} {...props} />;
const useRouter = () => router;
export { withRouter, useRouter };
export default router;
