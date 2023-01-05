import NextAuth, { Account, DefaultSession, Profile } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** Oauth access token */
      accessToken?: accessToken;
      id: string;
      username: string;
    } & DefaultSession["user"]
  }

  interface Profile {
    login: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    account: Account;
    profile: Profile;
  }
}
