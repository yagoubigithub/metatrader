const path = require("path");
const os = require("os");
const { BrowserWindow, app, ipcMain } = require("electron");
const { getAllInstalledSoftwareSync } = require("./installed");
const sudo = require("sudo-prompt");

const { name } = require("../../package.json");

const { exec, execFile } = require("child_process");

const ipcEvents = require("../ipcEvents");

const kill = require("tree-kill");

const fs = require("fs");

const fetch = require("electron-fetch").default;

const lunch = (app) => {
  execFile(path.join(app.InstallLocation, "terminal64.exe"));
};

//our window you can chanege the size  and other

let mainWindow = new BrowserWindow({
  show: true,
  height: 780,
  width: 1200,
  useContentSize: true,
  frame : false,
  webPreferences: {
    preload: path.join(__dirname, "./preload.js"),
    nodeIntegration: true,
  },
});

if (app.isPackaged) {
  mainWindow.loadFile(`${__dirname}/../index.html`);
  // mainWindow.setMenu(null);
} else {
  mainWindow.loadURL("http://localhost:3000");
}

// Automatically open Chrome's DevTools in development mode.
if (!app.isPackaged) {
    //mainWindow.webContents.openDevTools();
}

ipcMain.on(ipcEvents.GET_INSTALLED_META, (ev, auto_login_account) => {
  const softwares = getAllInstalledSoftwareSync();

  const metatraders = [];
  softwares.map((software) => {
    if (software.DisplayName) {
      if (software.DisplayName.toLowerCase().indexOf("metatrader") > -1) {
        if (software.InstallLocation) {
          const folders = fs.readdirSync(software.InstallLocation, {
            withFileTypes: true,
          });

          folders.forEach((f) => {
            if (!f.isDirectory()) {
              if (f.name.match(/terminal[0-9]*.exe/)) {
                metatraders.push({
                  ...software,
                  process: f.name,
                });
              }
            }
          });

          if (process.argv[1]) {
            if (process.argv[1] === "--hidden") {
              if (auto_login_account) lunch(software);
            }
          }
        }
      }
    }
  });

  mainWindow.webContents.send(ipcEvents.INSTALLED_META, metatraders);
});

ipcMain.on(ipcEvents.GET_HOST_USERNAME, () => {
  const username = os.userInfo().username;
  mainWindow.webContents.send(ipcEvents.HOST_USERNAME, username);
});

ipcMain.on(
  ipcEvents.SET_AUTO_LOGIN_COMPUTER,
  async (event, { host_username, host_password }) => {
    const options = {
      name,
    };

    // //   await regedit.createKey(['HKLM\\SOFTWARE\\MyApp2', 'HKCU\\SOFTWARE\\MyApp'])
    //   await regedit.putValue({
    //     'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon': {
    //         DefaultUserName: {
    //             value: host_username,
    //             type: 'REG_SZ'
    //         }
    //     },
    //     'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon': {
    //         DefaultPassword: {
    //         value: host_password,
    //         type: 'REG_SZ'
    //       }
    //     }
    //   })

    sudo.exec(
      `REG ADD "HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f & 
REG ADD "HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v DefaultDomainName /t REG_SZ /d domainname /f & 
REG ADD "HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v DefaultPassword /t REG_SZ /d "${host_password}" /f  & 
REG ADD "HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v DefaultUserName /t REG_SZ /d "${host_username}" /f  & 


`,
      options,
      function (error, stdout, stderr) {
        if (error) throw error;
        //    console.log("stdout: " + stdout);
      }
    );
  }
);

ipcMain.on(ipcEvents.REBOT, () => {
  exec("shutdown -r -f -y -t 15");
});

ipcMain.on(ipcEvents.SET_AUTO_STARTUP, (ev, auto_startup) => {
  app.setLoginItemSettings({
    openAtLogin: auto_startup,
    args: ["--hidden"],
  });
});

ipcMain.on(ipcEvents.DISABLE, (ev, _process) => {
  if (_process) {
    exec("tasklist", (err, stdout, stderr) => {
      stdout.split("\n").map((line) => {
        const process = line.split(/\s+/)[0];

        if (process.toLowerCase().indexOf(_process) > -1) {
          //    console.log("pid = ", line.split(/\s+/)[1]);

          try {
            const pid = parseInt(line.split(/\s+/)[1]);
            kill(pid);
          } catch (error) {
            console.log(error);
          }
        }
      });
    });
  }
});

ipcMain.on(ipcEvents.AUTO_SOFTWARES, (ev, softwares) => {
  softwares.map((software) => {});
});

ipcMain.on(ipcEvents.STAR_SOFTWARE, (ev, software) => {
  console.log("-----start-software------");

  // setTimeout(()=>{
  //   exec("wmic process get name, ExecutablePath /format:list", (err, stdout, stderr) => {

  //     const lines = stdout.split("\n").filter(s=>s.indexOf("terminal") >-1)
  //     for (let i = 0; i < lines.length; i++) {
  //       const line = lines[i];

  //       if(line.indexOf("ExecutablePath") > -1){
  //         const __path = line.split("=")[1];

  //         const nextLine = lines[i + 1 ];
  //         const name = nextLine.split("=")[1]
  //         console.log(__path )
  //       }

  //     }

  //   })
  // } , 10000)
  execFile(path.join(software.InstallLocation, software.process));
});

ipcMain.on(ipcEvents.GET_IF_IS_ONLINE, async (ev, softwares) => {

  let  softs = [...softwares];
  let  count = 0;
  
  softwares.map((software , s_index) => {
    exec(
      "wmic process get name, ExecutablePath , ProcessID /format:list",
      async (err, stdout, stderr) => {
        const allLines = stdout.split("\n");
        const lines = [];
        let ProcessID = 0;

        allLines.map((s, index) => {
          if (s.indexOf(software.InstallLocation) > -1) {
            lines.push(s.split("=")[1]);
            ProcessID = allLines[index + 2].split("=")[1];
            
          }
        });
        

        if (lines.length > 0) {
          const res = await fetch(
            `http://127.0.0.1:5000/islogin?name=${software.DisplayName}&processId=${ProcessID}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );
          const online = await res.json();

      


        
         softs[s_index] = {
          ...software,
          online,
        }
      
       
        
            

          
          
        }else {



          if(software.MajorVersion == "5")
          console.log(software)


          if(software.started){
            execFile(path.join(software.InstallLocation, software.process));
            softs[s_index] = {
              ...software,
              online : true,
            }
          }else{
            softs[s_index] = {
            ...software,
            online : false,
          }
          }
          
        }

        count++;
        if(count === softs.length){
          mainWindow.webContents.send(ipcEvents.IS_ONLINE, softs);
          console.log(count)
        }
       
        

    
      }
    );

  });


 
});




ipcMain.on(ipcEvents.MIN, ()=>{

  mainWindow.minimize()
})

ipcMain.on(ipcEvents.MAX, ()=>{

  if(mainWindow.isMaximized()){
    mainWindow.unmaximize()
  }else {
    mainWindow.maximize()
  }
})
module.exports = mainWindow;
