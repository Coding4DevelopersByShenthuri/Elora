# Django backend Dockerfile
FROM python:3.11-slim

# Install system dependencies including MySQL client libraries
RUN apt-get update && apt-get install -y \
    curl \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
# Install mysqlclient for Linux (Django's MySQL backend requires it)
RUN pip install --no-cache-dir mysqlclient==2.2.0
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose Django default port
EXPOSE 8000

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]

# Run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
