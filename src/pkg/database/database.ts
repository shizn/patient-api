import { PrismaClient } from '../../../generated/prisma/client'
/**
 * Database connection options
 */
interface DatabaseOptions {
  logging?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Database class to manage Prisma client and database connections
 */
export class Database {
  private static instance: Database;
  private prisma: PrismaClient;
  private isConnected: boolean = false;
  private options: DatabaseOptions;

  /**
   * Create a new Database instance
   * @param options - Database connection options
   */
  private constructor(options: DatabaseOptions = {}) {
    this.options = {
      logging: options.logging ?? process.env.NODE_ENV === 'development',
      maxRetries: options.maxRetries ?? 5,
      retryDelay: options.retryDelay ?? 5000,
    };

    // Initialize Prisma client with logging if enabled
    this.prisma = new PrismaClient({
      log: this.options.logging 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  /**
   * Get singleton instance of Database
   * @param options - Database connection options
   * @returns Database instance
   */
  public static getInstance(options: DatabaseOptions = {}): Database {
    if (!Database.instance) {
      Database.instance = new Database(options);
    }
    return Database.instance;
  }

  /**
   * Connect to the database
   * @returns Promise that resolves when connection is established
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    let retries = 0;
    while (retries < this.options.maxRetries!) {
      try {
        await this.prisma.$connect();
        this.isConnected = true;
        console.log('Successfully connected to the database');
        return;
      } catch (error) {
        retries++;
        console.error(`Database connection attempt ${retries} failed:`, error);
        
        if (retries >= this.options.maxRetries!) {
          throw new Error(`Failed to connect to database after ${retries} attempts`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
      }
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('Successfully disconnected from the database');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Get the Prisma client instance
   * @returns PrismaClient instance
   * @throws Error if not connected to the database
   */
  public getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() before using the client.');
    }
    return this.prisma;
  }
}

// Export a default database instance
export const db = Database.getInstance();

// Export the Prisma client type for convenience
export type { PrismaClient };