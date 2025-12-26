FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

ENV HOST=0.0.0.0
ENV PORT=5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
