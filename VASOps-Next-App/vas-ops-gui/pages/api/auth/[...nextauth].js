import NextAuth from 'next-auth';
import OneLoginProvider from 'next-auth/providers/onelogin'
//import GitHubProvider from 'next-auth/providers/github'

export default NextAuth({
    providers:[
        OneLoginProvider({
            clientId: process.env.ONELOGIN_CLIENT_ID,
            clientSecret: process.env.ONELOGIN_CLIENT_SECRET,
            issuer: process.env.ONELOGIN_ISSUER,
            wellKnown: `${process.env.ONELOGIN_ISSUER}/.well-known/openid-configuration`,
        }),
       
    ],
    // pages:{
    //     signIn: '/Login'
    // }
})