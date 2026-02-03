# Task: Add port configuration to env to allow other ports in deployment

Currently the application is running on port 3000. We should add a configuration to the environment variables to allow us to change the port in the future.

In production, we are using a reverse proxy (nginx) to route traffic to the application to port 3000, but we need a way to allows us to modify the port of the application deployed with docker in case of conflict with other services in the server.

Analyze the current configuration and propose a solution.

Do not implement the solution. Just propose it.