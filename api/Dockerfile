# Use an official Python runtime as a parent image
FROM python:3.9

ENV PORT 8000

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir /api_data

# Copy the current directory contents into the container at /app
COPY . /app

EXPOSE $PORT

# Start the app
CMD gunicorn --bind 0.0.0.0:$PORT api.wsgi --log-level debug --error-logfile /api_data/server.log --timeout 60
