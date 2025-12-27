import { account } from '@/lib/appwrite';
import { getPrisma } from '@/lib/prisma';

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

export async function getCurrentUser() {
  const session = await getServerSession();
  if (!session || !session.user) return null;

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}
