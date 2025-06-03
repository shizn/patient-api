import { PrismaClient } from '../generated/prisma'
import {PatientService} from "../src/services/patient.service";
import patientRouter from "../src/routes/patientRouter";
const prisma = new PrismaClient()
const patientService = new PatientService()
async function main() {
    await prisma.user.upsert({
        where: { email: "test1@user.com" },
        update: {},
        create: {
            password: "<PASSWORD>",
            name: "test 1",
            role: "BILLING",
            email: "test1@user.com"
        }
    })

    await prisma.user.upsert({
        where: { email: "test2@user.com" },
        update: {},
        create: {
            password: "<PASSWORD>",
            name: "test 2",
            role: "ADMIN",
            email: "test2@user.com"
        }
    })

    await prisma.user.upsert({
        where: { email: "test3@user.com" },
        update: {},
        create: {
            password: "<PASSWORD>",
            name: "test 3",
            role: "PROVIDER",
            email: "test3@user.com"
        }
    })

    await patientService.createPatient({
        firstName: "test first 1",
        lastName: "test Last 1",
        dob: "2022-09-27",
        ssn: "666-66-7777",
        ivKey: ''
    })

    await patientService.createPatient({
        firstName: "test first 2",
        lastName: "test Last 2",
        dob: "2022-09-27",
        ssn: "666-66-7777",
        ivKey: ''
    })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })