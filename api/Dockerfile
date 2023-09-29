FROM python:3.11.5-alpine3.18

COPY . /opt/api/

WORKDIR /opt/api/

RUN pip install -r ./requirements.txt

EXPOSE 23451

ENTRYPOINT ["python","./app/main.py"]  