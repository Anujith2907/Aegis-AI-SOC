# Use official lightweight Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies needed for compiling some packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port (Render/Cloud uses PORT env var)
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Command to run uvicorn server
CMD ["python", "app/main.py"]
