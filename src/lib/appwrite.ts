import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Note: API key authentication for server-side operations
// The Appwrite SDK may not support setKey() method in this version
// We'll need to use REST API calls directly for authenticated operations

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };

export const DATABASE_ID = 'earnflow';
export const USERS_COLLECTION_ID = 'users';
