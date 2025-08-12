#!/bin/bash

echo "================================="
echo " Medication Reminder API Setup"
echo "================================="

echo ""
echo "1. Creando entorno virtual..."
python3 -m venv venv

echo ""
echo "2. Activando entorno virtual..."
source venv/bin/activate

echo ""
echo "3. Actualizando pip..."
python -m pip install --upgrade pip

echo ""
echo "4. Instalando dependencias..."
pip install -r requirements.txt

echo ""
echo "5. Copiando archivo de configuración..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "¡IMPORTANTE! Edita el archivo .env con tus configuraciones antes de continuar."
    echo "Especialmente:"
    echo "- DATABASE_URL"
    echo "- SECRET_KEY"
    echo "- REDIS_URL"
    echo ""
    read -p "Presiona Enter para continuar..."
fi

echo ""
echo "6. Creando directorio de logs..."
mkdir -p logs

echo ""
echo "7. Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "8. Creando superusuario..."
python manage.py createsuperuser

echo ""
echo "9. Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo ""
echo "================================="
echo " Setup completado exitosamente!"
echo "================================="
echo ""
echo "Para iniciar el servidor:"
echo "  python manage.py runserver"
echo ""
echo "Para iniciar Celery worker:"
echo "  celery -A config worker -l info"
echo ""
echo "Para iniciar Celery beat:"
echo "  celery -A config beat -l info"
echo ""
echo "Documentación API: http://localhost:8000/api/docs/"
echo "Panel Admin: http://localhost:8000/admin/"
echo ""
