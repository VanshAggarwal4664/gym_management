import { useState,useEffect } from 'react';
import './herobanner.css'

const Hero=()=>{
    const[Showimage,setShowimage] = useState(false);
    useEffect(()=>{
        setShowimage(true);
    
    }
    ,[]);

    return(
        <section className="herosection">
            <div className="left-hero">
                <h1>Stay on <span>Track</span> We've Got You Covered.</h1>
                <p>Streamline your operations and focus on what truly matters.Join the Gymify community today and take your gym to the next level!</p>
                <button>Join the Community</button>  
            </div>
            <div className="right-hero">
               <img className={`slide-from-right ${Showimage?'show':''}`} src="src\assets\hero_banner.png" alt="" />
            </div>
        </section>
    )
}
export default  Hero;