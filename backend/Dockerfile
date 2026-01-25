
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish HRManagementAPI.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Copia arquivos de configuração explicitamente (garante que não falte nada)
COPY --from=build /src/appsettings.json ./appsettings.json
COPY --from=build /src/appsettings.Production.json ./appsettings.Production.json
EXPOSE 8080
ENTRYPOINT ["dotnet", "HRManagementAPI.dll"]
