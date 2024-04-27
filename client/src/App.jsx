import './App.css'
import Home from './pages/Home/home';
import Signup from './pages/Signup/Signup'
import Signin from './pages/SignIn/SignIn'
import { BrowserRouter , Routes, Route } from 'react-router-dom';

const App=()=>{
  return(
    <BrowserRouter>
     <Routes>
       <Route path='/' element={<Home/>}/>
       <Route path='/signup' element={<Signup/>}/>
       <Route path='/signin' element={<Signin/>}/>

     </Routes>
    </BrowserRouter>

   
  )
}

export default App;