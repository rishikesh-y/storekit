import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    // set up a callback for jqt to console log the github ID, github Email,
    // github name and github token
    async jwt({token, user, account, profile, isNewUser}) {
      console.log("token::", token);
      console.log('user::', user);
      console.log('account::', account);
      console.log('profile::', profile);

      if (account) {
        token.account = account;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },

    // setup a callback for session to console log the session
    async session({session, token}) {
      if (!session?.user || !token?.account) {
        return session
      }

      if (token.profile.name) {
        session.user.name = token.profile.name;
        session.user.username = token.profile.login;
      }
      session.user.accessToken = token.account.access_token;
      // console.log("session:: ", session);
      return session;
    }
  }
};

export default NextAuth(authOptions);
