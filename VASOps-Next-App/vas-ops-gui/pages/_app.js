import dynamic from 'next/dynamic';
// import PageLayout from '../pageComponents/Global/Layout'
import ConfigContextProvider from '../contexts/ConfigContext';
import DrawerContextProvider from '../contexts/DrawerContext';
//import { ThemeContext } from '../contexts/ThemeContext';

import { SessionProvider, useSession, signIn } from "next-auth/react"
import { useEffect } from 'react';
import OneLogin from 'next-auth/providers/onelogin';

//import '../styles/globals.css'
require('../styles/global.less');
require('../styles/antdVariables.less');
require('../styles/drawer.less');
require('../styles/modal.less');


const PageLayoutNoSSR = dynamic(
  () => import('../pageComponents/Global/Layout'),
  { ssr: false }
)

const Auth=({ children })=>{
  const { data: session, loading } = useSession()
  const isUser = !!session?.user
  useEffect(() => {
    if (loading) return // Do nothing while loading
    if (!isUser) signIn() // If not authenticated, force log in
  }, [isUser, loading])

  if (isUser) {
    return children
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>
}

const  MyApp=({ Component,  pageProps: { session, ...pageProps } })=>{
  return (
   
          <div className="light-theme">                            
                  <SessionProvider session={session}>
                    {Component.auth ? (
                      <Auth>
                        <ConfigContextProvider>            
                          <DrawerContextProvider> 
                            <PageLayoutNoSSR>
                              <Component {...pageProps} />
                            </PageLayoutNoSSR>
                          </DrawerContextProvider> 
                        </ConfigContextProvider>                          
                      </Auth>
                    ) : null}
                  </SessionProvider>
             
          </div>
       
    
  )
}

export default MyApp
