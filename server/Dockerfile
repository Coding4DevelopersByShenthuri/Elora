FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies for mysqlclient and building Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      default-libmysqlclient-dev \
      pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . .

# Create a non-root user to run the app
RUN useradd -ms /bin/bash django && \
    chown -R django:django /app
USER django

ENV DJANGO_SETTINGS_MODULE=crud.settings

# By default, run gunicorn on port 8000
CMD ["gunicorn", "crud.wsgi:application", "--bind", "0.0.0.0:8000"]


