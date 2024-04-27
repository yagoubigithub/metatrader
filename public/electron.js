const { app ,protocol, dialog, Tray, ipcMain, Menu } = require("electron");


 
const {execFile}  = require("child_process")

const path = require("path");


const kill = require('tree-kill');
const ipcEvents = require("./ipcEvents");

let python;
let mainWindow;

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("auto-detect", "false");
app.commandLine.appendSwitch("no-proxy-server");


require("v8-compile-cache");

app.disableHardwareAcceleration();
Menu.setApplicationMenu(null)

app.on("ready", async () => {
  

 

  try {
 
  
  
  protocol.registerFileProtocol('atom', (request, callback) => {
   // console.log(request.url)
    const url = request.url.substr(7)
    callback({ path: url })
  })
 
  } catch (error) {
    
    dialog.showMessageBox(null , {
      title : "error",
      message : error
    })
  }


    mainWindow = require("./windows/mainWindow");

  //dev tools for installing extention help to develop


//   const DevTools = require('./devTools')
//   const devTools = new DevTools(!app.isPackaged);





 //set the icon tray for windows and mac
  //for mac should have 2 icons one 16x16 and other 32X32
  const iconName =
  process.platform === "win32" ? "windows-icon.png" : "iconTemplate.png";



let iconPath = app.isPackaged ? path.join(__dirname, `./img/${iconName}`) :  path.join(__dirname, `./img/${iconName}`);




//initial the tray
let tray = new Tray(iconPath);

//this toolTip is for when you hover the tray icon will show the title
//I just take the title from index.html
tray.setToolTip("Metatrader");



 

tray.on("click" ,  ()=>{

    if(mainWindow.isVisible()){
        mainWindow.hide();
    }else{
        mainWindow.show();
    }
})




 python = execFile(path.join(__dirname , "main.exe"), [],{

  windowsHide : true,
  shell  : true
 }, 

    (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        console.log(stdout);
    });





    


});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()

    kill(python.pid)
    app.quit()
    app.exit(0)
  })



  ipcMain.on(ipcEvents.CLOSE, ()=>{
   // kill(python.pid)
    //app.exit(0)
    //app.quit()
    mainWindow.hide();
    
  })