import React from 'react'
import Sidebar from './components/Sidebar'
import Content from './components/Content'
import Navbar from './components/Navbar'
import "./App.css"



const App = () => {
  return (
    <div id='app'>

<Navbar />
<div>
    {/* <Sidebar /> */}
      <Content />
</div>
    
    </div>
  )
}

export default App