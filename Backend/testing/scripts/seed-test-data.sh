#!/bin/bash

###############################################################################
# Genesis Backend - Seed Test Data
# Usage: ./seed-test-data.sh
# Creates comprehensive test data for demo and testing purposes
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Genesis Backend - Seed Test Data${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Create test images
echo -e "${YELLOW}Creating test files...${NC}"
mkdir -p "$SCRIPT_DIR/../uploads/verification"
echo "JFIF" > "$SCRIPT_DIR/../uploads/verification/test-meter.jpg"
echo "JFIF" > "$SCRIPT_DIR/../uploads/verification/test-composter.jpg"
echo "Test Document" > "$SCRIPT_DIR/../sample-data/test-doc.txt"
echo -e "${GREEN}✓ Test files created${NC}\n"

# Helper function to extract tokens
get_token() {
    local response="$1"
    local field="$2"
    echo "$response" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4
}

get_id() {
    local response="$1"
    echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

###############################################################################
# Create Admin Token
###############################################################################

echo -e "${YELLOW}1. Getting admin credentials...${NC}"
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"DABS","password":"123"}')
ADMIN_TOKEN=$(get_token "$ADMIN_RESP" "token")
echo -e "${GREEN}✓ Admin token obtained${NC}\n"

###############################################################################
# Create Societies
###############################################################################

echo -e "${YELLOW}2. Creating societies...${NC}"

SOCIETIES=(
    "Green Valley|manager@greenvalley.in|19.0760|72.8777|500000"
    "Sunshine Heights|manager@sunshine.in|19.0180|72.8500|750000"
    "Ocean View|manager@oceanview.in|19.1200|72.9100|600000"
    "Garden City|manager@gardencity.in|19.0500|72.8800|450000"
    "Metro Towers|manager@metrotowers.in|19.1000|72.8900|800000"
)

for society in "${SOCIETIES[@]}"; do
    IFS='|' read -r name email lat long tax <<< "$society"
    echo -e "  ${YELLOW}Creating $name...${NC}"
    
    RESP=$(curl -s -X POST "$BASE_URL/api/society/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Manager\",
            \"email\": \"$email\",
            \"password\": \"password123\",
            \"phone\": \"9876543210\",
            \"societyName\": \"$name\",
            \"designation\": \"manager\",
            \"employeeId\": \"EMP-001\",
            \"address\": {
                \"street\": \"123 Main Road\",
                \"city\": \"Mumbai\",
                \"state\": \"Maharashtra\",
                \"pincode\": \"400001\"
            },
            \"geoLockCoordinates\": {
                \"latitude\": $lat,
                \"longitude\": $long
            },
            \"propertyTaxEstimate\": $tax,
            \"electricMeterSerialNumber\": \"EM-2024-001\"
        }")
    
    if echo "$RESP" | grep -q '"success":true'; then
        SOCIETY_ID=$(get_id "$RESP")
        echo -e "    ${GREEN}✓ Registered: $SOCIETY_ID${NC}"
        
        # Admin approves
        APPROVE_RESP=$(curl -s -X PUT "$BASE_URL/admin/approve-society/$SOCIETY_ID" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        echo -e "    ${GREEN}✓ Approved${NC}"
        
        # Login to get token and account ID
        LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/society/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\",\"password\":\"password123\"}")
        
        TOKEN=$(get_token "$LOGIN_RESP" "token")
        ACCOUNT_ID=$(get_token "$LOGIN_RESP" "societyAccountId")
        
        # Store for later use
        echo "$name|$TOKEN|$ACCOUNT_ID" >> "$SCRIPT_DIR/../sample-data/societies.txt"
    else
        echo -e "    ${RED}✗ Failed: $RESP${NC}"
    fi
done

echo -e "${GREEN}✓ Societies created${NC}\n"

###############################################################################
# Create BMC Officers
###############################################################################

echo -e "${YELLOW}3. Creating BMC Officers...${NC}"

OFFICERS=(
    "John Officer|officer1@bmc.gov.in"
    "Jane Smith|officer2@bmc.gov.in"
    "Bob Johnson|officer3@bmc.gov.in"
)

for officer in "${OFFICERS[@]}"; do
    IFS='|' read -r name email <<< "$officer"
    echo -e "  ${YELLOW}Creating $name...${NC}"
    
    RESP=$(curl -s -X POST "$BASE_URL/api/officer/register" \
        -F "name=$name" \
        -F "email=$email" \
        -F "password=password123" \
        -F "phone=9876543210" \
        -F "documentType=Aadhar" \
        -F "document=@$SCRIPT_DIR/../sample-data/test-doc.txt")
    
    if echo "$RESP" | grep -q '"success":true'; then
        OFFICER_ID=$(get_id "$RESP")
        echo -e "    ${GREEN}✓ Registered: $OFFICER_ID${NC}"
        
        # Admin approves
        APPROVE_RESP=$(curl -s -X PUT "$BASE_URL/admin/approve-officer/$OFFICER_ID" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        echo -e "    ${GREEN}✓ Approved${NC}"
        
        # Login
        LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/officer/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\",\"password\":\"password123\"}")
        
        TOKEN=$(get_token "$LOGIN_RESP" "token")
        echo "$name|$email|$TOKEN" >> "$SCRIPT_DIR/../sample-data/officers.txt"
        echo -e "    ${GREEN}✓ Token obtained${NC}"
    fi
done

echo -e "${GREEN}✓ Officers created${NC}\n"

###############################################################################
# Create Residents
###############################################################################

echo -e "${YELLOW}4. Creating Residents...${NC}"

RESIDENTS=(
    "Alice Resident|alice@greenvalley.in|Green Valley|A-101|Tower A"
    "Bob Resident|bob@greenvalley.in|Green Valley|B-205|Tower B"
    "Carol Resident|carol@sunshine.in|Sunshine Heights|C-301|Tower C"
)

for resident in "${RESIDENTS[@]}"; do
    IFS='|' read -r name email society flat tower <<< "$resident"
    echo -e "  ${YELLOW}Creating $name...${NC}"
    
    RESP=$(curl -s -X POST "$BASE_URL/api/resident/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"email\": \"$email\",
            \"password\": \"password123\",
            \"phone\": \"9876543210\",
            \"societyName\": \"$society\",
            \"flatNumber\": \"$flat\",
            \"buildingName\": \"$tower\"
        }")
    
    if echo "$RESP" | grep -q '"success":true'; then
        TOKEN=$(get_token "$RESP" "token")
        echo "$name|$email|$TOKEN" >> "$SCRIPT_DIR/../sample-data/residents.txt"
        echo -e "    ${GREEN}✓ Created${NC}"
    fi
done

echo -e "${GREEN}✓ Residents created${NC}\n"

###############################################################################
# Create Customers
###############################################################################

echo -e "${YELLOW}5. Creating Customers...${NC}"

CUSTOMERS=(
    "David Customer|david@email.com"
    "Eve Customer|eve@email.com"
)

for customer in "${CUSTOMERS[@]}"; do
    IFS='|' read -r name email <<< "$customer"
    echo -e "  ${YELLOW}Creating $name...${NC}"
    
    RESP=$(curl -s -X POST "$BASE_URL/api/customer/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"email\": \"$email\",
            \"password\": \"password123\",
            \"phone\": \"9876543210\",
            \"addresses\": [{
                \"street\": \"456 Park Street\",
                \"city\": \"Mumbai\",
                \"state\": \"Maharashtra\",
                \"pincode\": \"400002\",
                \"isDefault\": true
            }]
        }")
    
    if echo "$RESP" | grep -q '"success":true'; then
        TOKEN=$(get_token "$RESP" "token")
        echo "$name|$email|$TOKEN" >> "$SCRIPT_DIR/../sample-data/customers.txt"
        echo -e "    ${GREEN}✓ Created${NC}"
    fi
done

echo -e "${GREEN}✓ Customers created${NC}\n"

###############################################################################
# Submit Verification Reports
###############################################################################

echo -e "${YELLOW}6. Submitting verification reports...${NC}"

# Read first society
if [ -f "$SCRIPT_DIR/../sample-data/societies.txt" ]; then
    while IFS='|' read -r name token account_id; do
        echo -e "  ${YELLOW}Submitting report for $name...${NC}"
        
        RESP=$(curl -s -X POST "$BASE_URL/api/verification/report/upload" \
            -H "Authorization: Bearer $token" \
            -F "societyAccountId=$account_id" \
            -F "meter_image=@$SCRIPT_DIR/../uploads/verification/test-meter.jpg" \
            -F "composter_image=@$SCRIPT_DIR/../uploads/verification/test-composter.jpg" \
            -F "gpsLatitude=19.0760" \
            -F "gpsLongitude=72.8777")
        
        if echo "$RESP" | grep -q '"success":true'; then
            REPORT_ID=$(get_id "$RESP")
            echo "$name|$REPORT_ID" >> "$SCRIPT_DIR/../sample-data/reports.txt"
            echo -e "    ${GREEN}✓ Report: $REPORT_ID${NC}"
            
            # Process verification
            PROC_RESP=$(curl -s -X POST "$BASE_URL/api/verification/detect" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "{\"reportId\":\"$REPORT_ID\"}")
            
            STATUS=$(echo "$PROC_RESP" | grep -o '"verificationStatus":"[^"]*"' | cut -d'"' -f4)
            echo -e "    ${GREEN}✓ Processed: $STATUS${NC}"
        fi
    done < "$SCRIPT_DIR/../sample-data/societies.txt"
fi

echo -e "${GREEN}✓ Verification reports submitted${NC}\n"

###############################################################################
# Summary
###############################################################################

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Seed Complete!${NC}"
echo -e "${BLUE}======================================${NC}\n"

echo "Test Data Summary:"
echo "------------------"
echo -e "${GREEN}Admin:${NC}  DABS / 123"
echo -e "${GREEN}Officers:${NC} officer1@bmc.gov.in / password123"
echo "           officer2@bmc.gov.in / password123"
echo "           officer3@bmc.gov.in / password123"
echo -e "${GREEN}Societies:${NC} Multiple societies created"
echo -e "${GREEN}Residents:${NC} alice@greenvalley.in / password123"
echo "            bob@greenvalley.in / password123"
echo -e "${GREEN}Customers:${NC} david@email.com / password123"
echo "             eve@email.com / password123"
echo ""

echo "Test Data Files:"
echo "----------------"
[ -f "$SCRIPT_DIR/../sample-data/societies.txt" ] && echo "- societies.txt"
[ -f "$SCRIPT_DIR/../sample-data/officers.txt" ] && echo "- officers.txt"
[ -f "$SCRIPT_DIR/../sample-data/residents.txt" ] && echo "- residents.txt"
[ -f "$SCRIPT_DIR/../sample-data/customers.txt" ] && echo "- customers.txt"
[ -f "$SCRIPT_DIR/../sample-data/reports.txt" ] && echo "- reports.txt"
echo ""

echo -e "${GREEN}Run ./test-all.sh to execute comprehensive tests!${NC}\n"
