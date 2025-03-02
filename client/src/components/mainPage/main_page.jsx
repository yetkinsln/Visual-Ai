import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './navbar'
import MainContent from '../content'

const MainPage = props =>{

  return (
  
      
        <>
         <Navbar />
         <MainContent />
        </>
        
       
  
  )
}

export default MainPage