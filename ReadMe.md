# How To Start

## Pre-requirements

You have to set the .env.local in /website<br>
An ExampleEnv is provided<br>
For local deployment you have to set ```NEXT_PUBLIC_API_IP="https://localhost/api"```
IMPORTANT: The .env.local has to be called .env.local and not .env<br>
(Google maps API key is provided in the Kurzbeschreibung.pdf)

## Start

```docker compose -f "docker-compose.yml" up -d --build```

## After Start

You have to create the admin:admin manually by accessing<br>
```https://localhost/api/admin/create```
After that you can login with admin:admin. <br>
YOU HAVE TO DO THIS IN ORDER TO GET THE WEBSCRAPER RUNNING