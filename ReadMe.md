# How To Start

## Pre-requirements

You have to set the .env.local in [./website](website\EXAMLPLE.env.local)<br>
An ExampleEnv is provided<br>
For local deployment you have to set ```NEXT_PUBLIC_API_IP="https://localhost/api"```
(Google maps API key is provided in the Kurzbeschreibung.pdf)<br>
**IMPORTANT:** The .env.local has to be called .env.local and not .env<br>

All other IPs/Ports can be set in the docker-compose.yml<br>
For references look at the .env files in the subfolders<br>
## Start

After setting the .env.local you can start the project with<br>
```docker compose -f "docker-compose.yml" up -d --build```

## After Start

You have to create the admin:admin manually by accessing [this link](https://localhost/api/admin/create) or with this URL (in localhost envoirement):<br>
```https://localhost/api/admin/create```<br>
**Important:** YOU HAVE TO DO THIS IN ORDER TO GET THE WEBSCRAPER RUNNING.<br>It will wait 1 minute, then 15. If you want to see the speed cameras instant in the frontend you got this 1 minute time window. Otherwise you have to wait for the next "scraping cicle".<br>

After that you can login with admin:admin or with the specified credentials of the admin account inside the docker-compose.yml <br>
**Note:** If you want to change the default admin credentials you also have to change them inside the envoirement variables for the scraper service inside the docker-compose.yml<br>

## Known Issues

Problem: You can't search for petrol stations along a route greater than around 50km<br>
Reason: This is because the [Tankerkönig Api](https://creativecommons.tankerkoenig.de/) has a request limit of 5 per minute for free tier<br>

Problem: Ceritficate not trusted<br>
Reason: Not using subdomains or real domains where the certificate can be verified because of easier replication on other systems (can be changed if the server has a domain)<br>

Problem: The map on the website pans to Userlocation on component refresh<br>
Reason: Not exactly sure how this can be fixed but it is not a fatal issue<br>
