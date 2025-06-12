#!/bin/bash

echo "🔄 Reseteando RanchOS para ver el Onboarding..."

# Crear archivo HTML temporal para limpiar localStorage
cat > clear-storage.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Reset RanchOS</title>
</head>
<body>
    <h1>Limpiando datos de RanchOS...</h1>
    <script>
        // Limpiar todo el localStorage
        localStorage.clear();
        
        // Específicamente limpiar el store de Zustand
        localStorage.removeItem('ranchos-storage');
        localStorage.removeItem('onboarding-step');
        localStorage.removeItem('onboarding-data');
        
        console.log('✅ Datos limpiados');
        document.body.innerHTML += '<p>✅ Datos limpiados. <a href="http://localhost:3001">Volver a RanchOS</a></p>';
    </script>
</body>
</html>
HTML

echo "📝 Abre clear-storage.html en tu navegador para limpiar los datos"
echo "🌐 O ejecuta esto en la consola del navegador:"
echo ""
echo "localStorage.clear();"
echo "location.reload();"
echo ""

# Abrir en el navegador
open clear-storage.html

# Limpiar después de 5 segundos
sleep 5
rm clear-storage.html
