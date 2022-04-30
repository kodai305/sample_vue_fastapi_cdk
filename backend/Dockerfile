FROM --platform=linux/amd64 python:3.9.2-buster

WORKDIR /app
COPY ./app /app

ENV LANG C.UTF-8
ENV TZ Asia/Tokyo

# pip installs
COPY ./requirements.txt requirements.txt
RUN pip install -r requirements.txt


# FastAPIの起動
CMD ["python3.9", "/app/main.py"]