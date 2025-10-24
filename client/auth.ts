import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { loginApi } from '@/app/lib/api/auth';

export const { auth, signIn, signOut, handlers } = NextAuth({
   ...authConfig,
   providers: [
      Credentials({
         async authorize(credentials) {
            const parsedCredentials = z
               .object({
                  email: z.string().email(),
                  password: z.string().min(6),
               })
               .safeParse(credentials);

            if (parsedCredentials.success) {
               const { email, password } = parsedCredentials.data;

               // Call backend API
               const result = await loginApi(email, password);

               if (result.success && result.data) {
                  // Return user data with accessToken
                  return {
                     id: result.data.user._id,
                     name: result.data.user.name,
                     email: result.data.user.email,
                     avatar: result.data.user.avatar,
                     bio: result.data.user.bio,
                     status: result.data.user.status,
                     accessToken: result.data.accessToken,
                  };
               }
            }

            console.log('Invalid credentials');
            return null;
         },
      }),
   ],
   callbacks: {
      async jwt({ token, user }) {
         // Add accessToken to JWT token on sign in
         if (user) {
            token.accessToken = (user as any).accessToken;
            token.id = user.id;
            token.name = user.name;
            token.email = user.email;
            token.avatar = (user as any).avatar;
            token.bio = (user as any).bio;
            token.status = (user as any).status;
         }
         return token;
      },
      async session({ session, token }) {
         // Add user data and accessToken to session
         if (token) {
            session.user = {
               ...session.user,
               id: token.id as string,
               name: token.name as string,
               email: token.email as string,
               avatar: token.avatar as string,
               bio: token.bio as string,
               status: token.status as string,
            };
            session.accessToken = token.accessToken as string;
         }
         return session;
      },
   },
   session: {
      strategy: 'jwt',
      maxAge: 15 * 600,
   },
});
