import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

Router.onRouteChangeStart = () => {
    NProgress.start();
};
Router.onRouteChangeComplete = () => {
    NProgress.done();
};

Router.onRouteChangeError = () => {
    NProgress.done();
};
