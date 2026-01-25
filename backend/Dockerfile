# Build stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Copy published app from build container
COPY . .

# Expose port (ajuste se necessário)
EXPOSE 8080

# Start app
ENTRYPOINT ["dotnet", "HRManagementAPI.dll"]
