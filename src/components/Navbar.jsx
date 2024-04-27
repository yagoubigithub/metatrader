import CloseIcon from '@mui/icons-material/Close'
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import React from 'react'

const Navbar = () => {
  return (
    <div style={{display : "flex" , alignItems : "center" , justifyContent : "end" , width : "100vw" , backgroundColor :"#21262d"}}>

    <div id="right-buttons">
        <button className='top-nav-btn' onClick={()=>window.electron.min()}>
            <HorizontalRuleIcon />
        </button>
        <button className='top-nav-btn' onClick={()=>window.electron.max()} >
        <FilterNoneIcon></FilterNoneIcon>
        </button>
       
        <button className='top-nav-btn' onClick={()=>window.electron.close()}>
            <CloseIcon />
        </button>
    </div>
    </div>
  )
}

export default Navbar