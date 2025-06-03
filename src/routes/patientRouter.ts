import {NextFunction, Request, Response, Router} from "express";
import {AuthorizationError, ValidationError} from "../utils/errors";
import {UserService} from "../services/user.service";
import {PatientService} from "../services/patient.service";
import {logger} from "../pkg/logger/logger";

const userService = new UserService();
const patientService = new PatientService();


const router = Router()
const path = '/patients';

const getUser = async (req: Request) => {
    // get user id from header
    const userId = req.header('user-id');
    if (!userId) {
        logger.warn('User ID header is missing');
        throw new ValidationError('User ID header is missing');
    }
    const userInt = parseInt(userId);
    return await userService.getUserById(userInt);
}


const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUser(req)

        // check if user is admin
        if (user.role !== 'ADMIN') {
            logger.warn('User is not authorized to access this resource', { userId: user.id, userRole: user.role });
            throw new AuthorizationError('User is not authorized to access this resource');
        }

        const patients = await patientService.getAllPatients();

        // log request to all patients endpoint, including user id and role for auditing purposes
        logger.info('Successfully retrieved all patients', { userId: user.id, userRole: user.role });
        
        const patientsSanitized = patients.map(patient => {
            return {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                ssn: patient.ssn,
            }
        })

        res.json(patientsSanitized);
    } catch (error) {
        next(error);
    }
};

const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = await getUser(req)

        // check if user is admin or billing
        if (user.role !== 'ADMIN' && user.role !== "BILLING") {
            logger.warn('User is not authorized to access this resource', { userId: user.id, userRole: user.role });
            throw new AuthorizationError('User is not authorized to access this resource');
        }

        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new ValidationError('Invalid patient ID');
        }

        const patient = await patientService.getPatientById(id);

        // log request to get patient by id endpoint, including user id and role for auditing purposes
        logger.info('Successfully retrieved patient', { userId: user.id, userRole: user.role, patientId: id });

        const patientSanitized =  {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                ssn: patient.ssn,
        }

        res.json(patientSanitized);
    } catch (error) {
        next(error);
    }
};

const createPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = await getUser(req)

        // check if user is admin or billing
        if (user.role !== 'ADMIN' && user.role !== "BILLING") {
            logger.warn('User is not authorized to access this resource', { userId: user.id, userRole: user.role });
            throw new AuthorizationError('User is not authorized to access this resource');
        }

        const patientData = req.body;
        const newPatient = await patientService.createPatient(patientData);

        logger.info('Successfully created patient', { userId: user.id, userRole: user.role });

        res.status(201).json(newPatient);
    } catch (error) {
        next(error);
    }
};



router.get(`${path}`, getAllPatients);
router.get(`${path}/:id`, getPatientById);
router.post(`${path}`, createPatient);


export default router;