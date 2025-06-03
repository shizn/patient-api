import {Patient, PrismaClient} from '../../generated/prisma';
import {NotFoundError} from '../utils/errors';
import {decrypt, encrypt, EncryptionOptions, generateEncryptionKey} from "../pkg/encryption/encrypter";

const encryptionOptions: EncryptionOptions = {
  ivLength: 16,
  algorithm: "aes-256-cbc",
  secretKey: "test"
};

export class PatientService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }


  /**
   * Encrypts the SSN field of a patient record
   *
   * @param patent - Patient data without id field
   * @returns Patient data with encrypted SSN and initialization vector
   */
  private encryptSSN(patent: Omit<Patient, 'id'>): Omit<Patient, 'id'> {
    const hashedSSN = encrypt(patent.ssn, encryptionOptions)

    patent.ssn = hashedSSN.encryptedData;
    patent.ivKey = hashedSSN.iv;

    return patent;
  }

  /**
   * Decrypts the SSN field of a patient record
   *
   * @param patent - Patient data with encrypted SSN
   * @param iv - Initialization vector used during encryption
   * @returns Patient data with decrypted SSN
   */
  private decryptSSN(patent: Patient, iv:string): Patient {
    patent.ssn = decrypt(patent.ssn, iv, encryptionOptions)

    return patent;
  }

  public async getAllPatients(): Promise<Patient[]> {
    return this.prisma.patient.findMany();
  }

  public async getPatientById(id: number): Promise<Patient> {
    const patient: Patient | null = await this.prisma.patient.findFirst({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundError(`Patient with id ${id} not found`);
    }
    const patientSanitized = this.decryptSSN(patient, patient.ivKey)

    if (!patient) {
      throw new NotFoundError(`Patient with id ${id} not found`);
    }

    return patient;
  }

  public async createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {

    const patientSanitized = this.encryptSSN(patientData)

    return this.prisma.patient.create({
      data: patientSanitized
    });
  }
}
