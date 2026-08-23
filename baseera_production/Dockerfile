FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src


COPY ["backend/BaseeraAPI.csproj", "./"]
RUN dotnet restore "BaseeraAPI.csproj"


COPY backend/ .
RUN dotnet publish "BaseeraAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BaseeraAPI.dll"]