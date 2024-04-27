

const { Tray, app, dialog } = require("electron");


const path = require("path");
const fs = require("fs");

const mainWindow = require("./windows/mainWindow");


 //set the icon tray for windows and mac
  //for mac should have 2 icons one 16x16 and other 32X32
  const iconName =
  process.platform === "win32" ? "windows-icon.png" : "iconTemplate.png";



let iconPath = app.isPackaged ? path.join(__dirname, `./img/${iconName}`) :  path.join(__dirname, `./img/${iconName}`);




//initial the tray
let tray = new Tray(iconPath);

//this toolTip is for when you hover the tray icon will show the title
//I just take the title from index.html
tray.setToolTip("Time Trackit");



 

tray.on("click" ,  ()=>{

    if(mainWindow.isVisible()){
        mainWindow.hide();
    }else{
        mainWindow.show();
    }
})

module.exports = tray;
