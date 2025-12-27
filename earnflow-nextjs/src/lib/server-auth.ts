import { account } from '@/lib/appwrite';
import { cookies } from 'next/headers';

export async function getServerSession() {
  try {
    const session = await account.get();
    return {
      user: {
        id: session.$id,
        email: session.email,
        name: session.name,
      }
    };
  } catch (error) {
    return null;
  }
}
