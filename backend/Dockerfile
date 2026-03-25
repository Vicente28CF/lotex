FROM python:3.11-slim

# Evita archivos .pyc y habilita logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema necesarias para psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Instala dependencias Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copia el código
COPY . .

EXPOSE 8000