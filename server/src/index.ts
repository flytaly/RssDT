import 'dotenv-safe/config';
import express from 'express';

const entry = async () => {
    const app = express();

    app.listen(process.env.PORT, () => {
        console.log(`server started on localhost:${process.env.PORT}`);
    });
};

entry().catch((err) => console.error(err));
