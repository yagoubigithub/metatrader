import numpy
import MetaTrader5 as mt5
from flask import Flask, request
from flask_cors import CORS
import psutil


app = Flask(__name__)
CORS(app)


# display data on the MetaTrader 5 package
# print("MetaTrader5 package author: ",mt5.__author__)


# # establish MetaTrader 5 connection to a specified trading account
# if not mt5.initialize(login=10000491021, server="MetaQuotes-Demo",password="+5TvBzIm"):
#     #print("initialize() failed, error code =",mt5.last_error())
#     quit()
 


@app.route("/init")
def init():
    mt5.initialize()
    return "init"



@app.route("/version")
def version():
    return "MetaTrader5 package version: " + mt5.__version__


@app.route("/shutdown")
def shutdown():
    # shut down connection to the MetaTrader 5 terminal
    mt5.shutdown()
    return "MetaTrader5 shutdown" 



@app.route("/check")
def check():
    print(mt5.account_info())
    return "MetaTrader5 package version: " + mt5.__version__

@app.route("/login", methods=["POST"])
def login():

   
    params = request.get_json()
    

    try:
   #your code here
        if params['InstallLocation']:
            



            if params['InstallLocation'].find("5") > -1:
            

                print(params)
            
            

                if not mt5.initialize(login=int(params['account_login']), password=params['account_password'], server=params['account_server']):
                    print("initialize() failed, error code =",mt5.last_error())
                    #quit()
                authorized=mt5.login(params['account_login'], password=params['account_password'], server=params['account_server'])

                if authorized:
                    
                    
                    account_info_dict = mt5.account_info()._asdict()
                    for prop in account_info_dict:
                        print("  {}={}".format(prop, account_info_dict[prop]))
                else:
                    print("failed to connect at account #{}, error code: {}".format(params['account_login'], mt5.last_error()))


                return ""
            
            else :
                return "false"
        else:
            return "false"

    except KeyError:
        return "false"


   


@app.route("/islogin")
def islogin():
    name = request.args.get('name')
    processId = int(request.args.get('processId'))
    proc = psutil.Process(processId)
    if name.find("5") > -1:

        if proc.status() == psutil.STATUS_RUNNING:


            # Check connection status
            connected = mt5.initialize(timeout=5)  # Set a timeout to avoid waiting indefinitely
            print(connected)
            if connected :
                return "true"
            else:
                return "false"
    else:
        
        


        if proc.status() == psutil.STATUS_RUNNING:
        # Zombie process!
            return "true"
        else:
            return "false"









'''
Name     : yagoubi abdelkader
Type     : Forex Hedged USD
Server   : MetaQuotes-Demo
Login    : 10000491021
Password : +5TvBzIm
Investor : -c2uOzOm



////////////////////


Name     : yagoubi abdelkader
Type     : Forex Hedged USD
Server   : MetaQuotes-Demo
Login    : 80091852
Password : N*SbF3Mg
Investor : 5e*dUdVt



//////////////////////////


mt4

login : 735016
password : li6zvxj
Investor: 1szxhoi
serveur : IG-DEMO
'''


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port="5000")