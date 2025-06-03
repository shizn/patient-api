import express from 'express';
import routes from "./routes";
import {errorMiddleware} from "./middleware/error.middleware";
import { morganMiddleware } from "./pkg/logger/logger"

const app = express();

app.use(express.json());
app.use(morganMiddleware);

// Routes
app.use('/api/', routes);

// health check endpoint
app.use('/', (req, res) => {
        res.status(200).json({status: 'ok'});
});

// Global error handler
app.use(errorMiddleware);

export default app;