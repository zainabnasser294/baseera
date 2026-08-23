FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["baseera_production/backend/BaseeraAPI.csproj", "baseera_production/backend/"]
RUN dotnet restore "baseera_production/backend/BaseeraAPI.csproj"

COPY . .
WORKDIR "/src/baseera_production/backend"
RUN dotnet publish "BaseeraAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BaseeraAPI.dll"]