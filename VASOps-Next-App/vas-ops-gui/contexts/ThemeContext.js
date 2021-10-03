import { createContext, useState } from 'react'

export const ThemeContext =createContext()

const ThemeContextProvider=(props)=>{
   
    const [theme, setTheme]=useState('light-theme');
    const [editorTheme, setEditorTheme]=useState('dark');

    const changeTheme=()=>{
       
        if (theme==='light-theme'){
            setTheme('dark-theme');
            
        }
        else if (theme==='dark-theme'){
            setTheme('light-theme');
            
        }
    }

    return(
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {props.children}
        </ThemeContext.Provider>
    )
}

export default ThemeContextProvider
