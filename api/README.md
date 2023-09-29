# Development
Install [Python 3.11.5](https://www.python.org/downloads/release/python-3115/)

Open the API Directory and install the requierments with this command:
```
pip install -r ./requirements.txt
```
Fill the .env file with all the necessary Information and run it from vscode with the .vscode launch configuration.

# Deployment
Build the Container yourself or use the DockerCompose at the Root of this Project

# Initial Admin Account
To get the admin account make a get request to the API on this address:<br>
http://your-ip:port/admin/create<br>
Note: The admin account will be generated with the data passed in the ENV of the DockerCompose and use the not obfuscated password for the admin in the ENV.