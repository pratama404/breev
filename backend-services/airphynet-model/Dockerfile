FROM python:3.9-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install CPU-only PyTorch first to save space/time
RUN pip install --no-cache-dir torch==2.1.2 --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make start script executable
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]