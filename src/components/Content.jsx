import React, { useEffect, useRef, useState } from 'react'



import { blue } from '@mui/material/colors';

import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';

import TextField from '@mui/material/TextField';



import moment from 'moment';


//icons
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
let reboot_interval = null;
let online_interval = null;
const Content = () => {


  const initialized = useRef(false);


  const [softwares, setSoftwares] = useState([])

  const [empty, setEmpty] = useState(false);

  const [loading, setLoding] = useState(true);

  const [auto_login_computer, seTauto_login_computer] = useState(localStorage.getItem("auto_login_computer") || false)
  const [openHostCredentialsDialog, setOpenHostCredentialsDialog] = useState(false)
  const [host_username, setHost_username] = useState(localStorage.getItem("host_username") || "")
  const [host_password, setHost_password] = useState(localStorage.getItem("host_password") || "")


  const [auto_login_account, seTauto_login_account] = useState(localStorage.getItem("auto_login_account") || {})
  const [openAccountCredentialsDialog, setOpenAccountCredentialsDialog] = useState(false)


  const [account_login, setAccount_login] = useState(localStorage.getItem("account_login") || "")
  const [account_password, setAccount_password] = useState(localStorage.getItem("account_password") || "")
  const [account_server, setAccount_server] = useState(localStorage.getItem("account_server") || "")

  const [weekly_rebot, setWeekly_rebot] = useState(localStorage.getItem("weekly_rebot") || false)
  const [next_rebot, setNext_rebot] = useState(localStorage.getItem("weekly_rebot") || new Date().getTime() + 1 * 7 * 24 * 60 * 60 * 1000)



  const [auto_startup, setAuto_startup] = useState(localStorage.getItem("auto_startup") || false)




  const [auto_softwares, setAuto_softwares] = useState(localStorage.getItem("auto_softwares") === null || localStorage.getItem("auto_softwares") === "" ? [] : JSON.parse(localStorage.getItem("auto_softwares")))
  const [auto_login_softwares, setAuto_login_softwares] = useState(localStorage.getItem("auto_login_softwares") === null || localStorage.getItem("auto_login_softwares") === "" ? [] : JSON.parse(localStorage.getItem("auto_login_softwares")))



  useEffect(() => {


    if (!initialized.current) {
      initialized.current = true

         //get installed Metatrad

    window.electron.getInstalled(auto_login_account, (event, value) => {

      setLoding(false)
      if (value.length === 0) {
        setEmpty(true)
      } else {

        setSoftwares(value)
        localStorage.setItem("softwares", JSON.stringify(value))

        setTimeout(() => {

          value.map(software => {
            if (auto_softwares.filter(s => s === software.InstallLocation).length === 0) {

              const _softwares = [...value].map(s=>{
                if(s.InstallLocation === software.InstallLocation){ 
                  return {
                    ...s,
                    started : true
                  }
                }else {
                  return s;
                }
                
              })
          
              localStorage.setItem("softwares", JSON.stringify(_softwares))
              setSoftwares(_softwares)
              window.electron.startSoftware(software)
            }
            return null;
          })
        }, 2000);
      }

    })


    window.electron.getHostUsername((ev, host_username) => {
      localStorage.setItem("host_username", host_username)
      setHost_username(host_username)
    })


    if (!localStorage.getItem("next_rebot")) {
      const next_rebot = new Date().getTime() + 1 * 7 * 24 * 60 * 60 * 1000
      localStorage.setItem("next_rebot", next_rebot);
      setNext_rebot(next_rebot)
    }

    if (weekly_rebot) {
      do_rebot_interval()
    }




    do_online_interval()

    window.electron.auto_softwares(auto_softwares)

    setTimeout(() => {
      auto_login_softwares.map(s => {


        if (s.InstallLocation) {
          fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              ...s

            }),
          })
            .then((responce) => {
              return responce.json();
            })
            .then((data) => {


            })
            .catch((err) => {
              console.log(err)
            })
        }
        return null;

      })

    }, 15000);

  
    
    }


 

  }, [])

  const saveAutoLoginCredenatials = () => {
    seTauto_login_computer(true);
    localStorage.setItem("auto_login_computer", true)
    setOpenHostCredentialsDialog(false)
    window.electron.setAutoLoginComputer(host_username, host_password)
  }


  const saveAutoLoginAccount = () => {

    const software = { ...auto_login_account, account_password, account_login, account_server };
    const _auto_login_softwares = [...auto_login_softwares, { ...software }]
    setAuto_login_softwares(_auto_login_softwares)
    localStorage.setItem("auto_login_softwares", JSON.stringify(_auto_login_softwares))

    setOpenAccountCredentialsDialog(false);
  }



  const do_rebot_interval = () => {
    clearInterval(reboot_interval)
    reboot_interval = setInterval(() => {

      if (new Date().getTime() >= next_rebot) {
        const _next_rebot = new Date().getTime() + 1 * 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("next_rebot", _next_rebot)

        //rebot

        window.electron.rebot()


      }
    }, 60 * 60 * 1000);
  }


  const do_online_interval = () => {
    clearInterval(online_interval)
    online_interval = setInterval(() => {


      const _softeares = JSON.parse(localStorage.getItem("softwares"))





      window.electron.isonline(_softeares, (ev, softwares) => {

        console.log(softwares)
        setSoftwares(softwares)
        localStorage.setItem("softwares", JSON.stringify(softwares))
      })


    }, 10000);
  }
  const disable = (software) => {


    const _softwares = [...softwares].map(s=>{
      if(s.InstallLocation === software.InstallLocation){ 
        return {
          ...s,
          started : false
        }
      }else {
        return s;
      }
      
    })


    console.log(_softwares)

   

    localStorage.setItem("softwares", JSON.stringify(_softwares))
    setSoftwares(_softwares)

    window.electron.disable(software.process)

  }


  const start_software_auto = (software) => {

    if (auto_softwares.filter(s => s === software).length > 0) {
      //delete
      const _auto_softwares = [...auto_softwares.filter(s => s !== software)];
      setAuto_softwares(_auto_softwares)
      localStorage.setItem("auto_softwares", JSON.stringify(_auto_softwares))
    } else {
      //add
      const _auto_softwares = [...auto_softwares];
      _auto_softwares.push(software)
      setAuto_softwares(_auto_softwares)
      localStorage.setItem("auto_softwares", JSON.stringify(_auto_softwares))

    }

  }


  const startSoftware = (software) => {

    const _softwares = [...softwares].map(s=>{
      if(s.InstallLocation === software.InstallLocation){ 
        return {
          ...s,
          started : true
        }
      }else {
        return s;
      }
      
    })

    localStorage.setItem("softwares", JSON.stringify(_softwares))
    setSoftwares(_softwares)

    window.electron.startSoftware(software)
  }


  const start_auto_login = (software) => {


    if (auto_login_softwares.filter(s => s.InstallLocation === software.InstallLocation).length > 0) {
      //delete
      const _auto_login_softwares = [...auto_login_softwares.filter(s => s.InstallLocation !== software.InstallLocation)]
      setAuto_login_softwares(_auto_login_softwares)
      localStorage.setItem("auto_login_softwares", JSON.stringify(_auto_login_softwares))

    } else {
      //add

      setOpenAccountCredentialsDialog(true)

      seTauto_login_account(software)
      // const _auto_login_softwares = [...auto_login_softwares,{...software}]
      // setAuto_login_softwares(_auto_login_softwares)
      // localStorage.setItem("auto_login_softwares" , JSON.stringify(_auto_login_softwares))

    }
  }
  return (
    <div style={{width:"100%"}}>

      {loading ? <p>Loading ...</p> : empty ? <p>Empty</p> : softwares.map((software , s_index) => {
        return (
          <Card  key={s_index} sx={{margin : 2 ,display: "flex" , padding : 1 , backgroundColor  :"#0d1117", color :"white"}}>
          

              <img src={`atom://${software.DisplayIcon}`} width="150" style={{ marginLeft: 15, marginRight: 30  }} alt="" />
              <div style={{ marginRight: 15 , flex : 5 }}>
                <h3>
                  {software.DisplayName}
                </h3>



                <h6> Location : {software.InstallLocation}</h6>

                <div style={{ display: "flex" }}>
                  <Checkbox
                    edge="start"
                    onChange={() => start_auto_login(software)}
                    checked={auto_login_softwares.filter(s => s.InstallLocation === software.InstallLocation).length > 0}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      color: "white",
                      '&.Mui-checked': {
                        color: blue[600],
                      },
                    }}

                  />
                  <p>Auto Login</p>
                </div>

                <div style={{ display: "flex" }}>
                  <Checkbox
                    edge="start"
                    onChange={() => start_software_auto(software.InstallLocation)}
                    checked={auto_softwares.filter(s => s === software.InstallLocation).length > 0}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      color: "white",
                      '&.Mui-checked': {
                        color: blue[600],
                      },
                    }}

                  />
                  <p>disable auto start</p>
                </div>
              </div>

              <div style={{ flex : 1.2}}>




                <Fab size='small' sx={{
                  margin: 1
                }} color="error" onClick={() => disable(software)} ><CloseIcon /></Fab >
                <Fab size='small' sx={{
                  margin: 1
                }} color="success" onClick={() => startSoftware(software)}>
                  <PlayArrowIcon />
                </Fab >



                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{marginLeft : 15}} className={`dot ${software.online ? "bg-green" : "bg-gray"}`}></div>
                  <div style={{marginLeft : 15}}>{software.online ? "online" : "offline"}</div>
                  <div>{software.online}</div>
                </div>



              </div>
         
          </Card>

        )
      })}



      <div>


        <List sx={{ width: '100%', color : "white"}}>


          <ListItem
            disablePadding
          >


            <ListItemButton role={undefined} dense onClick={() => {
              localStorage.setItem("auto_startup", !auto_startup)
              window.electron.setAuto_startup(!auto_startup)
              setAuto_startup(!auto_startup)


            }}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={Boolean(auto_startup)}
                  tabIndex={-1}
                  disableRipple

                  sx={{
                    color: "white",
                    '&.Mui-checked': {
                      color: blue[600],
                    },
                  }}
                

                />
              </ListItemIcon>
              <ListItemText primary={`Automatic startup of the program upon powering `} />
            </ListItemButton>
          </ListItem>



          <ListItem
            disablePadding
          >


            <ListItemButton role={undefined} dense onClick={() => {
              if (!weekly_rebot) {
                do_rebot_interval()
              }
              setWeekly_rebot(!weekly_rebot)
            }}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={weekly_rebot}
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    color: "white",
                    '&.Mui-checked': {
                      color: blue[600],
                    },
                  }}

                />
              </ListItemIcon>
              <ListItemText primary={<p>weekly automatic reboot <small>Next Rebot {moment(next_rebot).fromNow()}</small></p>} />
            </ListItemButton>
          </ListItem>


          <ListItem
            disablePadding
          >


            <ListItemButton role={undefined} dense onClick={() => {
              if (!auto_login_computer) {
                setOpenHostCredentialsDialog(true)
              }

              else
                seTauto_login_computer(!auto_login_computer)
            }}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={auto_login_computer}
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    color: "white",
                    '&.Mui-checked': {
                      color: blue[600],
                    },
                  }}

                />
              </ListItemIcon>
              <ListItemText primary={`Auto-login feature for the computer  `} />
            </ListItemButton>
          </ListItem>







        </List>

        {/* <button onClick={startRecording}>detect lose connection</button> */}
      </div>


      <Dialog onClose={() => setOpenHostCredentialsDialog(false)} open={openHostCredentialsDialog}>
        <DialogTitle>Host Credentials</DialogTitle>

        <DialogContent>


          <TextField
            label="HostName"

            defaultValue={localStorage.getItem("host_username")}
            size="small"
            fullWidth
            margin='dense'
            value={host_username}

            onChange={(e) => {
              setHost_username(e.target.value)
              localStorage.setItem("host_username", e.target.value)

            }}
          />


          <TextField
            label="Password"

            defaultValue={localStorage.getItem("host_password") || ""}
            size="small"
            fullWidth
            margin='dense'
            type='password'

            value={host_password}

            onChange={(e) => {
              setHost_password(e.target.value)
              localStorage.setItem("host_password", e.target.value)

            }}
          />


        </DialogContent>


        <DialogActions>
          <Button onClick={() => setOpenHostCredentialsDialog(false)}>Cancel</Button>
          <Button onClick={saveAutoLoginCredenatials} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>






      <Dialog onClose={() => setOpenAccountCredentialsDialog(false)} open={openAccountCredentialsDialog}>
        <DialogTitle>Account Credentials</DialogTitle>

        <DialogContent>


          <TextField
            label="Login"


            size="small"
            fullWidth
            margin='dense'
            value={account_login}

            onChange={(e) => {
              setAccount_login(e.target.value)


            }}
          />


          <TextField
            label="Password"


            size="small"
            fullWidth
            margin='dense'
            type='password'

            value={account_password}

            onChange={(e) => {
              setAccount_password(e.target.value)


            }}
          />



          <TextField
            label="Server"


            size="small"
            fullWidth
            margin='dense'
            value={account_server}

            onChange={(e) => {
              setAccount_server(e.target.value)


            }}
          />
        </DialogContent>


        <DialogActions>
          <Button onClick={() => setOpenAccountCredentialsDialog(false)}>Cancel</Button>
          <Button onClick={saveAutoLoginAccount} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>


    </div>

  )
}

export default Content