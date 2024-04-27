const { exec, execSync } = require('child_process');

const MAX_BUFFER_SIZE = 1024 * 5000;

const getQueryStringArray = () => {
    switch(process.arch) {
        case 'x64': return [
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s',
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
        ];
        default: return [
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
        ];
    }
};

const getWindowsCommandPath = () => {
    if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
        return '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
    } else {
        return '%windir%\\System32';
    }
};


const getAllInstalledSoftwareSync = () => {
    const resultsArray = getQueryStringArray().map((queryString) => {
        const result = execSync(queryString , {windowsHide  : true , maxBuffer : 1024 * 5000}).toString()
        
        return result;
    });
    const fullList = resultsArray.slice(1).reduce((accumulatingList, queryResult) => {
        return accumulatingList + queryResult.trimRight();
    }, resultsArray[0].trim());
    return processCmdOutput(fullList);
};

const processCmdOutput = (fullList) => {
    const softwareList = [];
    fullList.split(/^HKEY_LOCAL_MACHINE/m).forEach((softwareBlock, index) => {

        
        if(index==0) return;
        if(softwareBlock.toLowerCase().indexOf("metatrader") === -1) return;
       
        
        const softwareObject = {};
        let lastKey = '';
        let lastValue = '';

        const softwareLines = softwareBlock.split(/\r?\n/);
        softwareObject['RegistryDirName'] = softwareLines.shift().match(/^(\\[^\\]+)*?\\([^\\]+)\s*$/)[2];
        softwareLines.forEach(infoLine => {
            if (infoLine.trim()) {
                let infoTokens = infoLine.match(/^\s+(.+?)\s+REG_[^ ]+\s*(.*)/);
                if (infoTokens) {
                    infoTokens.shift();
                    lastKey = infoTokens[0];
                    lastValue = infoTokens[1];
                } else {
                    lastValue = lastValue + '\n' + infoLine;
                }
                softwareObject[lastKey] = lastValue;
            }
        });
        softwareList.push(softwareObject);
    });
    return softwareList;
};

module.exports = exports = {
    getAllInstalledSoftwareSync: getAllInstalledSoftwareSync
}