# Koristimo Python image
FROM python:3.11-slim

# Postavimo radni folder unutar kontejnera
WORKDIR /app

# Kopiramo fajl sa zavisnostima i instaliramo
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Kopiramo ceo kod u kontejner
COPY . .

# Otvaramo port na kojem Flask radi
EXPOSE 5000

# Komanda za pokretanje Flask aplikacije
CMD ["python", "app.py"]
