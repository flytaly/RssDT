import redirect from '../../lib/redirect';

const Feeds = () => <div />;

Feeds.getInitialProps = (context) => {
    redirect(context, '/feeds/manage');
    return {};
};


export default Feeds;
