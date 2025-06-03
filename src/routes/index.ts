import { Router } from 'express';
import patientRouter from "./patientRouter";

const router = Router();

router.use('/', patientRouter);

export default router;
