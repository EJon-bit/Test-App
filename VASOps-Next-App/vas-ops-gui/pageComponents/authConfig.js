const authConfiguration = {
    client_id: process.env.OIDC_CLIENT_ID,
    redirect_uri: process.env.OIDC_REDIRECT_URI,
    response_type: 'code',    
    scope: 'openid profile',
    authority: 'https://' + process.env.ONELOGIN_SUBDOMAIN + '.onelogin.com/oidc/2',  
    silent_redirect_uri: 'http://localhost:3000/authentication/silent_callback',
    automaticSilentRenew: true,
    loadUserInfo: true,
  };
  
  export default authConfiguration;