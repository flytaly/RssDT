import redirect from '../lib/redirect';

const About = () => <div />;

About.getInitialProps = (context) => {
    redirect(context, '/help');
    return {};
};


export default About;
