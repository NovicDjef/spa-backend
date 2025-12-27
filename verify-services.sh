#!/bin/bash

# Démarrer le serveur
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 7

echo "======================================"
echo "VÉRIFICATION DU SYSTÈME SPA RENAISSANCE"
echo "======================================"
echo ""

echo "1. Nombre de catégories:"
curl -s "http://localhost:5003/api/public/services" | jq '.data | length'
echo ""

echo "2. Noms des catégories:"
curl -s "http://localhost:5003/api/public/services" | jq -r '.data[].name'
echo ""

echo "3. Nombre de services par catégorie:"
curl -s "http://localhost:5003/api/public/services" | jq -r '.data[] | "\(.name): \(.services | length) services"'
echo ""

echo "4. Total de tous les services:"
curl -s "http://localhost:5003/api/public/services" | jq '[.data[].services[]] | length'
echo ""

echo "5. Services Médico-Esthétique:"
curl -s "http://localhost:5003/api/public/services" | jq -r '.data[] | select(.name=="MEDICO_ESTHETIQUE") | .services[].name'
echo ""

echo "6. Abonnements Gym:"
curl -s "http://localhost:5003/api/public/gym-memberships" | jq -r '.data[] | "\(.name): \(.price)$"'
echo ""

echo "7. Forfaits/Packages:"
curl -s "http://localhost:5003/api/public/packages" | jq -r '.data[] | "\(.name): \(.price)$"'
echo ""

# Tuer le serveur
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "======================================"
echo "VÉRIFICATION TERMINÉE"
echo "======================================"
