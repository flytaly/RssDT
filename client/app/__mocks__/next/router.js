const router = { replace: jest.fn() };
const withRouter = Component => props => <Component router={router} {...props} />;

export { withRouter };
export default router;
