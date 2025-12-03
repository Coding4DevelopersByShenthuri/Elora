#!/bin/bash

# Production Diagnostic Script for Elora
# Run this on your production server to diagnose login/registration issues

echo "=========================================="
echo "Elora Production Diagnostic Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Use: bash diagnose_production.sh${NC}"
   exit 1
fi

PROJECT_DIR="/home/ubuntu/Elora"
SERVER_DIR="$PROJECT_DIR/server"
CLIENT_DIR="$PROJECT_DIR/client"

echo "1. Checking project directory..."
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✓${NC} Project directory exists: $PROJECT_DIR"
else
    echo -e "${RED}✗${NC} Project directory not found: $PROJECT_DIR"
    exit 1
fi

echo ""
echo "2. Checking backend service status..."
if systemctl is-active --quiet elora; then
    echo -e "${GREEN}✓${NC} Elora service is running"
else
    echo -e "${RED}✗${NC} Elora service is NOT running"
    echo "   Run: sudo systemctl start elora"
fi

echo ""
echo "3. Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx is running"
else
    echo -e "${RED}✗${NC} Nginx is NOT running"
    echo "   Run: sudo systemctl start nginx"
fi

echo ""
echo "4. Checking MySQL status..."
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✓${NC} MySQL is running"
else
    echo -e "${RED}✗${NC} MySQL is NOT running"
    echo "   Run: sudo systemctl start mysql"
fi

echo ""
echo "5. Checking .env file..."
if [ -f "$SERVER_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check critical settings
    echo ""
    echo "   Checking critical settings:"
    
    if grep -q "SECRET_KEY=" "$SERVER_DIR/.env" && ! grep -q "django-insecure" "$SERVER_DIR/.env"; then
        echo -e "   ${GREEN}✓${NC} SECRET_KEY is set (not default)"
    else
        echo -e "   ${RED}✗${NC} SECRET_KEY is missing or using default"
    fi
    
    if grep -q "DEBUG=False" "$SERVER_DIR/.env"; then
        echo -e "   ${GREEN}✓${NC} DEBUG is False"
    else
        echo -e "   ${YELLOW}⚠${NC} DEBUG might be True (check .env)"
    fi
    
    if grep -q "54.179.120.126" "$SERVER_DIR/.env"; then
        echo -e "   ${GREEN}✓${NC} Production IP in ALLOWED_HOSTS or CORS"
    else
        echo -e "   ${YELLOW}⚠${NC} Production IP might not be in ALLOWED_HOSTS"
    fi
    
    echo ""
    echo "   Email configuration:"
    if grep -q "EMAIL_HOST_USER=" "$SERVER_DIR/.env" && ! grep -q "EMAIL_HOST_USER=$" "$SERVER_DIR/.env"; then
        EMAIL_USER=$(grep "EMAIL_HOST_USER=" "$SERVER_DIR/.env" | cut -d'=' -f2)
        if [ -n "$EMAIL_USER" ]; then
            echo -e "   ${GREEN}✓${NC} EMAIL_HOST_USER is set"
        else
            echo -e "   ${RED}✗${NC} EMAIL_HOST_USER is empty"
        fi
    else
        echo -e "   ${RED}✗${NC} EMAIL_HOST_USER is not set"
    fi
    
    if grep -q "EMAIL_HOST_PASSWORD=" "$SERVER_DIR/.env" && ! grep -q "EMAIL_HOST_PASSWORD=$" "$SERVER_DIR/.env"; then
        echo -e "   ${GREEN}✓${NC} EMAIL_HOST_PASSWORD is set"
    else
        echo -e "   ${RED}✗${NC} EMAIL_HOST_PASSWORD is not set"
        echo -e "   ${YELLOW}   This will prevent email verification!${NC}"
    fi
    
    if grep -q "DEFAULT_FROM_EMAIL=" "$SERVER_DIR/.env" && ! grep -q "DEFAULT_FROM_EMAIL=$" "$SERVER_DIR/.env"; then
        echo -e "   ${GREEN}✓${NC} DEFAULT_FROM_EMAIL is set"
    else
        echo -e "   ${RED}✗${NC} DEFAULT_FROM_EMAIL is not set"
    fi
    
    echo ""
    echo "   Database configuration:"
    if grep -q "DATABASE_NAME=" "$SERVER_DIR/.env"; then
        DB_NAME=$(grep "DATABASE_NAME=" "$SERVER_DIR/.env" | cut -d'=' -f2)
        echo -e "   ${GREEN}✓${NC} DATABASE_NAME: $DB_NAME"
    else
        echo -e "   ${RED}✗${NC} DATABASE_NAME is not set"
    fi
    
    if grep -q "DATABASE_USER=" "$SERVER_DIR/.env"; then
        DB_USER=$(grep "DATABASE_USER=" "$SERVER_DIR/.env" | cut -d'=' -f2)
        echo -e "   ${GREEN}✓${NC} DATABASE_USER: $DB_USER"
    else
        echo -e "   ${RED}✗${NC} DATABASE_USER is not set"
    fi
    
    echo ""
    echo "   CORS configuration:"
    if grep -q "CORS_ALLOWED_ORIGINS=" "$SERVER_DIR/.env"; then
        CORS_ORIGINS=$(grep "CORS_ALLOWED_ORIGINS=" "$SERVER_DIR/.env" | cut -d'=' -f2)
        if echo "$CORS_ORIGINS" | grep -q "54.179.120.126"; then
            echo -e "   ${GREEN}✓${NC} CORS includes production IP"
        else
            echo -e "   ${YELLOW}⚠${NC} CORS might not include production IP"
        fi
    else
        echo -e "   ${YELLOW}⚠${NC} CORS_ALLOWED_ORIGINS not found"
    fi
else
    echo -e "${RED}✗${NC} .env file not found at $SERVER_DIR/.env"
    echo "   Create it from env.docker.template"
fi

echo ""
echo "6. Testing API health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://54.179.120.126/api/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} API health check passed (HTTP $HEALTH_RESPONSE)"
    curl -s http://54.179.120.126/api/health | head -c 100
    echo ""
else
    echo -e "${RED}✗${NC} API health check failed (HTTP $HEALTH_RESPONSE)"
    echo "   Check if backend is running and Nginx is configured correctly"
fi

echo ""
echo "7. Checking recent backend logs (last 20 lines)..."
if [ -f "$SERVER_DIR/debug.log" ]; then
    echo "   Recent errors from debug.log:"
    tail -n 20 "$SERVER_DIR/debug.log" | grep -i "error\|exception\|traceback" | tail -n 5 || echo "   No recent errors found"
else
    echo -e "   ${YELLOW}⚠${NC} debug.log not found"
fi

echo ""
echo "8. Checking Gunicorn logs..."
if systemctl is-active --quiet elora; then
    echo "   Recent errors from journalctl:"
    sudo journalctl -u elora -n 20 --no-pager | grep -i "error\|exception\|traceback" | tail -n 5 || echo "   No recent errors found"
else
    echo -e "   ${YELLOW}⚠${NC} Service not running, cannot check logs"
fi

echo ""
echo "9. Checking database connection..."
cd "$SERVER_DIR" || exit 1
if [ -d "venv" ]; then
    source venv/bin/activate
    DB_CHECK=$(python manage.py check --database default 2>&1)
    if echo "$DB_CHECK" | grep -q "System check identified no issues"; then
        echo -e "${GREEN}✓${NC} Database connection OK"
    else
        echo -e "${RED}✗${NC} Database connection issues:"
        echo "$DB_CHECK" | head -n 10
    fi
    deactivate
else
    echo -e "${YELLOW}⚠${NC} Virtual environment not found"
fi

echo ""
echo "10. Checking frontend build..."
if [ -d "$CLIENT_DIR/dist" ]; then
    if [ -f "$CLIENT_DIR/dist/index.html" ]; then
        echo -e "${GREEN}✓${NC} Frontend is built (dist/index.html exists)"
    else
        echo -e "${RED}✗${NC} Frontend build incomplete (index.html missing)"
    fi
else
    echo -e "${RED}✗${NC} Frontend not built (dist directory missing)"
    echo "   Run: cd $CLIENT_DIR && npm run build"
fi

echo ""
echo "11. Checking frontend API configuration..."
if [ -f "$CLIENT_DIR/.env.production" ]; then
    if grep -q "VITE_API_URL" "$CLIENT_DIR/.env.production"; then
        API_URL=$(grep "VITE_API_URL" "$CLIENT_DIR/.env.production" | cut -d'=' -f2)
        echo -e "${GREEN}✓${NC} VITE_API_URL is set: $API_URL"
    else
        echo -e "${YELLOW}⚠${NC} VITE_API_URL not in .env.production"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.production not found"
    echo "   Create it with: VITE_API_URL=http://54.179.120.126/api"
fi

echo ""
echo "=========================================="
echo "Diagnostic Summary"
echo "=========================================="
echo ""
echo "Most Common Issues:"
echo "1. Email not configured → Users can't verify accounts → Can't login"
echo "2. CORS not configured → Frontend can't reach backend"
echo "3. Frontend API URL wrong → Frontend points to wrong backend"
echo "4. Backend service down → 502 errors"
echo ""
echo "Next Steps:"
echo "1. Review the issues above"
echo "2. Check PRODUCTION_TROUBLESHOOTING.md for detailed solutions"
echo "3. Fix email configuration (most critical)"
echo "4. Restart services: sudo systemctl restart elora nginx"
echo ""
echo "For detailed logs:"
echo "  sudo journalctl -u elora -f"
echo "  tail -f $SERVER_DIR/debug.log"
echo ""

