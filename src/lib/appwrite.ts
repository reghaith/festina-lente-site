import { Client, Account, Databases, ID } from 'appwrite';

const project_id = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
console.log('Appwrite Project ID:', project_id ? 'Set' : 'NOT SET');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(project_id || '');

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };

export const DATABASE_ID = 'earnflow';
export const USERS_COLLECTION_ID = 'users';
