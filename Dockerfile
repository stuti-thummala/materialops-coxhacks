ARG PYTHON_VERSION=3.13
ARG DOCKER_REGISTRY=docker.io/library
FROM ${DOCKER_REGISTRY}/python:${PYTHON_VERSION}-slim-bookworm AS pre-commit

COPY pre-commit-requirements.txt .

RUN apt-get update -y && \
    apt-get install -y git && \
    python3 -m pip install --upgrade pip && \
    pip3 install -r pre-commit-requirements.txt

FROM pre-commit

COPY profiles /profiles

WORKDIR /pre-commit

RUN git init . && \
    for fname in $(find /profiles/ -maxdepth 2 -mindepth 2 -type f -name *.yaml); do \
      echo "Processing profile ${fname}"; \
      HOME=/pre-commit pre-commit install-hooks --config "${fname}"; \
    done && \
    chmod -R 777 /pre-commit

COPY pre-commit-run /usr/local/bin/

WORKDIR /app

CMD [ "/usr/local/bin/pre-commit-run" ]
