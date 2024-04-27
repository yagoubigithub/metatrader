const {contextBridge, ipcRenderer , app} = require('electron');




const ipcEvents =  require("./../ipcEvents") 



contextBridge.exposeInMainWorld('electron', {

    getInstalled : (auto_login_account , callback ) => {
        ipcRenderer.send( ipcEvents.GET_INSTALLED_META ,auto_login_account )

        ipcRenderer.on(ipcEvents.INSTALLED_META , callback)

        return ()=> {
            ipcRenderer.removeListener(ipcEvents.INSTALLED_META , callback);
        }
    },
    getHostUsername : (callback) => {
        ipcRenderer.send( ipcEvents.GET_HOST_USERNAME  )

        ipcRenderer.on(ipcEvents.HOST_USERNAME , callback)

        return ()=> {
            ipcRenderer.removeListener(ipcEvents.HOST_USERNAME , callback);
        }
    },
    setAutoLoginComputer : (host_username , host_password) => {
        ipcRenderer.send( ipcEvents.SET_AUTO_LOGIN_COMPUTER  , {host_username , host_password} )
    },
    rebot : ()=>{
        ipcRenderer.send( ipcEvents.REBOT   )
    },
    setAuto_startup : (auto_startup)=>{
       ipcRenderer.send(ipcEvents.SET_AUTO_STARTUP , auto_startup)
    },
    disable : (process)=>{
        ipcRenderer.send(ipcEvents.DISABLE , process)
    },
    auto_softwares : (softwares) => {
        ipcRenderer.send(ipcEvents.AUTO_SOFTWARES , softwares)
    },
    startSoftware : (software)=>{
        ipcRenderer.send(ipcEvents.STAR_SOFTWARE , software)
    },
    isonline : (softwares , callback)=> {
        ipcRenderer.send( ipcEvents.GET_IF_IS_ONLINE  , softwares )

        ipcRenderer.on(ipcEvents.IS_ONLINE , callback)

        return ()=> {
            ipcRenderer.removeListener(ipcEvents.IS_ONLINE , callback);
        }
    }
    ,
    min : ()=>{
        ipcRenderer.send( ipcEvents.MIN   )
    },
    close : ()=>{
        ipcRenderer.send( ipcEvents.CLOSE   )
    }

    ,max : ()=>{
        ipcRenderer.send( ipcEvents.MAX   )
    }

})